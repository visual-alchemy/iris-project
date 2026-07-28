defmodule Backend.StreamingFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Backend.Streaming` context.
  """

  @doc """
  Generate a stream_key.
  """
  def stream_key_fixture(attrs \\ %{}) do
    {:ok, stream_key} =
      attrs
      |> Enum.into(%{
        key_string: "some key_string",
        name: "some name",
        status: "some status"
      })
      |> Backend.Streaming.create_stream_key()

    stream_key
  end

  @doc """
  Generate a whitelist.
  """
  def whitelist_fixture(attrs \\ %{}) do
    {:ok, whitelist} =
      attrs
      |> Enum.into(%{
        ip_address: "some ip_address"
      })
      |> Backend.Streaming.create_whitelist()

    whitelist
  end

  @doc """
  Generate a destination.
  """
  def destination_fixture(attrs \\ %{}) do
    stream_key_id =
      case Map.get(attrs, :stream_key_id) || Map.get(attrs, "stream_key_id") do
        nil ->
          sk = stream_key_fixture()
          sk.id

        id ->
          id
      end

    {:ok, destination} =
      attrs
      |> Enum.into(%{
        name: "some name",
        platform: "some platform",
        status: "some status",
        target_rtmp_url: "some target_rtmp_url",
        stream_key_id: stream_key_id
      })
      |> Backend.Streaming.create_destination()

    destination
  end
end
