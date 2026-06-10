alias Backend.Repo
alias Backend.Accounts.User
alias Backend.Streaming.StreamKey

# Create Admin User if not exists
admin = case Repo.get_by(User, username: "admin") do
  nil ->
    {:ok, user} = %User{username: "admin", password_hash: "password"} |> Repo.insert()
    user
  user ->
    user
end

# Create a Stream Key if not exists
case Repo.get_by(StreamKey, key_string: "test_live_key_123") do
  nil ->
    {:ok, _key} = %StreamKey{}
    |> StreamKey.changeset(%{
      name: "Main Broadcast",
      key_string: "test_live_key_123",
      status: "active",
      user_id: admin.id
    })
    |> Repo.insert()
    IO.puts("Successfully seeded database with admin user and stream key: test_live_key_123")
  _key ->
    IO.puts("Seed data already exists, skipping seeding.")
end
