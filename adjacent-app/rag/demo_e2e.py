"""End-to-end demo: embed multiple distinct chunks, build FAISS index, and query.

This script indexes two different chunks (different topics) and queries for a
specific topic to demonstrate the retriever returning the most relevant
chunk (not just the exact same text used for the query).

Run with:
    PYTHONPATH=$(pwd) python -u -m adjacent_app.rag.demo_e2e

"""
from __future__ import annotations
import os
import pprint

try:
    from .embeddings import Embedder
    from .retriever import RAGRetriever
except Exception:
    from adjacent_app.rag.embeddings import Embedder  # type: ignore
    from adjacent_app.rag.retriever import RAGRetriever  # type: ignore


def main() -> None:
    # two short documents with different topics
    chunks = [
        "Deployment and infra blockers: we need access to the staging database, "
        "CI pipelines are flaky, and container images are missing runtime libs.",
        "Product roadmap and feature ideas: focus on onboarding, analytics, and "
        "improving the user profile experience over the next two sprints.",
    ]

    print("Chunks to index:")
    pprint.pprint(chunks)

    # embed chunks
    embedder = Embedder()
    print("Computing embeddings for chunks (may load model)...")
    embs = embedder.embed(chunks)
    print("Embeddings shape:", getattr(embs, "shape", None))

    # use a separate storage directory so we don't clobber demo storage
    storage_path = os.path.join("adjacent-app", "rag", "storage_demo")
    retriever = RAGRetriever(storage_path=storage_path)
    # index_chunks expects numpy ndarray embeddings
    retriever.index_chunks(chunks, embs)
    print(f"Index saved to: {storage_path}")

    # query about deployment blockers
    query = "What are the deployment blockers?"
    print("\nQuery:", query)
    q_emb = embedder.embed([query])[0]
    results = retriever.query(q_emb, top_k=2)

    print("\nResults (chunk, score):")
    for i, (chunk, score) in enumerate(results, start=1):
        print(f"{i}. score={score:.4f}\n   {chunk}\n")

    # simple check: top result should mention 'Deployment' or 'infra'
    top_text = results[0][0].lower()
    assert (
        "deploy" in top_text or "infra" in top_text or "staging" in top_text
    ), "Top result doesn't look deployment-related"
    print("\nAssertion passed: top result is deployment-related")


if __name__ == "__main__":
    main()
