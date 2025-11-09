"""Text chunking helpers.

Chunking splits a long text into overlapping word-based chunks. This is a
simple, robust strategy for transcripts and documents. For token-accurate
splitting you can integrate a tokenizer from `transformers`.
"""
from typing import List


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 100) -> List[str]:
    """Split text into overlapping chunks by words.

    Args:
        text: full document or transcript
        chunk_size: approximate number of words per chunk
        overlap: number of words to overlap between consecutive chunks

    Returns:
        list of text chunks
    """
    if not text:
        return []

    words = text.split()
    if chunk_size <= 0:
        raise ValueError("chunk_size must be > 0")
    if overlap >= chunk_size:
        raise ValueError("overlap must be smaller than chunk_size")

    chunks: List[str] = []
    step = chunk_size - overlap
    for i in range(0, len(words), step):
        chunk = " ".join(words[i : i + chunk_size])
        chunks.append(chunk)
        if i + chunk_size >= len(words):
            break
    return chunks
