FROM elixir:1.15-alpine AS build

# install build dependencies
RUN apk add --no-cache build-base npm git python3

# prepare build dir
WORKDIR /app

# install hex + rebar
RUN mix local.hex --force && \
    mix local.rebar --force

# set build ENV
ENV MIX_ENV=prod

# install mix dependencies
# install mix dependencies
COPY mix.exs mix.lock ./
COPY config config
RUN mix do deps.get, deps.compile

# build project
COPY priv priv
COPY lib lib
RUN mix do compile, release

# prepare release image
FROM alpine:3.18.4 AS app
RUN apk add --no-cache libstdc++ ncurses-libs bash openssl \
    gstreamer \
    gstreamer-tools \
    gst-plugins-base \
    gst-plugins-good \
    gst-plugins-bad \
    gst-plugins-ugly \
    gst-libav

WORKDIR /app

RUN chown nobody:nobody /app

USER nobody:nobody

COPY --from=build --chown=nobody:nobody /app/_build/prod/rel/backend ./

COPY --chown=nobody:nobody entrypoint.sh ./
RUN chmod +x entrypoint.sh

ENV HOME=/app

CMD ["./entrypoint.sh"]
