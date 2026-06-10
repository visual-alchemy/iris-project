defmodule BackendWeb.AuthController do
  use BackendWeb, :controller

  alias Backend.Accounts
  alias Backend.Accounts.User

  def login(conn, %{"username" => username, "password" => password}) do
    # For a real application, you would use Argon2 or Bcrypt to verify hashes.
    # For this MVP, we will do a simple lookup and password match.
    user = Backend.Repo.get_by(User, username: username)
    
    if user && user.password_hash == password do
      # Generate a simple token
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
      conn
      |> put_status(:unauthorized)
      |> json(%{error: "Invalid username or password"})
    end
  end
end
