defmodule BackendWeb.DestinationController do
  use BackendWeb, :controller

  alias Backend.Streaming.Destination

  def index(conn, _params) do
    destinations = Backend.Repo.all(Destination)

    data =
      Enum.map(destinations, fn d ->
        %{
          id: d.id,
          name: d.name,
          platform: d.platform,
          status: d.status || "stopped",
          url: d.target_rtmp_url,
          stream_key_id: d.stream_key_id,
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
        conn
        |> put_status(:created)
        |> json(%{
          id: d.id,
          name: d.name,
          platform: d.platform,
          status: d.status,
          url: d.target_rtmp_url,
          stream_key_id: d.stream_key_id
        })

      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: "Failed", details: inspect(changeset.errors)})
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

  def start(conn, %{"id" => id}) do
    dest = Backend.Repo.get(Destination, id)

    if dest do
      case Registry.lookup(Backend.Streaming.PipelineRegistry, dest.id) do
        [] ->
          case DynamicSupervisor.start_child(
                 Backend.Streaming.PipelineSupervisor,
                 {Backend.Streaming.PipelineWorker, dest.id}
               ) do
            {:ok, _pid} ->
              updated_dest = Backend.Repo.get(Destination, id)

              conn
              |> json(%{
                id: updated_dest.id,
                name: updated_dest.name,
                platform: updated_dest.platform,
                status: updated_dest.status || "stopped",
                url: updated_dest.target_rtmp_url,
                stream_key_id: updated_dest.stream_key_id,
                enabled: true
              })

            {:error, reason} ->
              conn
              |> put_status(:internal_server_error)
              |> json(%{error: "Failed to start pipeline", reason: inspect(reason)})
          end

        [_pid] ->
          conn
          |> json(%{
            id: dest.id,
            name: dest.name,
            platform: dest.platform,
            status: dest.status || "stopped",
            url: dest.target_rtmp_url,
            stream_key_id: dest.stream_key_id,
            enabled: true
          })
      end
    else
      conn |> put_status(:not_found) |> json(%{error: "Not found"})
    end
  end

  def stop(conn, %{"id" => id}) do
    dest = Backend.Repo.get(Destination, id)

    if dest do
      case Registry.lookup(Backend.Streaming.PipelineRegistry, dest.id) do
        [{pid, _}] ->
          GenServer.stop(pid)

          # Force status update to stopped in DB
          dest
          |> Destination.changeset(%{status: "stopped"})
          |> Backend.Repo.update()
          |> case do
            {:ok, updated_dest} ->
              conn
              |> json(%{
                id: updated_dest.id,
                name: updated_dest.name,
                platform: updated_dest.platform,
                status: updated_dest.status || "stopped",
                url: updated_dest.target_rtmp_url,
                stream_key_id: updated_dest.stream_key_id,
                enabled: true
              })

            {:error, _} ->
              conn
              |> put_status(:internal_server_error)
              |> json(%{error: "Failed to update status"})
          end

        [] ->
          # If not running in registry, ensure DB is updated to stopped
          dest
          |> Destination.changeset(%{status: "stopped"})
          |> Backend.Repo.update()
          |> case do
            {:ok, updated_dest} ->
              conn
              |> json(%{
                id: updated_dest.id,
                name: updated_dest.name,
                platform: updated_dest.platform,
                status: updated_dest.status || "stopped",
                url: updated_dest.target_rtmp_url,
                stream_key_id: updated_dest.stream_key_id,
                enabled: true
              })

            {:error, _} ->
              conn
              |> put_status(:internal_server_error)
              |> json(%{error: "Failed to update status"})
          end
      end
    else
      conn |> put_status(:not_found) |> json(%{error: "Not found"})
    end
  end
end
