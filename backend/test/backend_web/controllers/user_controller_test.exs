defmodule BackendWeb.UserControllerTest do
  use BackendWeb.ConnCase

  import Backend.AccountsFixtures
  alias Backend.Accounts.User

  @create_attrs %{
    username: "some_username",
    password: "some_password"
  }
  @update_attrs %{
    username: "some_updated_username",
    password: "some_updated_password"
  }
  @invalid_attrs %{username: nil, password: nil}

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  defp authenticate(conn, user) do
    token = Phoenix.Token.sign(BackendWeb.Endpoint, "user auth", user.id)
    put_req_header(conn, "authorization", "Bearer " <> token)
  end

  describe "index" do
    test "lists all users", %{conn: conn} do
      admin = user_fixture()
      conn = authenticate(conn, admin) |> get(~p"/api/users")
      assert length(json_response(conn, 200)["data"]) == 1
    end
  end

  describe "create user" do
    test "renders user when data is valid", %{conn: conn} do
      admin = user_fixture()
      conn = authenticate(conn, admin) |> post(~p"/api/users", user: @create_attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = authenticate(build_conn(), admin) |> get(~p"/api/users/#{id}")

      assert %{
               "id" => ^id,
               "username" => "some_username"
             } = json_response(conn, 200)["data"]

      assert Map.has_key?(json_response(conn, 200)["data"], "password_hash") == false
    end

    test "renders errors when data is invalid", %{conn: conn} do
      admin = user_fixture()
      conn = authenticate(conn, admin) |> post(~p"/api/users", user: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update user" do
    setup [:create_user_and_auth]

    test "renders user when data is valid", %{
      conn: conn,
      user: %User{id: id} = user,
      admin: admin
    } do
      conn = put(conn, ~p"/api/users/#{user}", user: @update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = authenticate(build_conn(), admin) |> get(~p"/api/users/#{id}")

      assert %{
               "id" => ^id,
               "username" => "some_updated_username"
             } = json_response(conn, 200)["data"]

      assert Map.has_key?(json_response(conn, 200)["data"], "password_hash") == false
    end

    test "renders errors when data is invalid", %{conn: conn, user: user} do
      conn = put(conn, ~p"/api/users/#{user}", user: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete user" do
    setup [:create_user_and_auth]

    test "deletes chosen user", %{conn: conn, user: user, admin: admin} do
      conn = delete(conn, ~p"/api/users/#{user}")
      assert response(conn, 204)

      assert_error_sent 404, fn ->
        authenticate(build_conn(), admin) |> get(~p"/api/users/#{user}")
      end
    end
  end

  defp create_user_and_auth(%{conn: conn}) do
    admin = user_fixture()
    user = user_fixture(%{username: "target_user", password_hash: "target_password_hash"})
    conn = authenticate(conn, admin)
    %{conn: conn, user: user, admin: admin}
  end
end
