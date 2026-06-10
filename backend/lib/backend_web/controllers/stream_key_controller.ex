defmodule BackendWeb.StreamKeyController do
  use BackendWeb, :controller

  alias Backend.Streaming.StreamKey

  def index(conn, _params) do
    stream_keys = Backend.Repo.all(StreamKey)

    # Fetch live paths from MediaMTX to determine which keys are streaming
    live_key_strings = fetch_live_key_strings()

    data =
      Enum.map(stream_keys, fn sk ->
        %{
          id: sk.id,
          name: sk.name,
          key: sk.key_string,
          status: sk.status || "inactive",
          is_live: sk.key_string in live_key_strings,
          inserted_at: sk.inserted_at
        }
      end)

    conn |> json(data)
  end

  def create(conn, params) do
    stream_key_params = Map.get(params, "stream_key", params)

    name = Map.get(stream_key_params, "name")
    status = Map.get(stream_key_params, "status", "inactive")

    key_string =
      name
      |> String.downcase()
      |> String.replace(~r/[^a-z0-9\-_]/, "")
      |> String.replace(~r/\s+/, "-")

    %StreamKey{}
    |> StreamKey.changeset(%{name: name, key_string: key_string, status: status})
    |> Backend.Repo.insert()
    |> case do
      {:ok, sk} ->
        conn
        |> put_status(:created)
        |> json(%{
          id: sk.id,
          name: sk.name,
          key: sk.key_string,
          status: sk.status
        })

      {:error, _changeset} ->
        conn |> put_status(:unprocessable_entity) |> json(%{error: "Failed to create stream key"})
    end
  end

  def delete(conn, %{"id" => id}) do
    sk = Backend.Repo.get(StreamKey, id)

    if sk do
      Backend.Repo.delete(sk)
      send_resp(conn, :no_content, "")
    else
      conn |> put_status(:not_found) |> json(%{error: "Not found"})
    end
  end

  def regenerate(conn, %{"id" => id}) do
    sk = Backend.Repo.get(StreamKey, id)

    if sk do
      new_key_string = generate_random_key(sk.name)

      sk
      |> StreamKey.changeset(%{key_string: new_key_string})
      |> Backend.Repo.update()
      |> case do
        {:ok, updated_sk} ->
          conn
          |> json(%{
            id: updated_sk.id,
            name: updated_sk.name,
            key: updated_sk.key_string,
            status: updated_sk.status
          })

        {:error, _changeset} ->
          conn
          |> put_status(:unprocessable_entity)
          |> json(%{error: "Failed to regenerate stream key"})
      end
    else
      conn |> put_status(:not_found) |> json(%{error: "Not found"})
    end
  end

  defp generate_random_key(name) do
    base =
      name
      |> String.downcase()
      |> String.replace(~r/[^a-z0-9\-_]/, "")
      |> String.replace(~r/\s+/, "-")

    suffix = :crypto.strong_rand_bytes(6) |> Base.encode16(case: :lower)
    "#{base}-#{suffix}"
  end

  # Check MediaMTX for which stream keys actually have an active RTMP connection
  defp fetch_live_key_strings do
    case :httpc.request(
           :get,
           {~c"http://iris_mediamtx:9997/v3/paths/list", []},
           [timeout: 3000],
           []
         ) do
      {:ok, {{_, 200, _}, _, body}} ->
        case Jason.decode(to_string(body)) do
          {:ok, %{"items" => items}} when is_list(items) ->
            items
            |> Enum.filter(fn path -> Map.get(path, "ready", false) == true end)
            |> Enum.map(fn path ->
              # Path name format: "live/keyname"
              Map.get(path, "name", "")
              |> String.split("/")
              |> List.last()
            end)
            |> Enum.reject(&(&1 == ""))

          _ ->
            []
        end

      _ ->
        []
    end
  end
end
