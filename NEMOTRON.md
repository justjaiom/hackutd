# Nemotron integration (Orchestrator + Extraction + Planning)

This project integrates NVIDIA Nemotron models to provide an agentic pipeline:

- Orchestrator (9B): decides next actions and which parts need extraction or planning.
- Extraction (12B-VL): filters out fluff from documents/media and returns structured `entities`.
- Planning (12B-VL): consumes extracted entities and emits a JSON array of tasks to insert into the project board.

Files

- `lib/nemotronClient.ts` — Nemotron HTTP helper used by all routes. Reads model-specific keys from env vars:
  - `NEMOTRON_ORCHESTRATOR_KEY` (9B)
  - `NEMOTRON_EXTRACTION_KEY` (12B-VL)
  - `NEMOTRON_API_BASE` (optional)
  - `NEMOTRON_MOCK=true` enables local mock responses for development.

- `app/api/agents/nemotron/orchestrator/route.ts`
  - Accepts either `input: string` or structured `projectId`, `company`, `knowledge`, `meetings`, `files`.
  - Concatenates full context and calls the 9B orchestrator to request actions.

- `app/api/agents/nemotron/extraction/route.ts`
  - Accepts `{ input, media?: string[] }`.
  - Adds an explicit instruction to extract `entities` and filters out fluff.
  - Returns the raw model output.

- `app/api/agents/nemotron/planning/route.ts`
  - Accepts `{ projectId, extractedData }` and requires an authenticated user.
  - Calls 12B-VL to produce a JSON array of tasks and inserts them into the `tasks` table.
  - Includes a three-attempt re-prompt loop and a lightweight validator.

- `app/api/agents/nemotron/run-pipeline/route.ts`
  - Server-side orchestrator that chains: Orchestrator -> Extraction -> Planning.
  - Collects project data sources, runs extraction for requested actions, runs Planning, inserts tasks, marks sources processed, and logs activity.
  - Supports `NEMOTRON_MOCK=true` to use a local stub.

How orchestration and extraction communicate

- The Orchestrator returns a model response (preferably a JSON `actions` array). The server-side pipeline or the client reads that and calls the Extraction route for any `extract` actions. Extraction returns structured `entities` which are then fed to Planning.

Pipeline usage

- From the UI (Project > Work Board), click "Run Lead Agent". That calls `/api/agents/nemotron/run-pipeline` which runs the full pipeline and inserts tasks.
- For manual testing (mock mode):
```powershell
$env:NEMOTRON_MOCK = "true"
npm run dev
# then call endpoints as documented in README
```

Security

- Never commit real API keys. Use `.env.local` and add it to `.gitignore`.
- If keys were accidentally committed, rotate them immediately.

Notes & next steps

- Models may return non-JSON output. The planning agent includes a re-prompt loop to improve JSON-only output; add schema validation and more robust fallback UI if needed.
- Large files or videos should be uploaded and referenced by URL instead of inlining large data URIs.
- Consider an async job queue for long-running pipeline runs and a progress UI.

