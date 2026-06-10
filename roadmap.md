# 👁️ Project I.R.I.S. Roadmap

This document outlines the current gaps, planned updates, and future improvements for Project I.R.I.S. (Ingest & Redistribution Integrated Streaming).

---

## 🗺️ Implementation Phases

### Phase 1: Core Streaming redistribution Engine (Critical)
*   **Goal:** Enable real-time restreaming to destinations using GStreamer (RTMP & SRT).
*   **Tasks:**
    *   [x] **GStreamer Dependency:** Update the production release stage of [backend/Dockerfile](file:///Users/eldyreynanda/Developer/Antigravity/iris-project-gemini/backend/Dockerfile) to install GStreamer (`gstreamer`, `gst-plugins-base`, `gst-plugins-good`, `gst-plugins-bad`, `gst-plugins-ugly`, `gst-libav`, `srt` / `libgstreamer-plugins-bad1.0-dev`).
    *   [x] **Orchestration GenServer:** Implement a backend GenServer/DynamicSupervisor (e.g., `Backend.Streaming.PipelineSupervisor`) to start, monitor, and stop GStreamer processes for active destinations:
        *   **For RTMP Targets:**
            ```bash
            gst-launch-1.0 rtmpsrc location=rtmp://iris_mediamtx:1935/live/<stream_key> \
              ! flvdemux ! flvmux \
              ! rtmpsink location=<target_rtmp_url>
            ```
        *   **For SRT Targets (Zero-Transcode Remuxing):**
            ```bash
            gst-launch-1.0 rtmpsrc location=rtmp://iris_mediamtx:1935/live/<stream_key> \
              ! flvdemux name=d ! h264parse ! mpegtsmux name=m ! srtsink uri="srt://<host>:<port>?mode=caller" d.audio ! aacparse ! m.
            ```
    *   [x] **Start/Stop Endpoints:** Add POST `/api/destinations/:id/start` and POST `/api/destinations/:id/stop` in [backend/lib/backend_web/router.ex](file:///Users/eldyreynanda/Developer/Antigravity/iris-project-gemini/backend/lib/backend_web/router.ex) and wire them in [backend/lib/backend_web/controllers/destination_controller.ex](file:///Users/eldyreynanda/Developer/Antigravity/iris-project-gemini/backend/lib/backend_web/controllers/destination_controller.ex).
    *   [x] **Frontend Actions:** Update [app/destinations/page.tsx](file:///Users/eldyreynanda/Developer/Antigravity/iris-project-gemini/app/destinations/page.tsx) to:
        *   Bind form inputs and submit to the API in the **Add Destination** dialog (with support for selecting RTMP or SRT platform types).
        *   Wire up the **Start** and **Stop** buttons to call the respective start/stop backend API endpoints.

---

### Phase 2: Security & Access Controls
*   **Goal:** Secure the streaming gateway against unauthorized publication and protect stream keys.
*   **Tasks:**
    *   [ ] **IP Whitelist Verification:** Update the `authorize_publish/2` function in [backend/lib/backend_web/controllers/webhook_controller.ex](file:///Users/eldyreynanda/Developer/Antigravity/iris-project-gemini/backend/lib/backend_web/controllers/webhook_controller.ex) to query `Backend.Streaming.Whitelist` and verify the incoming publisher's IP address.
    *   [ ] **IP Whitelist UI:** Add an interface to allow administrators to add/remove whitelisted IPs for individual stream keys.
    *   [ ] **Stream Key Hashing:** Update the database and backend logic to hash stream keys at rest (e.g., SHA-256) instead of storing them as plain text.

---

### Phase 3: Dashboard & API Polish
*   **Goal:** Enhance usability and provide real-time metrics.
*   **Tasks:**
    *   [x] **Stream Key Regeneration:** Implement the `/api/stream-keys/:id/regenerate` endpoint on the backend to match the frontend call in [lib/api.ts](file:///Users/eldyreynanda/Developer/Antigravity/iris-project-gemini/lib/api.ts).
    *   [x] **Live Telemetry & Viewers:** Parse the MediaMTX paths API `/v3/paths/list` and retrieve real-time readers count to display active viewer stats in the Next.js UI instead of returning `0`.
    *   [x] **Environment Configurations:** Externalize `NEXT_PUBLIC_API_URL` to support dynamic domain names or localhost forwarding in Docker environment configurations.
