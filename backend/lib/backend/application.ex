defmodule Backend.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      BackendWeb.Telemetry,
      Backend.Repo,
      {DNSCluster, query: Application.get_env(:backend, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: Backend.PubSub},
      {Registry, keys: :unique, name: Backend.Streaming.PipelineRegistry},
      {DynamicSupervisor, strategy: :one_for_one, name: Backend.Streaming.PipelineSupervisor},
      # Start a worker by calling: Backend.Worker.start_link(arg)
      # {Backend.Worker, arg},
      # Start to serve requests, typically the last entry
      BackendWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Backend.Supervisor]
    result = Supervisor.start_link(children, opts)

    # Reset any stale "streaming" statuses from a previous crash/restart
    reset_stale_pipeline_statuses()

    result
  end

  defp reset_stale_pipeline_statuses do
    import Ecto.Query

    {count, _} =
      Backend.Repo.update_all(
        from(d in Backend.Streaming.Destination, where: d.status == "streaming"),
        set: [status: "stopped"]
      )

    if count > 0 do
      require Logger
      Logger.info("Reset #{count} stale 'streaming' destination(s) to 'stopped' on boot.")
    end
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    BackendWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
