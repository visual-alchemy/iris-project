defmodule Backend.Repo.Migrations.CreateDestinations do
  use Ecto.Migration

  def change do
    create table(:destinations) do
      add :name, :string
      add :platform, :string
      add :target_rtmp_url, :string
      add :status, :string
      add :stream_key_id, references(:stream_keys, on_delete: :nothing)

      timestamps(type: :utc_datetime)
    end

    create index(:destinations, [:stream_key_id])
  end
end
