# 🤖 Agent Guidelines for Project I.R.I.S.

Welcome! This file provides essential guidelines, architecture overview, and instruction sets for AI coding agents working on the **I.R.I.S.** repository.

---

## 🗺️ Codebase Architecture

Project I.R.I.S. is a multi-service web application composed of:
1.  **Frontend:** Next.js (React 18, Tailwind CSS, TypeScript) located in the root directory ([app/](file:///Users/eldyreynanda/Developer/Antigravity/iris-project-gemini/app), [components/](file:///Users/eldyreynanda/Developer/Antigravity/iris-project-gemini/components), [lib/](file:///Users/eldyreynanda/Developer/Antigravity/iris-project-gemini/lib)).
2.  **Backend:** Elixir / Phoenix Framework (Ecto, PostgreSQL) located in the [backend/](file:///Users/eldyreynanda/Developer/Antigravity/iris-project-gemini/backend) directory.
3.  **Media Engine:** MediaMTX serving RTMP on port `1935` and outputting WebRTC/HLS.
4.  **Forwarding Engine:** GStreamer (designed to run in the backend container) for zero-transcode RTMP redistribution.

---

## 📜 Coding Guidelines

### 1. Elixir & Phoenix Backend
When modifying the backend, always adhere to the rules in [backend/AGENTS.md](file:///Users/eldyreynanda/Developer/Antigravity/iris-project-gemini/backend/AGENTS.md). Crucial rules include:
*   **Run Precommits:** Always execute `mix precommit` in the `backend/` directory when you are finished with backend changes to verify formatting and compilation.
*   **HTTP Client:** Use the pre-installed `:req` (`Req`) library for HTTP requests. **Do not** use `:httpoison` or `:tesla`.
*   **Process Management in Tests:** Always use `start_supervised!/1` to start processes in tests to guarantee cleanup. Avoid `Process.sleep/1`.
*   **Changeset Field Access:** Always use `Ecto.Changeset.get_field(changeset, :field)` to read fields from changesets. Do not use map access syntax (`changeset[:field]`).

### 2. Next.js & React Frontend
*   **Components & Styling:**
    *   Use vanilla Tailwind CSS classes along with custom themes defined in [app/globals.css](file:///Users/eldyreynanda/Developer/Antigravity/iris-project-gemini/app/globals.css).
    *   Leverage existing shadcn components in [components/ui/](file:///Users/eldyreynanda/Developer/Antigravity/iris-project-gemini/components/ui).
*   **State & API Hooks:**
    *   API methods are defined in [lib/api.ts](file:///Users/eldyreynanda/Developer/Antigravity/iris-project-gemini/lib/api.ts). Ensure frontend forms call these methods instead of invoking raw fetch calls inline.
    *   Do not hardcode endpoints; use relative paths `/api/...` in client components so that next/webpack proxies the calls correctly.

---

## 🛠️ Running the Application

To spin up the development environment, execute from the root directory:
```bash
docker-compose up --build
```

### Services Mapping:
*   **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
*   **Backend API:** [http://localhost:4000](http://localhost:4000)
*   **MediaMTX Admin Dashboard:** [http://localhost:9997](http://localhost:9997)
*   **RTMP Ingest Port:** `1935`

---

## 🎯 Verification and Roadmap Checklist
Refer to [roadmap.md](file:///Users/eldyreynanda/Developer/Antigravity/iris-project-gemini/roadmap.md) to check the development checklist, feature gaps, and implementation status. Ensure all tests in the backend pass by running:
```bash
cd backend && mix test
```
