defmodule Backend.Repo.Migrations.CreateWhitelists do
  use Ecto.Migration

  def change do
    create table(:whitelists) do
      add :ip_address, :string
      add :stream_key_id, references(:stream_keys, on_delete: :nothing)

      timestamps(type: :utc_datetime)
    end

    create index(:whitelists, [:stream_key_id])
  end
end
