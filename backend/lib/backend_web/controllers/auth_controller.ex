defmodule BackendWeb.AuthController do
  use BackendWeb, :controller

  alias Backend.Accounts.User
  alias Backend.Repo

  def login(conn, %{"username" => username, "password" => password}) do
    user = Repo.get_by(User, username: username)

    if user && valid_password?(password, user.password_hash) do
      migrate_legacy_hash(user, password)

      token = Phoenix.Token.sign(BackendWeb.Endpoint, "user auth", user.id)

      conn
      |> put_status(:ok)
      |> json(%{
        token: token,
        user: %{
          id: user.id,
          username: user.username
        }
      })
    else
      # Equalize timing when the user does not exist.
      Bcrypt.no_user_verify()

      conn
      |> put_status(:unauthorized)
      |> json(%{error: "Invalid username or password"})
    end
  end

  defp valid_password?(password, "$2b$" <> _ = stored_hash),
    do: Bcrypt.verify_pass(password, stored_hash)

  defp valid_password?(password, "$2a$" <> _ = stored_hash),
    do: Bcrypt.verify_pass(password, stored_hash)

  # Legacy SHA-256 hashes (lowercase hex) from the pre-bcrypt scheme.
  defp valid_password?(password, legacy_hash) when is_binary(legacy_hash) do
    sha256_hex(password) == legacy_hash
  end

  defp valid_password?(_password, _stored_hash), do: false

  defp migrate_legacy_hash(%User{password_hash: "$2" <> _} = _user, _password), do: :ok

  defp migrate_legacy_hash(%User{} = user, password) do
    user
    |> Ecto.Changeset.change(password_hash: Bcrypt.hash_pwd_salt(password))
    |> Repo.update!()
  end

  defp sha256_hex(password) do
    :crypto.hash(:sha256, password) |> Base.encode16() |> String.downcase()
  end
end
