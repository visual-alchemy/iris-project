alias Backend.Repo
alias Backend.Accounts.User
alias Backend.Streaming.StreamKey

# Create Admin User
{:ok, admin} =
  %User{username: "admin", password_hash: "password"}
  |> Repo.insert()

# Create a Stream Key
{:ok, key} = %StreamKey{}
|> StreamKey.changeset(%{
  name: "Main Broadcast",
  key_string: "test_live_key_123",
  status: "active",
  user_id: admin.id
})
|> Repo.insert()

IO.puts("Successfully seeded database with admin user and stream key: test_live_key_123")
