```markdown
# 👁️ Project I.R.I.S.
## Ingest & Redistribution Integrated Streaming
### Product Requirements Document & Technical Blueprint

---

## 1. Product Vision

**I.R.I.S.** is a scalable, web-based RTMP ingest and redistribution gateway. Built for broadcasters, it allows users to push a single RTMP feed into the server, instantly generate web-playable links (HLS/WebRTC/FLV), and configure unlimited "Stream Targets" to restream that single feed simultaneously to platforms like YouTube, Twitch, or custom RTMP servers.

---

## 2. Problem Statement

Modern broadcasters often need to stream to multiple platforms simultaneously, but existing solutions either require expensive hardware encoders or force re-encoding at the server — causing high CPU usage and latency. I.R.I.S. solves this by acting as a zero-transcode redistribution layer: ingest once, restream everywhere.

---

## 3. Target Users

- **Independent Broadcasters** — streamers who want to multistream without expensive tools.
- **Small Media Companies** — teams managing multiple stream keys and destinations.
- **DevOps / Self-Hosters** — technical users who want a self-hosted, Docker-deployable solution.

---

## 4. Technology Stack

| Layer | Technology |
|---|---|
| **Frontend UI** | React 18 + Vite + Ant Design (or Tailwind CSS) |
| **Backend API** | Elixir + Phoenix Framework |
| **Database** | PostgreSQL |
| **Streaming Edge Server** | MediaMTX (open-source, Go-based media server) |
| **Redistribution Engine** | GStreamer |
| **Containerization** | Docker + Docker Compose |

---

## 5. Core Functional Requirements

### 5.1 User & Auth Management
- **Admin Dashboard Login:** Secure login to access the streaming control panel.
- **User Management:** Ability to add/remove users who can access the dashboard.
- **Stream Key Management:** Generate, revoke, and assign unique RTMP Stream Keys to ingest connections.
- **IP Whitelisting:** Define which external IP addresses are allowed to push video to specific Stream Keys.

### 5.2 Ingest & Playback (MediaMTX)
- **RTMP Ingest:** Accept incoming video streams on Port `1935`.
- **Auth Webhooks:** Incoming streams must hit an API endpoint to validate the Stream Key and IP Whitelist before being accepted.
- **Auto-generated Playback:** The moment a stream is authorized, instantly generate playback endpoints:
  - `HLS` — Apple / General Web (Port `8888`)
  - `WebRTC` — Ultra-Low Latency (Port `8889`)
  - `HTTP-FLV` — Legacy / Dashboard Preview

### 5.3 Redistribution Engine (GStreamer)
- **Add Stream Target:** Users can input an RTMP Destination URL (e.g., YouTube, Twitch) into the dashboard.
- **Background Forwarding:** The backend orchestrates a lightweight GStreamer forwarding pipeline (`rtmpsrc -> flvdemux -> flvmux -> rtmpsink`) in the background to push the stream without re-encoding.
- **Start/Stop Control:** Ability to view the live status of each target and start/stop them individually.

---

## 6. Non-Functional Requirements

- **Latency:** End-to-end redistribution latency < 3 seconds.
- **Concurrency:** Support at least 10 simultaneous outbound stream targets per ingest.
- **CPU Efficiency:** Redistribution pipeline must NOT re-encode video (passthrough only).
- **Uptime:** System should handle stream reconnects gracefully without manual intervention.
- **Security:** All API endpoints must be authenticated; stream keys must be hashed at rest.

---

## 7. Out of Scope

- Video recording / VOD storage
- Transcoding to multiple bitrates (adaptive bitrate ladder)
- Mobile app
- Built-in CDN or edge distribution

---

## 8. Success Metrics

- A broadcaster can go from zero to multistreaming in < 10 minutes on a fresh Docker install.
- Redistribution CPU usage stays below 5% per active stream target.
- Zero dropped frames on redistribution under normal network conditions.

---

## 9. Technical Implementation

### Phase 1: The Foundation (MediaMTX + PostgreSQL)

1. **Setup MediaMTX:** Download the `mediamtx` binary — your core network ingest engine.
2. **Configure Webhooks:** Edit `mediamtx.yml` to delegate auth to the Elixir backend:
   ```yaml
   paths:
     all_others:
       runOnInit: ""
       runOnPublish: "http://localhost:4000/api/auth/stream-publish"
       runOnRead: "http://localhost:4000/api/auth/stream-read"
   ```
3. **Setup Elixir & Postgres:** Create a new Phoenix project:
   ```bash
   mix phx.new iris_engine --no-html --no-assets
   ```
   Design your database schema:
   - `users`: `id`, `username`, `password_hash`
   - `stream_keys`: `id`, `user_id`, `key_string`, `active`
   - `whitelists`: `id`, `stream_key_id`, `ip_address`
   - `destinations`: `id`, `stream_key_id`, `target_rtmp_url`, `status`

---

### Phase 2: Ingest Auth Flow (Elixir API)

1. Build the `/api/auth/stream-publish` endpoint in Elixir.
2. When a client streams to `rtmp://[server-ip]:1935/live/MyKey123`, MediaMTX pauses and sends an HTTP POST to your Elixir endpoint (containing the stream key and client IP).
3. Elixir queries the Postgres DB:
   - Does `MyKey123` exist and is it active?
   - Does the Client IP match the whitelist for this key?
4. If valid → respond `HTTP 200 OK`. MediaMTX accepts the stream and immediately hosts playback URLs on ports `8888` (HLS) and `8889` (WebRTC).

---

### Phase 3: React Frontend

1. Build the React SPA with these views: Dashboard, Stream Keys, Destinations, User Management.
2. Connect to the Elixir REST API for full CRUD on keys, users, whitelists, and destinations.
3. **Live Preview:** Use `hls.js` or `video.js` pointed at the MediaMTX HLS URL:
   ```
   http://[server-ip]:8888/live/MyKey123/index.m3u8
   ```

---

### Phase 4: Redistribution Forwarding Engine (GStreamer)

1. Write an Elixir `GenServer` to orchestrate GStreamer processes per destination.
2. When the user clicks **"Start"**, the `GenServer` executes:
   ```bash
   gst-launch-1.0 rtmpsrc location=rtmp://127.0.0.1/live/MyKey123 \
     ! flvdemux ! flvmux \
     ! rtmpsink location=rtmp://a.rtmp.youtube.com/live2/YOUTUBE_KEY
   ```
   > This pulls the stream **locally** from MediaMTX and pushes it to the destination **without decoding/re-encoding H.264**. Near-zero CPU usage.
3. When the user clicks **"Kick" (Stop)**, Elixir grabs the OS `PID` of that GStreamer process and runs `kill {PID}`.

---

### Phase 5: Containerize & Deploy (Docker)

Write a `docker-compose.yml` with three containers:

```yaml
services:
  postgres:
    image: postgres:16-alpine

  mediamtx:
    image: bluenviron/mediamtx:latest
    ports:
      - "1935:1935"   # RTMP Ingest
      - "8888:8888"   # HLS Playback
      - "8889:8889"   # WebRTC Playback

  iris_api:
    build: ./backend   # Elixir/Phoenix + GStreamer via apt-get
    depends_on:
      - postgres
      - mediamtx
    ports:
      - "4000:4000"
```

---

## 10. Milestones

| Phase | Deliverable | Target |
|---|---|---|
| Phase 1 | MediaMTX running + DB schema | Week 1 |
| Phase 2 | Auth webhook working end-to-end | Week 2 |
| Phase 3 | React dashboard functional | Week 3–4 |
| Phase 4 | GStreamer redistribution working | Week 5 |
| Phase 5 | Full Docker deploy on clean server | Week 6 |
```