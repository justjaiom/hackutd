
```markdown
# Adjacent App

Adjacent App converts meeting transcripts and documentation into structured project roadmaps using a lightweight multi-agent architecture (Orchestrator / Extraction / Planning) with an Agentic RAG layer for retrieval.

This README is focused on developer setup for running agents and the RAG demos on a Brev VM (the environment used for hosting). It includes step-by-step commands, troubleshooting, and optional GPU instructions.

------

## Repository layout (relevant parts)

- `adjacent-app/agents/` — orchestrator, extraction, and planning agents (skeletons).
- `adjacent-app/rag/` — chunking, embeddings wrapper, FAISS retriever, and storage.
- `adjacent-app/backend/` — FastAPI app and route/services for `/generate_plan` and `/download_csv`.
- `adjacent-app/data/` — store raw transcripts, PDFs, and precomputed embeddings.
- `adjacent-app/tests/` — unit tests for the skeleton modules.

------

## Quick checklist (what another dev needs to run an agent on the Brev VM)

1. Access the Brev VM terminal (VS Code remote terminal or the `brev` terminal). Confirm you're on the remote host:

```bash
whoami; hostname; pwd
nvidia-smi  # optional: check for GPU on the remote host
```

2. Create and activate a Python environment

Option A — system venv (simple, requires python3-venv)

```bash
cd ~/hackutd
python3 -m venv venv
source venv/bin/activate
python -m pip install --upgrade pip setuptools wheel
```

If venv creation fails with an `ensurepip` error, install the system package (Debian/Ubuntu):

```bash
sudo apt update
sudo apt install -y python3-venv python3-pip
```

Option B — use a conda-style env (recommended for GPU/FAISS)

If you need GPU or `faiss-gpu`, prefer micromamba/miniconda. See the "GPU / conda" section below.

3. Install Python dependencies (CPU-first recipe — avoids CUDA wheel issues)

Install a CPU-only PyTorch build first (avoids the common nvidia wheel 404 errors), then the rest of requirements:

```bash
# CPU-only torch from the official PyTorch index
pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu torch --trusted-host download.pytorch.org -U
# install the rest (sentence-transformers, faiss-cpu, etc.)
pip install -r adjacent-app/requirements.txt
```

Notes:
- The project's `requirements.txt` already lists `sentence-transformers`, `torch`, and `faiss-cpu`. Installing CPU PyTorch first avoids pip selecting CUDA-specific binary dependencies that your environment can't satisfy.
- If you prefer GPU and have conda/micromamba, follow the GPU section below.

4. Make the package importable and confirm module layout

The repository folder is `adjacent-app` but Python imports use the `adjacent_app` package name. Make the repo importable (one-time):

```bash
# from repo root
[ -e adjacent_app ] || ln -s adjacent-app adjacent_app
# ensure package __init__ files exist
[ -f adjacent_app/__init__.py ] || touch adjacent_app/__init__.py
[ -f adjacent_app/rag/__init__.py ] || touch adjacent_app/rag/__init__.py
```

5. Run the RAG demos (sanity checks)

- Single-sample demo (quick):

```bash
PYTHONPATH=$(pwd) python -u -m adjacent_app.rag.agent_runner
```

- End-to-end demo (indexes two topics, checks retrieval):

```bash
PYTHONPATH=$(pwd) python -u adjacent_app.rag.demo_e2e.py
```

If you see errors about missing packages (faiss or torch), re-run step 3.

6. Run the FastAPI demo server (optional)

```bash
# from repo root
uvicorn adjacent_app.backend.app:app --reload
# then POST to http://127.0.0.1:8000/api/generate_plan
```

7. Run the test suite

```bash
pytest adjacent-app/tests -q
```

------

GPU / conda (optional, for performance)

If you want to use the Brev host GPU for embedding computation or FAISS GPU indexing, use a conda-style env and install CUDA-enabled PyTorch + faiss-gpu. Two safe approaches:

- micromamba (user-local, recommended if you cannot use sudo):

```bash
# install micromamba (user-local) and add to PATH
mkdir -p ~/micromamba
curl -L https://micro.mamba.pm/api/micromamba/linux-64/latest | tar -xvj -C ~/micromamba --strip-components=1
export PATH="$HOME/micromamba/bin:$PATH"
# create env and install GPU packages
micromamba create -n adjacent-gpu -c pytorch -c nvidia python=3.11 -y
micromamba activate adjacent-gpu
micromamba install -n adjacent-gpu -c pytorch -c nvidia pytorch pytorch-cuda=12.1 -y
micromamba install -n adjacent-gpu -c pytorch faiss-gpu -y   # optional
pip install -r adjacent-app/requirements.txt
```

- Miniconda (fallback if micromamba not available):

```bash
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O /tmp/miniconda.sh
bash /tmp/miniconda.sh -b -p $HOME/miniconda
export PATH="$HOME/miniconda/bin:$PATH"
conda create -n adjacent-gpu -c pytorch -c nvidia python=3.11 -y
conda activate adjacent-gpu
conda install -n adjacent-gpu -c pytorch -c nvidia pytorch pytorch-cuda=12.1 -y
conda install -n adjacent-gpu -c pytorch faiss-gpu -y
pip install -r adjacent-app/requirements.txt
```

Verify GPU is used by PyTorch / ST:

```bash
python - <<'PY'
import torch
print('torch:', torch.__version__)
print('cuda available:', torch.cuda.is_available())
from sentence_transformers import SentenceTransformer
m = SentenceTransformer('all-MiniLM-L6-v2', device='cuda' if torch.cuda.is_available() else 'cpu')
print('model device:', next(m._first_module().parameters()).device)
PY
```

------

Troubleshooting & common issues

- ensurepip / venv creation failed:
	- Install OS package: `sudo apt install -y python3-venv python3-pip` then recreate the venv.
- pip error downloading NVIDIA wheels (404 for `nvidia-curand`):
	- This happens when pip tries to pull CUDA-specific wheels. Fix: install CPU PyTorch first using the PyTorch CPU index (see step 3) or use conda/micromamba to get CUDA-enabled wheels.
- ModuleNotFoundError: No module named `adjacent_app` when running `python -m adjacent_app...`:
	- Make the repo importable by creating the `adjacent_app` symlink (see step 4) or run with `PYTHONPATH=$(pwd)`.
- FAISS not available or incompatible:
	- Use `faiss-cpu` for CPU-only or `faiss-gpu` via conda for GPU indexing. `pip install faiss-cpu` is OK on Linux; for GPU prefer conda.

Monitoring GPU usage while running demos

- Open a remote Brev terminal (the same one you use to run the demo). Then run:
	- `watch -n 1 nvidia-smi` in one terminal pane, and run the demo in another pane. You should see a `python` process using GPU memory.

If you accidentally run `nvidia-smi` on your laptop instead of the Brev host, be sure you are in the remote terminal (check `hostname`).

------

Developer tips & next tasks

- Start by implementing the Extraction agent (`adjacent-app/agents/extraction_agent/extractor.py`) using a small rule-based extractor. This is quick to iterate on and easy to test.
- Then implement the Planning agent and wire them in the Orchestrator. Add unit tests under `adjacent-app/tests/`.
- Consider adding provenance metadata to chunks in `adjacent-app/rag/retriever.py` so results include `source_file` and `offset`.

If you want, I can implement the Extraction agent skeleton and tests now. Reply `Implement Extractor` and I will add the code and tests, then run the test suite in the Brev terminal.

---
Saved: 2025-11-09
```

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
