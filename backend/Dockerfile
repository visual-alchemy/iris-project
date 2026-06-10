FROM elixir:1.15 AS build

# install build dependencies
RUN apt-get update && apt-get install -y build-essential npm git python3 && rm -rf /var/lib/apt/lists/*

# prepare build dir
WORKDIR /app

# install hex + rebar
RUN mix local.hex --force && \
    mix local.rebar --force

# set build ENV
ENV MIX_ENV=prod

# install mix dependencies
COPY mix.exs mix.lock ./
COPY config config
RUN mix do deps.get, deps.compile

# build project
COPY priv priv
COPY lib lib
RUN mix do compile, release

# prepare release image
FROM debian:bookworm-slim AS app
RUN apt-get update && apt-get install -y \
    libstdc++6 \
    libncurses6 \
    bash \
    openssl \
    ca-certificates \
    gstreamer1.0-tools \
    gstreamer1.0-plugins-base \
    gstreamer1.0-plugins-good \
    gstreamer1.0-plugins-bad \
    gstreamer1.0-plugins-ugly \
    gstreamer1.0-libav \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN chown nobody:nogroup /app

COPY --from=build --chown=nobody:nogroup /app/_build/prod/rel/backend ./

COPY --chown=nobody:nogroup entrypoint.sh ./
RUN chmod +x entrypoint.sh

USER nobody:nogroup

ENV HOME=/app

CMD ["./entrypoint.sh"]
