"""Utility helpers for orchestrator workflows (logging, chunking helpers, etc.)."""
from typing import List


def chunk_text(text: str, chunk_size: int = 1000) -> List[str]:
    """Naive text chunker for preprocessing documents/transcripts."""
    return [text[i : i + chunk_size] for i in range(0, len(text), chunk_size)]
