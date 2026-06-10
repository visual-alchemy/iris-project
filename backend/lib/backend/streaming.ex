defmodule Backend.Streaming do
  @moduledoc """
  The Streaming context.
  """

  import Ecto.Query, warn: false
  alias Backend.Repo

  alias Backend.Streaming.StreamKey

  @doc """
  Returns the list of stream_keys.

  ## Examples

      iex> list_stream_keys()
      [%StreamKey{}, ...]

  """
  def list_stream_keys do
    Repo.all(StreamKey)
  end

  @doc """
  Gets a single stream_key.

  Raises `Ecto.NoResultsError` if the Stream key does not exist.

  ## Examples

      iex> get_stream_key!(123)
      %StreamKey{}

      iex> get_stream_key!(456)
      ** (Ecto.NoResultsError)

  """
  def get_stream_key!(id), do: Repo.get!(StreamKey, id)

  @doc """
  Creates a stream_key.

  ## Examples

      iex> create_stream_key(%{field: value})
      {:ok, %StreamKey{}}

      iex> create_stream_key(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_stream_key(attrs) do
    %StreamKey{}
    |> StreamKey.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a stream_key.

  ## Examples

      iex> update_stream_key(stream_key, %{field: new_value})
      {:ok, %StreamKey{}}

      iex> update_stream_key(stream_key, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_stream_key(%StreamKey{} = stream_key, attrs) do
    stream_key
    |> StreamKey.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a stream_key.

  ## Examples

      iex> delete_stream_key(stream_key)
      {:ok, %StreamKey{}}

      iex> delete_stream_key(stream_key)
      {:error, %Ecto.Changeset{}}

  """
  def delete_stream_key(%StreamKey{} = stream_key) do
    Repo.delete(stream_key)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking stream_key changes.

  ## Examples

      iex> change_stream_key(stream_key)
      %Ecto.Changeset{data: %StreamKey{}}

  """
  def change_stream_key(%StreamKey{} = stream_key, attrs \\ %{}) do
    StreamKey.changeset(stream_key, attrs)
  end

  alias Backend.Streaming.Whitelist

  @doc """
  Returns the list of whitelists.

  ## Examples

      iex> list_whitelists()
      [%Whitelist{}, ...]

  """
  def list_whitelists do
    Repo.all(Whitelist)
  end

  @doc """
  Gets a single whitelist.

  Raises `Ecto.NoResultsError` if the Whitelist does not exist.

  ## Examples

      iex> get_whitelist!(123)
      %Whitelist{}

      iex> get_whitelist!(456)
      ** (Ecto.NoResultsError)

  """
  def get_whitelist!(id), do: Repo.get!(Whitelist, id)

  @doc """
  Creates a whitelist.

  ## Examples

      iex> create_whitelist(%{field: value})
      {:ok, %Whitelist{}}

      iex> create_whitelist(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_whitelist(attrs) do
    %Whitelist{}
    |> Whitelist.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a whitelist.

  ## Examples

      iex> update_whitelist(whitelist, %{field: new_value})
      {:ok, %Whitelist{}}

      iex> update_whitelist(whitelist, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_whitelist(%Whitelist{} = whitelist, attrs) do
    whitelist
    |> Whitelist.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a whitelist.

  ## Examples

      iex> delete_whitelist(whitelist)
      {:ok, %Whitelist{}}

      iex> delete_whitelist(whitelist)
      {:error, %Ecto.Changeset{}}

  """
  def delete_whitelist(%Whitelist{} = whitelist) do
    Repo.delete(whitelist)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking whitelist changes.

  ## Examples

      iex> change_whitelist(whitelist)
      %Ecto.Changeset{data: %Whitelist{}}

  """
  def change_whitelist(%Whitelist{} = whitelist, attrs \\ %{}) do
    Whitelist.changeset(whitelist, attrs)
  end

  alias Backend.Streaming.Destination

  @doc """
  Returns the list of destinations.

  ## Examples

      iex> list_destinations()
      [%Destination{}, ...]

  """
  def list_destinations do
    Repo.all(Destination)
  end

  @doc """
  Gets a single destination.

  Raises `Ecto.NoResultsError` if the Destination does not exist.

  ## Examples

      iex> get_destination!(123)
      %Destination{}

      iex> get_destination!(456)
      ** (Ecto.NoResultsError)

  """
  def get_destination!(id), do: Repo.get!(Destination, id)

  @doc """
  Creates a destination.

  ## Examples

      iex> create_destination(%{field: value})
      {:ok, %Destination{}}

      iex> create_destination(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_destination(attrs) do
    %Destination{}
    |> Destination.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a destination.

  ## Examples

      iex> update_destination(destination, %{field: new_value})
      {:ok, %Destination{}}

      iex> update_destination(destination, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_destination(%Destination{} = destination, attrs) do
    destination
    |> Destination.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a destination.

  ## Examples

      iex> delete_destination(destination)
      {:ok, %Destination{}}

      iex> delete_destination(destination)
      {:error, %Ecto.Changeset{}}

  """
  def delete_destination(%Destination{} = destination) do
    Repo.delete(destination)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking destination changes.

  ## Examples

      iex> change_destination(destination)
      %Ecto.Changeset{data: %Destination{}}

  """
  def change_destination(%Destination{} = destination, attrs \\ %{}) do
    Destination.changeset(destination, attrs)
  end
end
