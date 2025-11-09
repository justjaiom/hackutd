# Adjacent App — Architecture & Core Features

Saved: 2025-11-08
Source: user-provided summary

## Overview
This document captures the core features and architecture for the Adjacent App. It is a concise specification describing the multi-agent system, data flows, backend endpoints, and data management/storage patterns.

---

## Core Features
- Multi-agent architecture for project planning and roadmap generation.
- Orchestrator-driven reasoning and sub-agent invocation.
- Agentic RAG (Retrieval-Augmented Generation) for documents and transcripts to reduce hallucination.
- Endpoints for generating JSON roadmaps and optional CSV exports for Jira.

---

## Multi-Agent Architecture

### Orchestrator Agent (Nemotron)
- Governs the reasoning process.
- Decides when to invoke sub-agents (Extraction and Planning).
- Sends relevant context chunks to the Planning Agent.
- Can trigger agentic RAG retrieval when information is missing.

### Extraction Agent
- Processes raw transcripts (e.g., Zoom) and PDFs.
- Extracts structured objectives, blockers, responsibilities, and deliverables.
- Implements agentic RAG to skip fluff and retrieve only relevant information from documents.

### Planning Agent
- Consumes structured outputs from the Extraction Agent.
- Builds a dependency graph of tasks.
- Generates time-aware sprints, milestones, and effort estimates.
- Produces structured JSON output (not limited to CSV).

---

## Agentic RAG Retrieval
- Embedding-based semantic search (e.g., sentence-transformers + FAISS).
- Dynamically retrieves only relevant context chunks when the orchestrator or planning agent detects gaps.
- Reduces hallucinations by focusing on relevant project data.

---

## Backend Integration
- FastAPI service wraps the agent pipeline for testing endpoints.

Example endpoints:
- `POST /generate_plan` → returns JSON roadmap (epics, tasks, subtasks, dependencies, timelines, estimates).
- `GET /download_csv` → optional CSV export for Jira import or offline use.

Notes:
- The FastAPI microservice can be merged into the main backend repo later or run independently as a microservice.

---

## Frontend Integration
- The JSON roadmap can be consumed by Kanban or Gantt chart UI components.
- Optional CSV endpoint supports mass Jira imports or manual offline workflows.

---

## Data Management
- Raw data storage: PDFs, Zoom transcripts, meeting notes.
- Embeddings: precomputed semantic embeddings stored in FAISS for fast retrieval.
- Output: JSON structured roadmap with epics, tasks, subtasks, dependencies, timelines, and optional CSV.

---

## Implementation Notes / Suggestions
- Use sentence-transformers (or an equivalent embeddings model) to build dense vector embeddings of document chunks.
- Use FAISS (or similar) for fast nearest-neighbor retrieval of relevant chunks.
- Orchestrator (Nemotron) should keep lightweight decision logic and delegate heavy extraction/planning work to subagents.
- Planning Agent should output a normalized JSON schema suitable for both UI consumption and CSV export.

### Minimal JSON schema suggestion (example)
{
  "epics": [
    {
      "id": "E-1",
      "title": "Epic title",
      "milestones": [ ... ],
      "tasks": [ ... ]
    }
  ],
  "tasks": [
    {
      "id": "T-1",
      "title": "Task title",
      "depends_on": ["T-2"],
      "estimate_hours": 16,
      "assignee": "name@example.com",
      "sprint": "Sprint 1",
      "start_date": "2025-11-01",
      "end_date": "2025-11-14"
    }
  ]
}

---

## Next steps / Integration checklist
- Implement a FastAPI wrapper around the agent pipeline for prototyping the `/generate_plan` endpoint.
- Implement a lightweight document ingestion pipeline that generates chunked embeddings into FAISS.
- Build Extraction Agent workflows (transcript parsing, PDF extraction, key-value extraction).
- Build Planning Agent to consume structured outputs and produce the JSON roadmap + CSV exporter.
- Add tests (unit + integration) validating end-to-end generation on sample meeting transcripts.

---

## Contact / metadata
- Saved into repository: `ADJACENT_APP_SPEC.md`
- Date: 2025-11-08
- Author: saved by automation (user-provided content)
