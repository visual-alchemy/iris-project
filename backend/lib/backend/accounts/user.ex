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
    |> cast(attrs, [:username, :password, :password_hash])
    |> validate_required([:username])
    |> validate_password(user)
    |> put_password_hash()
  end

  defp validate_password(changeset, user) do
    is_new = is_nil(user.id)
    has_hash = not is_nil(get_field(changeset, :password_hash))

    if is_new and not has_hash do
      changeset
      |> validate_required([:password])
      |> validate_length(:password, min: 6, max: 80)
    else
      if get_change(changeset, :password) do
        changeset
        |> validate_length(:password, min: 6, max: 80)
      else
        changeset
      end
    end
  end

  defp put_password_hash(
         %Ecto.Changeset{valid?: true, changes: %{password: password}} = changeset
       ) do
    change(changeset, password_hash: Bcrypt.hash_pwd_salt(password))
  end

  defp put_password_hash(changeset), do: changeset
end
