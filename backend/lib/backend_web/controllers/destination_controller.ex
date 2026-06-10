defmodule BackendWeb.DestinationController do
  use BackendWeb, :controller

  alias Backend.Streaming
  alias Backend.Streaming.Destination

  def index(conn, _params) do
    destinations = Backend.Repo.all(Destination)
    
    data = Enum.map(destinations, fn d ->
      %{
        id: d.id,
        name: d.name,
        platform: d.platform,
        status: d.status || "stopped",
        url: d.target_rtmp_url,
        enabled: true
      }
    end)

    conn |> json(data)
  end

  def create(conn, params) do
    %Destination{}
    |> Destination.changeset(params)
    |> Backend.Repo.insert()
    |> case do
      {:ok, d} ->
        conn |> put_status(:created) |> json(%{
            id: d.id, name: d.name, platform: d.platform, status: d.status, url: d.target_rtmp_url
        })
      {:error, changeset} ->
        conn |> put_status(:unprocessable_entity) |> json(%{error: "Failed", details: inspect(changeset.errors)})
    end
  end

  def delete(conn, %{"id" => id}) do
    dest = Backend.Repo.get(Destination, id)
    if dest do
      Backend.Repo.delete(dest)
      send_resp(conn, :no_content, "")
    else
      conn |> put_status(:not_found) |> json(%{error: "Not found"})
    end
  end
end
