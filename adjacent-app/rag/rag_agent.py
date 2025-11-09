"""High-level RAG agent wrapper.

Provides a small, robust RAGAgent class that composes the existing
`Embedder` and `RAGRetriever` utilities in this package. The agent exposes
helpers to build an index from text or files and to retrieve context for a
query.

This module uses resilient imports so it can be run as a package (relative
imports) or imported via an installed package name (absolute imports).
"""
from typing import List, Optional
import os

try:
    # prefer relative imports when used as package module
    from .embeddings import Embedder
    from .retriever import RAGRetriever
except Exception:  # pragma: no cover - fallback to absolute import if available
    from adjacent_app.rag.embeddings import Embedder  # type: ignore
    from adjacent_app.rag.retriever import RAGRetriever  # type: ignore


class RAGAgent:
    """Agent that wires embedding generation and FAISS-backed retrieval.

    Contract (simple):
    - build_index_from_text(text) -> builds and persists FAISS index + chunks
    - retrieve(query, top_k) -> returns top-k chunks and distances

    Error modes:
    - ImportError when required packages are missing (raised by underlying
      utilities)
    - ValueError for empty inputs
    """

    def __init__(self, storage_path: str = "adjacent-app/rag/storage", model_name: Optional[str] = None):
        self.storage_path = storage_path
        self.embedder = Embedder(model_name) if model_name else Embedder()
        self.retriever = RAGRetriever(storage_path=self.storage_path)

    def build_index_from_text(self, text: str) -> None:
        """Chunk `text`, embed chunks, build and persist FAISS index.

        Args:
            text: raw document or transcript
        """
        if not text:
            raise ValueError("text must not be empty")
        # chunking is handled by retriever.index_text which imports chunking
        embed_fn = lambda chunks: self.embedder.embed(chunks)
        self.retriever.index_text(text, embed_fn)

    def build_index_from_files(self, file_paths: List[str], encoding: str = "utf-8") -> None:
        """Read and index multiple files (concatenated).

        Simple strategy: concatenate files into one big text and index. For
        large corpora, consider indexing per-file and tracking metadata.
        """
        texts = []
        for p in file_paths:
            if not os.path.exists(p):
                raise FileNotFoundError(p)
            with open(p, "r", encoding=encoding) as f:
                texts.append(f.read())
        combined = "\n\n".join(texts)
        self.build_index_from_text(combined)

    def retrieve(self, query: str, top_k: int = 5):
        """Return top-k (chunk, distance) for `query`.

        Args:
            query: user question or short text
            top_k: number of chunks to return

        Returns:
            list of (chunk_text, distance)
        """
        if not query:
            raise ValueError("query must not be empty")
        # embed the query (embedder expects list inputs)
        q_emb = self.embedder.embed([query])[0]
        return self.retriever.query(q_emb, top_k=top_k)


__all__ = ["RAGAgent"]
