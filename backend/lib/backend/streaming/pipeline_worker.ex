defmodule Backend.Streaming.PipelineWorker do
  use GenServer, restart: :transient
  require Logger

  alias Backend.Repo
  alias Backend.Streaming.Destination
  alias Backend.Streaming.StreamKey

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

    # Ensure GStreamer is installed
    gst_path = System.find_executable("gst-launch-1.0")

    if is_nil(gst_path) do
      Logger.error("gst-launch-1.0 executable not found in system path.")
      update_destination_status(destination_id, "error")
      {:stop, :gst_not_found}
    else
      # Load destination and stream key details
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
            "d.audio",
            "!",
            "aacparse",
            "!",
            "m."
          ]
        else
          # RTMP Target: Direct FLV muxing
          [
            "rtmpsrc",
            "location=#{ingest_url}",
            "!",
            "flvdemux",
            "!",
            "flvmux",
            "!",
            "rtmpsink",
            "location=#{target_url}"
          ]
        end

      Logger.info("Launching GStreamer pipeline: #{gst_path} #{Enum.join(args, " ")}")

      # Start external GStreamer process
      port =
        Port.open(
          {:spawn_executable, gst_path},
          [:binary, :exit_status, args: args]
        )

      # Update status in DB to streaming
      update_destination_status(destination_id, "streaming")

      {:ok, %{destination_id: destination_id, port: port}}
    end
  end

  @impl true
  def handle_info({port, {:exit_status, status}}, %{port: port} = state) do
    Logger.warning(
      "GStreamer pipeline process for destination #{state.destination_id} exited with status #{status}"
    )

    db_status = if status == 0, do: "stopped", else: "error"
    update_destination_status(state.destination_id, db_status)
    {:stop, :normal, state}
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

    # Close port safely
    if Map.has_key?(state, :port) and is_port(state.port) do
      try do
        case Port.info(state.port, :os_pid) do
          {:os_pid, pid} ->
            Logger.info("Sending SIGKILL to GStreamer OS process PID #{pid}")
            System.cmd("kill", ["-9", to_string(pid)])

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
