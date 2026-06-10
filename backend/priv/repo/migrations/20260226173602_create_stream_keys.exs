defmodule Backend.Repo.Migrations.CreateStreamKeys do
  use Ecto.Migration

  def change do
    create table(:stream_keys) do
      add :key_string, :string
      add :name, :string
      add :status, :string
      add :user_id, references(:users, on_delete: :nothing)

      timestamps(type: :utc_datetime)
    end

    create index(:stream_keys, [:user_id])
  end
end
