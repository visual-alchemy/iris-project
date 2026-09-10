defmodule BackendWeb.AuthPlug do
  @moduledoc """
  Plug that verifies the Phoenix Token from the Authorization header.
  Blocks unauthenticated requests with 401.
  """
  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    with ["Bearer " <> token] <- get_req_header(conn, "authorization"),
         {:ok, user_id} <-
           Phoenix.Token.verify(BackendWeb.Endpoint, "user auth", token, max_age: 86_400) do
      assign(conn, :current_user_id, user_id)
    else
      _ ->
        conn
        |> put_status(:unauthorized)
        |> Phoenix.Controller.json(%{error: "Authentication required"})
        |> halt()
    end
  end
end
