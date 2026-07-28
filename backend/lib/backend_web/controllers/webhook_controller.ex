defmodule BackendWeb.WebhookController do
  use BackendWeb, :controller

  alias Backend.Streaming.StreamKey
  alias Backend.Streaming.Whitelist
  alias Backend.Repo
  import Ecto.Query
  require Logger

  # MediaMTX calls this webhook for any read or publish authentication.
  # Content-Type: application/json
  def handle_event(conn, params) do
    Logger.info("MediaMTX Auth Webhook triggered: #{inspect(params)}")

    action = params["action"]
    path = params["path"] || ""

    parts = String.split(path, "/")
    key_string = List.last(parts)

    cond do
      action == "publish" ->
        client_ip = params["ip"] || ""
        authorize_publish(conn, key_string, client_ip)

      action in ["read", "playback"] ->
        # For now, all reads are authorized publicly
        conn |> put_status(:ok) |> text("OK")

      true ->
        conn |> put_status(:ok) |> text("OK")
    end
  end

  defp authorize_publish(conn, key_string, client_ip) do
    stream_key = Repo.get_by(StreamKey, key_string: key_string)

    cond do
      is_nil(stream_key) or stream_key.status != "active" ->
        conn |> put_status(:unauthorized) |> text("Unauthorized")

      not ip_whitelisted?(stream_key.id, client_ip) ->
        Logger.warning(
          "Publish rejected: IP #{client_ip} not in whitelist for stream key #{stream_key.id}"
        )

        conn |> put_status(:unauthorized) |> text("IP not whitelisted")

      true ->
        conn |> put_status(:ok) |> text("OK")
    end
  end

  defp ip_whitelisted?(stream_key_id, client_ip) do
    whitelist_entries =
      from(w in Whitelist, where: w.stream_key_id == ^stream_key_id)
      |> Repo.all()

    case whitelist_entries do
      # No whitelist entries = allow all IPs (open access)
      [] ->
        true

      entries ->
        # Strip port from client_ip if present (e.g., "192.168.1.1:54321" -> "192.168.1.1")
        clean_ip =
          client_ip
          |> String.split(":")
          |> List.first()
          |> to_string()

        Enum.any?(entries, fn w -> w.ip_address == clean_ip end)
    end
  end
end
