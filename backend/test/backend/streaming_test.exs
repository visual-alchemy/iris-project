defmodule Backend.StreamingTest do
  use Backend.DataCase

  alias Backend.Streaming

  describe "stream_keys" do
    alias Backend.Streaming.StreamKey

    import Backend.StreamingFixtures

    @invalid_attrs %{name: nil, status: nil, key_string: nil}

    test "list_stream_keys/0 returns all stream_keys" do
      stream_key = stream_key_fixture()
      assert Streaming.list_stream_keys() == [stream_key]
    end

    test "get_stream_key!/1 returns the stream_key with given id" do
      stream_key = stream_key_fixture()
      assert Streaming.get_stream_key!(stream_key.id) == stream_key
    end

    test "create_stream_key/1 with valid data creates a stream_key" do
      valid_attrs = %{name: "some name", status: "some status", key_string: "some key_string"}

      assert {:ok, %StreamKey{} = stream_key} = Streaming.create_stream_key(valid_attrs)
      assert stream_key.name == "some name"
      assert stream_key.status == "some status"
      assert stream_key.key_string == "some key_string"
    end

    test "create_stream_key/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Streaming.create_stream_key(@invalid_attrs)
    end

    test "update_stream_key/2 with valid data updates the stream_key" do
      stream_key = stream_key_fixture()

      update_attrs = %{
        name: "some updated name",
        status: "some updated status",
        key_string: "some updated key_string"
      }

      assert {:ok, %StreamKey{} = stream_key} =
               Streaming.update_stream_key(stream_key, update_attrs)

      assert stream_key.name == "some updated name"
      assert stream_key.status == "some updated status"
      assert stream_key.key_string == "some updated key_string"
    end

    test "update_stream_key/2 with invalid data returns error changeset" do
      stream_key = stream_key_fixture()
      assert {:error, %Ecto.Changeset{}} = Streaming.update_stream_key(stream_key, @invalid_attrs)
      assert stream_key == Streaming.get_stream_key!(stream_key.id)
    end

    test "delete_stream_key/1 deletes the stream_key" do
      stream_key = stream_key_fixture()
      assert {:ok, %StreamKey{}} = Streaming.delete_stream_key(stream_key)
      assert_raise Ecto.NoResultsError, fn -> Streaming.get_stream_key!(stream_key.id) end
    end

    test "change_stream_key/1 returns a stream_key changeset" do
      stream_key = stream_key_fixture()
      assert %Ecto.Changeset{} = Streaming.change_stream_key(stream_key)
    end
  end

  describe "whitelists" do
    alias Backend.Streaming.Whitelist

    import Backend.StreamingFixtures

    @invalid_attrs %{ip_address: nil}

    test "list_whitelists/0 returns all whitelists" do
      whitelist = whitelist_fixture()
      assert Streaming.list_whitelists() == [whitelist]
    end

    test "get_whitelist!/1 returns the whitelist with given id" do
      whitelist = whitelist_fixture()
      assert Streaming.get_whitelist!(whitelist.id) == whitelist
    end

    test "create_whitelist/1 with valid data creates a whitelist" do
      valid_attrs = %{ip_address: "some ip_address"}

      assert {:ok, %Whitelist{} = whitelist} = Streaming.create_whitelist(valid_attrs)
      assert whitelist.ip_address == "some ip_address"
    end

    test "create_whitelist/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Streaming.create_whitelist(@invalid_attrs)
    end

    test "update_whitelist/2 with valid data updates the whitelist" do
      whitelist = whitelist_fixture()
      update_attrs = %{ip_address: "some updated ip_address"}

      assert {:ok, %Whitelist{} = whitelist} = Streaming.update_whitelist(whitelist, update_attrs)
      assert whitelist.ip_address == "some updated ip_address"
    end

    test "update_whitelist/2 with invalid data returns error changeset" do
      whitelist = whitelist_fixture()
      assert {:error, %Ecto.Changeset{}} = Streaming.update_whitelist(whitelist, @invalid_attrs)
      assert whitelist == Streaming.get_whitelist!(whitelist.id)
    end

    test "delete_whitelist/1 deletes the whitelist" do
      whitelist = whitelist_fixture()
      assert {:ok, %Whitelist{}} = Streaming.delete_whitelist(whitelist)
      assert_raise Ecto.NoResultsError, fn -> Streaming.get_whitelist!(whitelist.id) end
    end

    test "change_whitelist/1 returns a whitelist changeset" do
      whitelist = whitelist_fixture()
      assert %Ecto.Changeset{} = Streaming.change_whitelist(whitelist)
    end
  end

  describe "destinations" do
    alias Backend.Streaming.Destination

    import Backend.StreamingFixtures

    @invalid_attrs %{name: nil, status: nil, platform: nil, target_rtmp_url: nil}

    test "list_destinations/0 returns all destinations" do
      destination = destination_fixture()
      assert Streaming.list_destinations() == [destination]
    end

    test "get_destination!/1 returns the destination with given id" do
      destination = destination_fixture()
      assert Streaming.get_destination!(destination.id) == destination
    end

    test "create_destination/1 with valid data creates a destination" do
      valid_attrs = %{
        name: "some name",
        status: "some status",
        platform: "some platform",
        target_rtmp_url: "some target_rtmp_url"
      }

      assert {:ok, %Destination{} = destination} = Streaming.create_destination(valid_attrs)
      assert destination.name == "some name"
      assert destination.status == "some status"
      assert destination.platform == "some platform"
      assert destination.target_rtmp_url == "some target_rtmp_url"
    end

    test "create_destination/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Streaming.create_destination(@invalid_attrs)
    end

    test "update_destination/2 with valid data updates the destination" do
      destination = destination_fixture()

      update_attrs = %{
        name: "some updated name",
        status: "some updated status",
        platform: "some updated platform",
        target_rtmp_url: "some updated target_rtmp_url"
      }

      assert {:ok, %Destination{} = destination} =
               Streaming.update_destination(destination, update_attrs)

      assert destination.name == "some updated name"
      assert destination.status == "some updated status"
      assert destination.platform == "some updated platform"
      assert destination.target_rtmp_url == "some updated target_rtmp_url"
    end

    test "update_destination/2 with invalid data returns error changeset" do
      destination = destination_fixture()

      assert {:error, %Ecto.Changeset{}} =
               Streaming.update_destination(destination, @invalid_attrs)

      assert destination == Streaming.get_destination!(destination.id)
    end

    test "delete_destination/1 deletes the destination" do
      destination = destination_fixture()
      assert {:ok, %Destination{}} = Streaming.delete_destination(destination)
      assert_raise Ecto.NoResultsError, fn -> Streaming.get_destination!(destination.id) end
    end

    test "change_destination/1 returns a destination changeset" do
      destination = destination_fixture()
      assert %Ecto.Changeset{} = Streaming.change_destination(destination)
    end
  end
end
