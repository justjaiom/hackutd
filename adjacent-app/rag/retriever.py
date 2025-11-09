"""FAISS-backed retriever for Agentic RAG.

This module wraps FAISS index creation, querying, and simple persistence.
If FAISS is not available on the system, the module raises a clear error when
indexing/searching is attempted — allowing the rest of the app to remain usable.
"""
from typing import List, Optional, Tuple
import os
import json

import numpy as np

try:
    import faiss
except Exception:  # pragma: no cover
    faiss = None


def build_index(embeddings: np.ndarray):
    """Build a FAISS IndexFlatL2 index from embeddings.

    Args:
        embeddings: numpy array with shape (n, dim)

    Returns:
        faiss.Index instance
    """
    if faiss is None:
        raise ImportError("faiss is not installed. Install `faiss-cpu` or use conda to add faiss.")
    if embeddings.ndim != 2:
        raise ValueError("embeddings must be 2-dimensional")
    n, dim = embeddings.shape
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings.astype(np.float32))
    return index


def save_index(index, path: str):
    """Write FAISS index to disk."""
    if faiss is None:
        raise ImportError("faiss is not installed; cannot save index")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    faiss.write_index(index, path)


def load_index(path: str):
    """Load FAISS index from disk."""
    if faiss is None:
        raise ImportError("faiss is not installed; cannot load index")
    if not os.path.exists(path):
        raise FileNotFoundError(f"Index file not found: {path}")
    return faiss.read_index(path)


def query_index(index, query_vector: np.ndarray, chunks: List[str], top_k: int = 5) -> List[Tuple[str, float]]:
    """Query the FAISS index and return top-k (chunk, distance) tuples.

    Args:
        index: FAISS index
        query_vector: 1-D numpy array of length dim
        chunks: list of source chunks (same order used to build the index)
        top_k: number of results to retrieve

    Returns:
        list of (chunk_text, distance) tuples ordered by increasing distance
    """
    if faiss is None:
        raise ImportError("faiss is not installed; cannot query index")
    if query_vector.ndim != 1:
        raise ValueError("query_vector must be 1-dimensional")

    query_vec = np.asarray(query_vector, dtype=np.float32).reshape(1, -1)
    D, I = index.search(query_vec, top_k)
    results: List[Tuple[str, float]] = []
    for dist, idx in zip(D[0], I[0]):
        if idx < 0 or idx >= len(chunks):
            continue
        results.append((chunks[idx], float(dist)))
    return results


class RAGRetriever:
    """Convenience wrapper to build/search FAISS with embedded chunks.

    Attributes:
        chunks: List[str] — text chunks
        embeddings: np.ndarray — embeddings matrix (n, dim)
        index: faiss.Index — FAISS index
        storage_path: directory containing saved artifacts
    """

    def __init__(self, storage_path: str = "adjacent-app/rag/storage"):
        self.chunks: List[str] = []
        self.embeddings: Optional[np.ndarray] = None
        self.index = None
        self.storage_path = storage_path
        os.makedirs(self.storage_path, exist_ok=True)
        self._chunks_path = os.path.join(self.storage_path, "chunks.json")
        self._index_path = os.path.join(self.storage_path, "faiss_index.bin")

    def index_chunks(self, chunks: List[str], embeddings: np.ndarray):
        """Index provided chunks with precomputed embeddings.

        Saves chunks and index to disk for later reuse.
        """
        self.chunks = chunks
        self.embeddings = embeddings.astype(np.float32)
        self.index = build_index(self.embeddings)
        # persist
        with open(self._chunks_path, "w", encoding="utf-8") as f:
            json.dump(self.chunks, f, ensure_ascii=False)
        save_index(self.index, self._index_path)

    def load(self):
        """Load chunks and index from storage if present."""
        if os.path.exists(self._chunks_path) and os.path.exists(self._index_path):
            with open(self._chunks_path, "r", encoding="utf-8") as f:
                self.chunks = json.load(f)
            self.index = load_index(self._index_path)
            return True
        return False

    def query(self, query_vector: np.ndarray, top_k: int = 5) -> List[Tuple[str, float]]:
        """Return top-k (chunk, distance) for the given query vector."""
        if self.index is None:
            # attempt to auto-load
            found = self.load()
            if not found:
                raise RuntimeError("Index not built. Call index_chunks or prepare index first.")
        return query_index(self.index, query_vector, self.chunks, top_k=top_k)

    def index_text(self, text: str, embed_fn) -> None:
        """High-level helper: chunk text, compute embeddings with embed_fn, and index them.

        Args:
            text: raw document / transcript
            embed_fn: callable(list[str]) -> np.ndarray
        """
        from .chunking import chunk_text

        self.chunks = chunk_text(text)
        if not self.chunks:
            raise ValueError("No chunks generated from text")
        self.embeddings = embed_fn(self.chunks)
        self.index = build_index(self.embeddings)
        # persist
        with open(self._chunks_path, "w", encoding="utf-8") as f:
            json.dump(self.chunks, f, ensure_ascii=False)
        save_index(self.index, self._index_path)
