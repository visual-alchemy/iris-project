defmodule Backend.Streaming.Whitelist do
  use Ecto.Schema
  import Ecto.Changeset

  schema "whitelists" do
    field :ip_address, :string
    field :stream_key_id, :id

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(whitelist, attrs) do
    whitelist
    |> cast(attrs, [:ip_address, :stream_key_id])
    |> validate_required([:ip_address])
  end
end
