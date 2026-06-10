defmodule Backend.Streaming.Destination do
  use Ecto.Schema
  import Ecto.Changeset

  schema "destinations" do
    field :name, :string
    field :platform, :string
    field :target_rtmp_url, :string
    field :status, :string
    field :stream_key_id, :id

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(destination, attrs) do
    destination
    |> cast(attrs, [:name, :platform, :target_rtmp_url, :status])
    |> validate_required([:name, :platform, :target_rtmp_url, :status])
  end
end
