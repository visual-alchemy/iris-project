defmodule Backend.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset

  schema "users" do
    field :username, :string
    field :password, :string, virtual: true
    field :password_hash, :string

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:username, :password])
    |> validate_required([:username, :password])
    |> validate_length(:password, min: 6, max: 80)
    |> put_password_hash()
  end

  defp put_password_hash(
         %Ecto.Changeset{valid?: true, changes: %{password: password}} = changeset
       ) do
    # Ensure you have `:bcrypt_elixir` installed to use this, otherwise fake it or use Argon2
    # Since we don't have bcrypt configured right now, we will do a simple generic hash 
    # to unblock the API creation tests and insert valid data
    # In production, replace this with Bcrypt.hash_pwd_salt(password)

    hash = :crypto.hash(:sha256, password) |> Base.encode16() |> String.downcase()
    change(changeset, password_hash: hash)
  end

  defp put_password_hash(changeset), do: changeset
end
