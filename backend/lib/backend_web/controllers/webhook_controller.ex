defmodule BackendWeb.WebhookController do
  use BackendWeb, :controller

  alias Backend.Streaming.StreamKey
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
        authorize_publish(conn, key_string)
        
      action in ["read", "playback"] ->
        # For now, all reads are authorized publicly
        conn |> put_status(:ok) |> text("OK")
        
      true ->
        conn |> put_status(:ok) |> text("OK")
    end
  end

  defp authorize_publish(conn, key_string) do
    stream_key = Backend.Repo.get_by(StreamKey, key_string: key_string)

    if stream_key && stream_key.status == "active" do
      conn |> put_status(:ok) |> text("OK")
    else
      conn |> put_status(:unauthorized) |> text("Unauthorized")
    end
  end
end
