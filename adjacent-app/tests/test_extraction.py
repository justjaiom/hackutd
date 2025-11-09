"""Tests for the extractor and RAG retriever placeholders."""
from adjacent_app.agents.extraction_agent.extractor import Extractor


def test_extractor_returns_keys():
    ex = Extractor()
    out = ex.extract("This is a test transcript about features and blockers")
    assert isinstance(out, dict)
    for key in ["objectives", "blockers", "responsibilities", "deliverables"]:
        assert key in out
