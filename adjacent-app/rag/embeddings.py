"""Embedding utilities using sentence-transformers.

This module lazily loads a SentenceTransformer model and exposes helpers to
embed chunks or queries. Keep the model small (e.g., 'all-MiniLM-L6-v2') for
hackathon speed and memory.
"""
from typing import List, Union
import numpy as np

try:
    from sentence_transformers import SentenceTransformer
except Exception:  # pragma: no cover - graceful fallback
    SentenceTransformer = None


class Embedder:
    """Wrapper around SentenceTransformer with lazy loading."""

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self._model = None

    def _load(self):
        if self._model is None:
            if SentenceTransformer is None:
                raise ImportError(
                    "sentence-transformers is not installed. Run `pip install sentence-transformers`."
                )
            self._model = SentenceTransformer(self.model_name)

    def embed(self, texts: List[str]) -> np.ndarray:
        """Return numpy array of embeddings for the input texts."""
        self._load()
        embs = self._model.encode(texts, show_progress_bar=False)
        return np.asarray(embs)


# convenience functions
_default_embedder: Union[Embedder, None] = None


def get_default_embedder() -> Embedder:
    global _default_embedder
    if _default_embedder is None:
        _default_embedder = Embedder()
    return _default_embedder


def embed_chunks(chunks: List[str], model: Embedder = None) -> np.ndarray:
    """Embed a list of text chunks and return a numpy array of shape (n, dim)."""
    model = model or get_default_embedder()
    return model.embed(chunks)
