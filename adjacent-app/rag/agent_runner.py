"""Small demo runner for the RAG agent.

Run this module to quickly index a short sample text and perform a query.
This is meant to be a local developer demo and not a production CLI.
"""
import logging
import sys

try:
    from .rag_agent import RAGAgent
except Exception:  # pragma: no cover - allow absolute import when installed
    from adjacent_app.rag.rag_agent import RAGAgent  # type: ignore


def demo():
    logging.basicConfig(level=logging.INFO)
    sample = (
        "This is a small sample transcript. The project has blockers around data access "
        "and model infrastructure. Key deliverables include an ETL pipeline, embedding store, "
        "and API for retrieval. Responsibilities: data engineer, ML engineer, product manager."
    )
    agent = RAGAgent()
    print("Building index from sample text (this may download a model the first time)...")
    agent.build_index_from_text(sample)
    print("Index built. Querying for 'blockers'...\n")
    results = agent.retrieve("What are the blockers for the project?", top_k=3)
    for i, (chunk, score) in enumerate(results, start=1):
        print(f"Result {i} (score={score:.4f}):\n{chunk}\n")


if __name__ == "__main__":
    try:
        demo()
    except Exception as exc:
        print("Demo failed:", exc, file=sys.stderr)
        raise
