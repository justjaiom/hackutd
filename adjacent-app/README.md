# Adjacent App

Adjacent App converts meeting transcripts and documentation into structured project roadmaps using a lightweight multi-agent architecture (Orchestrator / Extraction / Planning) with an Agentic RAG layer for retrieval.

This README gives platform-friendly setup instructions (Windows PowerShell and Conda), describes the RAG layer, and explains how to run the FastAPI demo and tests.

------

## Repository layout (relevant parts)

- `agents/` — orchestrator, extraction, and planning agents (placeholders).
- `rag/` — chunking, embeddings wrapper, FAISS retriever, and storage.
- `backend/` — FastAPI app and route/services for `/generate_plan` and `/download_csv`.
- `data/` — store raw transcripts, PDFs, and precomputed embeddings.
- `tests/` — small unit tests for skeleton modules.

------

## Quickstart — Windows PowerShell (pip)

These steps work on Windows without conda. Note: `faiss-cpu` often fails via pip on Windows; if you need FAISS, prefer the Conda instructions below.

1. Ensure Python 3.10+ is installed (from python.org or `winget`).

2. Create and activate a virtualenv (PowerShell):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser  # if Activation blocked
```

3. Upgrade pip and install core packages (CPU PyTorch recommended before sentence-transformers):

```powershell
pip install --upgrade pip
# CPU-only torch (recommended install first)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install -r adjacent-app/requirements.txt
```

4. (Optional) If `faiss-cpu` isn't available via pip on Windows, install FAISS with Conda (see next section) or skip FAISS and use embeddings-only workflows.

5. Run the FastAPI demo:

```powershell
uvicorn adjacent_app.backend.app:app --reload
# open http://127.0.0.1:8000/ and POST to /api/generate_plan
```

------

## Recommended: Conda setup (best for faiss & binary packages)

1. Install Miniconda (Windows installer).
2. Create environment and install PyTorch + FAISS:

```powershell
conda create -n adjacent python=3.11 -y
conda activate adjacent
conda install -c pytorch pytorch cpuonly -y
conda install -c pytorch faiss-cpu -y
pip install -r adjacent-app/requirements.txt
```

This approach is the most reliable for `faiss` and large binary dependencies.

------

## RAG Layer (what we added)

- `adjacent-app/rag/chunking.py` — chunk_text(text, chunk_size=800, overlap=100). Splits transcripts/docs into overlapping word chunks.
- `adjacent-app/rag/embeddings.py` — `Embedder` wrapper around `sentence-transformers` (lazy-loads the model). Example model: `all-MiniLM-L6-v2`.
- `adjacent-app/rag/retriever.py` — FAISS index builder, saver/loader, and `RAGRetriever` wrapper. Raises clear ImportError if FAISS is missing.

Quick demo (Python) — embedding only (works without FAISS):

```powershell
python - <<'PY'
from adjacent_app.rag.chunking import chunk_text
from adjacent_app.rag.embeddings import embed_chunks

text = 'This is a short meeting transcript about backend deployment. ' * 30
chunks = chunk_text(text, chunk_size=40, overlap=10)
embs = embed_chunks(chunks)
print('chunks:', len(chunks), 'emb shape:', embs.shape)
PY
```

------

## Running tests

Run pytest from repository root (ensure venv/conda env active):

```powershell
# from repo root
pytest adjacent-app/tests -q
```

The tests are minimal skeletons verifying imports and return shapes.

------

## FastAPI endpoints (demo)

- `POST /api/generate_plan` — accepts JSON {"transcript": "..."} and returns a placeholder roadmap JSON.
- `POST /api/download_csv` — accepts roadmap JSON and returns CSV content.

These are wired in `adjacent-app/backend/` and currently use the placeholder agent skeletons. You can extend them to call `RAGRetriever` + `Extractor` + `Planner`.

------

## Next steps and tips for Copilot

- Implement `agents/extraction_agent/extractor.py` to parse transcripts and create structured `objectives` with tasks.
- Implement `agents/planning_agent/planner.py` to turn extracted objectives into epics, sprints, and tasks (include `depends_on` lists).
- Wire the Orchestrator to call `RAGRetriever` when extraction output is missing context.
- Add integration tests that run a tiny end-to-end flow against sample transcripts in `data/transcripts/`.

If you'd like, I can also commit this scaffold and README update on `agents-dev` for you.

---
Saved: 2025-11-08
