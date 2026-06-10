# 👁️ Project I.R.I.S.
### Ingest & Redistribution Integrated Streaming Gateway

Project **I.R.I.S.** is a high-performance, web-based RTMP ingest and zero-transcode redistribution streaming gateway. Designed for broadcasters, it allows pushing a single RTMP feed into the gateway, instantly generating web-playable links (HLS, WebRTC, HTTP-FLV, SRT), and restreaming that feed simultaneously to unlimited destinations (YouTube, Twitch, Facebook, or custom RTMP/SRT servers) with near-zero CPU overhead.

---

## 🛠️ Technology Stack

| Layer | Component | Technology | Purpose |
|---|---|---|---|
| **Frontend** | Web UI | React 18 + Next.js + Tailwind CSS | Interactive operator dashboard & route monitor |
| **Backend** | API Engine | Elixir + Phoenix Framework | Route orchestration, client auth webhooks, DB management |
| **Database** | Storage | PostgreSQL | Persistence for users, stream keys, whitelists, and destinations |
| **Media Engine** | Edge Routing | MediaMTX (Go-based) | Ingest receiver and multi-protocol playback publisher |
| **Forwarding** | Redistribution | GStreamer | High-performance, zero-transcode pipeline orchestration |
| **Container** | Infrastructure | Docker + Docker Compose | One-command local and production orchestration |

---

## 🗺️ System Architecture

The following diagram illustrates how video streams flow into the I.R.I.S. gateway, authenticate, and redistribute to viewers and external targets:

```mermaid
graph TB
    subgraph "Broadcaster / Ingest"
        A["Broadcaster (OBS/Encoder)<br/>RTMP Push (Port 1935)"]
    end

    subgraph "I.R.I.S. Gateway Server"
        subgraph "Web Interface (Next.js)"
            F["Next.js Dashboard<br/>Port: 3000"]
        end

        subgraph "Media Engine (MediaMTX)"
            B["MediaMTX Server<br/>Ingest & Playback"]
        end

        subgraph "Backend API (Phoenix)"
            C["Elixir API Server<br/>Port: 4000"]
            D["PostgreSQL DB<br/>Port: 5432"]
        end

        subgraph "Redistribution Engine (GStreamer)"
            E["GStreamer Pipelines<br/>(Zero-Transcode Forwarding)"]
        end
    end

    subgraph "Viewer Playback"
        J["Web Players / Decoders<br/>(HLS/WebRTC/SRT)"]
    end

    subgraph "External Streaming Targets (Egress)"
        G["YouTube Live<br/>RTMP Target"]
        H["Twitch TV<br/>RTMP Target"]
        I["Custom Target<br/>RTMP/SRT"]
    end

    A -->|"RTMP Ingest"| B
    B -->|"Auth Webhook"| C
    C <-->|"Query Keys & IPs"| D
    B -->|"HLS / WebRTC / SRT"| J

    F <-->|"HTTP REST API"| C
    C -->|"Start/Stop Processes"| E
    E -->|"Pull Stream"| B
    E -->|"Restream"| G
    E -->|"Restream"| H
    E -->|"Restream"| I

    classDef external fill:#1e3a8a,stroke:#3b82f6,stroke-width:2px,color:#ffffff
    classDef media fill:#b45309,stroke:#d97706,stroke-width:2px,color:#ffffff
    classDef backend fill:#15803d,stroke:#16a34a,stroke-width:2px,color:#ffffff
    classDef ui fill:#581c87,stroke:#a855f7,stroke-width:2px,color:#ffffff
    classDef streaming fill:#ea580c,stroke:#f97316,stroke-width:2px,color:#ffffff
    
    class A,G,H,I,J external
    class B media
    class C,D backend
    class E streaming
    class F ui
```

---

## 🚀 Quick Start

### 1. Requirements
Ensure you have **Docker** and **Docker Compose** installed on your system.

### 2. Start the Gateway
Clone the repository and spin up the containers from the project root:
```bash
docker-compose up --build
```

### 3. Ports Mapping
Access the services locally using the following endpoints:
* **Frontend Web Dashboard:** [http://localhost:3000](http://localhost:3000)
* **Backend REST API:** [http://localhost:4000](http://localhost:4000)
* **MediaMTX Admin Dashboard:** [http://localhost:9997](http://localhost:9997)
* **RTMP Ingest Port:** `1935`
* **SRT Playback Port:** `8890` (UDP)
* **HLS Playback Port:** `8888`
* **WebRTC Playback Port:** `8889`

---

## 📜 Coding Guidelines & Roadmap

Refer to the following documents for development guidelines and roadmap details:
* [agents.md](file:///Users/eldyreynanda/Developer/Antigravity/iris-project-gemini/agents.md) — Coding instructions and guidelines for AI agents working on this project.
* [roadmap.md](file:///Users/eldyreynanda/Developer/Antigravity/iris-project-gemini/roadmap.md) — Implementation gaps, security targets, and features backlog.
* [backend/AGENTS.md](file:///Users/eldyreynanda/Developer/Antigravity/iris-project-gemini/backend/AGENTS.md) — Elixir, Phoenix, and Ecto coding standards.
