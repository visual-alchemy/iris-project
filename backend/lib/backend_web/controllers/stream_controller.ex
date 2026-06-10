defmodule BackendWeb.StreamController do
  use BackendWeb, :controller

  alias Backend.Streaming.StreamKey

  # Frontend calls /api/streams to get active live streams.
  # We query MediaMTX API for real-time stream data.
  def index(conn, _params) do
    import Ecto.Query

    # Fetch all active stream keys from DB
    active_keys = Backend.Repo.all(from sk in StreamKey, where: sk.status == "active")

    # Fetch real-time data from MediaMTX API
    mediamtx_paths = fetch_mediamtx_paths()

    # Query destination counts per stream_key_id
    dest_counts = Backend.Repo.all(
      from d in Backend.Streaming.Destination,
      group_by: d.stream_key_id,
      select: {d.stream_key_id, count(d.id)}
    ) |> Map.new()

    # Only return streams that are actually live (have an active RTMP connection)
    data = active_keys
    |> Enum.map(fn sk ->
      mtx_data = find_mediamtx_path(mediamtx_paths, sk.key_string)
      {sk, mtx_data}
    end)
    |> Enum.filter(fn {_sk, mtx_data} -> mtx_data != nil end)
    |> Enum.map(fn {sk, mtx_data} ->
      readers = Map.get(mtx_data, "readers") || []
      %{
        id: sk.id,
        title: "Live Stream - #{sk.name}",
        streamKey: sk.key_string,
        bitrate: format_bitrate(mtx_data),
        uptime: format_uptime(mtx_data),
        destinationsCount: Map.get(dest_counts, sk.id, 0),
        viewers: length(readers),
        ready_time: get_ready_time(mtx_data)
      }
    end)

    conn |> json(data)
  end

  # Fetch server stats for the settings page
  def server_stats(conn, _params) do
    mediamtx_paths = fetch_mediamtx_paths()

    # Count total readers across all paths
    total_connections = Enum.reduce(mediamtx_paths, 0, fn path, acc ->
      acc + (Map.get(path, "readers", []) |> length()) + (Map.get(path, "readers", []) |> length())
    end)

    # Get container uptime by checking when first path was created, or just
    # return the time since the first active stream
    uptime = calculate_server_uptime(mediamtx_paths)

    conn |> json(%{
      version: "v1.16.2",
      uptime: uptime,
      connections: max(total_connections, length(mediamtx_paths))
    })
  end

  # Database stats endpoint
  def database_stats(conn, _params) do
    import Ecto.Query

    # Count real records
    stream_keys_count = Backend.Repo.aggregate(StreamKey, :count)
    users_count = Backend.Repo.aggregate(Backend.Accounts.User, :count)

    total_records = stream_keys_count + users_count

    # Get actual database size from PostgreSQL
    db_size = try do
      result = Backend.Repo.query!("SELECT pg_size_pretty(pg_database_size(current_database()))")
      [[size]] = result.rows
      size
    rescue
      _ -> "Unknown"
    end

    conn |> json(%{
      records: total_records,
      size: db_size,
      lastBackup: "Not configured"
    })
  end

  # --- Private helpers ---

  defp fetch_mediamtx_paths do
    case :httpc.request(:get, {~c"http://iris_mediamtx:9997/v3/paths/list", []}, [timeout: 3000], []) do
      {:ok, {{_, 200, _}, _, body}} ->
        case Jason.decode(to_string(body)) do
          {:ok, %{"items" => items}} when is_list(items) -> items
          _ -> []
        end
      _ -> []
    end
  end

  defp find_mediamtx_path(paths, key_string) do
    Enum.find(paths, fn path ->
      name = Map.get(path, "name", "")
      String.contains?(name, key_string)
    end)
  end

  defp format_bitrate(nil), do: "0 kbps"
  defp format_bitrate(mtx_data) do
    bytes = Map.get(mtx_data, "bytesReceived", 0)
    if is_integer(bytes) and bytes > 0 do
      ready_time = get_ready_time(mtx_data)
      if ready_time do
        elapsed_seconds = max(DateTime.diff(DateTime.utc_now(), ready_time), 1)
        kbps = div(bytes * 8, elapsed_seconds * 1000)
        "#{kbps} kbps"
      else
        "0 kbps"
      end
    else
      "0 kbps"
    end
  end

  defp format_uptime(nil), do: "00:00:00"
  defp format_uptime(mtx_data) do
    ready_time = get_ready_time(mtx_data)
    if ready_time do
      diff = DateTime.diff(DateTime.utc_now(), ready_time)
      hours = div(diff, 3600)
      minutes = div(rem(diff, 3600), 60)
      seconds = rem(diff, 60)
      :io_lib.format("~2..0B:~2..0B:~2..0B", [hours, minutes, seconds]) |> to_string()
    else
      "00:00:00"
    end
  end

  defp get_ready_time(nil), do: nil
  defp get_ready_time(mtx_data) do
    case Map.get(mtx_data, "readyTime") do
      nil -> nil
      time_str when is_binary(time_str) ->
        case DateTime.from_iso8601(time_str) do
          {:ok, dt, _} -> dt
          _ -> nil
        end
      _ -> nil
    end
  end

  defp calculate_server_uptime(paths) do
    # Find the earliest readyTime across all active paths
    earliest = paths
    |> Enum.map(&get_ready_time/1)
    |> Enum.reject(&is_nil/1)
    |> Enum.min(DateTime, fn -> nil end)

    if earliest do
      diff = DateTime.diff(DateTime.utc_now(), earliest)
      hours = div(diff, 3600)
      minutes = div(rem(diff, 3600), 60)
      seconds = rem(diff, 60)
      :io_lib.format("~B:~2..0B:~2..0B", [hours, minutes, seconds]) |> to_string()
    else
      "0:00:00"
    end
  end
end
