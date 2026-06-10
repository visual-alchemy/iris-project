defmodule Backend.Streaming.StreamKey do
  use Ecto.Schema
  import Ecto.Changeset

  schema "stream_keys" do
    field :key_string, :string
    field :name, :string
    field :status, :string
    field :user_id, :id

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(stream_key, attrs) do
    stream_key
    |> cast(attrs, [:key_string, :name, :status])
    |> validate_required([:key_string, :name, :status])
  end
end
