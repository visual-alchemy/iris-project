defmodule BackendWeb.AuthControllerTest do
  use BackendWeb.ConnCase

  alias Backend.Accounts
  alias Backend.Accounts.User
  alias Backend.Repo

  describe "login" do
    test "returns token for user with bcrypt password", %{conn: conn} do
      {:ok, user} = Accounts.create_user(%{username: "alice", password: "secret123"})

      conn = post(conn, ~p"/api/login", username: "alice", password: "secret123")

      assert %{"token" => token, "user" => %{"id" => id, "username" => "alice"}} =
               json_response(conn, 200)

      assert id == user.id
      assert is_binary(token)
    end

    test "verifies legacy sha256 hash and migrates it to bcrypt", %{conn: conn} do
      legacy_hash =
        :crypto.hash(:sha256, "legacy123") |> Base.encode16() |> String.downcase()

      {:ok, user} =
        %User{username: "bob", password_hash: legacy_hash}
        |> Repo.insert()

      conn = post(conn, ~p"/api/login", username: "bob", password: "legacy123")
      assert %{"token" => _} = json_response(conn, 200)

      migrated = Repo.reload!(user)
      assert String.starts_with?(migrated.password_hash, "$2")
      assert Bcrypt.verify_pass("legacy123", migrated.password_hash)
    end

    test "rejects wrong password with 401", %{conn: conn} do
      {:ok, _user} = Accounts.create_user(%{username: "carol", password: "secret123"})

      conn = post(conn, ~p"/api/login", username: "carol", password: "wrongwrong")
      assert json_response(conn, 401)
    end

    test "rejects unknown user with 401", %{conn: conn} do
      conn = post(conn, ~p"/api/login", username: "ghost", password: "secret123")
      assert json_response(conn, 401)
    end

    test "no longer accepts a plaintext-stored password", %{conn: conn} do
      {:ok, _user} =
        %User{username: "dave", password_hash: "plaintextpw"}
        |> Repo.insert()

      conn = post(conn, ~p"/api/login", username: "dave", password: "plaintextpw")
      assert json_response(conn, 401)
    end
  end
end
