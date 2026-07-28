defmodule Backend.Streaming.PipelineWorker do
  use GenServer, restart: :transient
  require Logger

  alias Backend.Repo
  alias Backend.Streaming.Destination
  alias Backend.Streaming.StreamKey

  @max_retries 5
  @base_backoff_ms 2_000

  def start_link(destination_id) do
    GenServer.start_link(__MODULE__, destination_id, name: via_tuple(destination_id))
  end

  def via_tuple(destination_id) do
    {:via, Registry, {Backend.Streaming.PipelineRegistry, destination_id}}
  end

  # --- GenServer Callbacks ---

  @impl true
  def init(destination_id) do
    Logger.info("Starting GStreamer pipeline worker for destination #{destination_id}")
    state = %{destination_id: destination_id, port: nil, retries: 0}
    {:ok, state, {:continue, :launch_pipeline}}
  end

  @impl true
  def handle_continue(:launch_pipeline, state) do
    case launch_pipeline(state.destination_id) do
      {:ok, port} ->
        update_destination_status(state.destination_id, "streaming")
        {:noreply, %{state | port: port}}

      {:error, reason} ->
        Logger.error(
          "Failed to launch pipeline for destination #{state.destination_id}: #{inspect(reason)}"
        )

        update_destination_status(state.destination_id, "error")
        {:stop, :normal, state}
    end
  end

  @impl true
  def handle_info({port, {:exit_status, status}}, %{port: port} = state) do
    Logger.warning(
      "GStreamer pipeline for destination #{state.destination_id} exited with status #{status} (retry #{state.retries}/#{@max_retries})"
    )

    if status != 0 and state.retries < @max_retries do
      backoff = (@base_backoff_ms * :math.pow(2, state.retries)) |> trunc() |> min(30_000)
      Logger.info("Retrying pipeline for destination #{state.destination_id} in #{backoff}ms...")
      update_destination_status(state.destination_id, "reconnecting")
      Process.send_after(self(), :restart_pipeline, backoff)
      {:noreply, %{state | port: nil, retries: state.retries + 1}}
    else
      db_status = if status == 0, do: "stopped", else: "error"
      update_destination_status(state.destination_id, db_status)
      {:stop, :normal, state}
    end
  end

  @impl true
  def handle_info(:restart_pipeline, state) do
    case launch_pipeline(state.destination_id) do
      {:ok, port} ->
        Logger.info("Pipeline restarted for destination #{state.destination_id}")
        update_destination_status(state.destination_id, "streaming")
        {:noreply, %{state | port: port}}

      {:error, reason} ->
        Logger.error("Retry failed for destination #{state.destination_id}: #{inspect(reason)}")

        if state.retries < @max_retries do
          backoff = (@base_backoff_ms * :math.pow(2, state.retries)) |> trunc() |> min(30_000)
          Process.send_after(self(), :restart_pipeline, backoff)
          {:noreply, %{state | retries: state.retries + 1}}
        else
          update_destination_status(state.destination_id, "error")
          {:stop, :normal, state}
        end
    end
  end

  @impl true
  def handle_info({port, {:data, msg}}, %{port: port} = state) do
    Logger.warning("GStreamer output: #{String.trim(msg)}")
    {:noreply, state}
  end

  @impl true
  def handle_info(_msg, state) do
    {:noreply, state}
  end

  @impl true
  def terminate(reason, state) do
    Logger.info(
      "Terminating pipeline worker for destination #{state.destination_id} (Reason: #{inspect(reason)})"
    )

    # Graceful shutdown: SIGTERM first, then SIGKILL after 2s
    if Map.has_key?(state, :port) and not is_nil(state.port) and is_port(state.port) do
      try do
        case Port.info(state.port, :os_pid) do
          {:os_pid, pid} ->
            pid_str = to_string(pid)
            Logger.info("Sending SIGTERM to GStreamer OS process PID #{pid}")
            System.cmd("kill", ["-15", pid_str])

            # Wait briefly, then force kill if still alive
            Process.sleep(2_000)

            case System.cmd("kill", ["-0", pid_str], stderr_to_stdout: true) do
              {_, 0} ->
                Logger.info("Process #{pid} still alive, sending SIGKILL")
                System.cmd("kill", ["-9", pid_str])

              _ ->
                :ok
            end

          _ ->
            :ok
        end

        Port.close(state.port)
      rescue
        _ -> :ok
      end
    end

    :ok
  end

  # --- Private Helpers ---

  defp launch_pipeline(destination_id) do
    gst_path = System.find_executable("gst-launch-1.0")

    if is_nil(gst_path) do
      Logger.error("gst-launch-1.0 executable not found in system path.")
      {:error, :gst_not_found}
    else
      dest = Repo.get!(Destination, destination_id)
      stream_key = Repo.get!(StreamKey, dest.stream_key_id)

      ingest_url = "rtmp://iris_mediamtx:1935/live/#{stream_key.key_string}"
      target_url = dest.target_rtmp_url
      platform = String.downcase(dest.platform || "")

      args =
        if platform == "srt" or String.starts_with?(target_url, "srt://") do
          # SRT Target: Demux, parse streams, and mux into MPEG-TS
          [
            "rtmpsrc",
            "location=#{ingest_url}",
            "!",
            "flvdemux",
            "name=d",
            "d.video",
            "!",
            "h264parse",
            "!",
            "mpegtsmux",
            "name=m",
            "!",
            "srtsink",
            "uri=#{target_url}",
            "sync=false",
            "async=false",
            "d.audio",
            "!",
            "aacparse",
            "!",
            "audio/mpeg, mpegversion=4, stream-format=adts",
            "!",
            "m."
          ]
        else
          # RTMP Target: Demux with named pads to preserve audio + video
          [
            "rtmpsrc",
            "location=#{ingest_url}",
            "!",
            "flvdemux",
            "name=d",
            "d.video",
            "!",
            "queue",
            "!",
            "flvmux",
            "name=mux",
            "!",
            "rtmpsink",
            "location=#{target_url}",
            "sync=false",
            "async=false",
            "d.audio",
            "!",
            "queue",
            "!",
            "mux."
          ]
        end

      Logger.info("Launching GStreamer pipeline: #{gst_path} #{Enum.join(args, " ")}")

      port =
        Port.open(
          {:spawn_executable, gst_path},
          [:binary, :exit_status, :stderr_to_stdout, args: args, env: [{~c"GST_DEBUG", ~c"2"}]]
        )

      {:ok, port}
    end
  end

  defp update_destination_status(id, status) do
    case Repo.get(Destination, id) do
      nil ->
        :ok

      dest ->
        dest
        |> Destination.changeset(%{status: status})
        |> Repo.update()
    end
  end
end
