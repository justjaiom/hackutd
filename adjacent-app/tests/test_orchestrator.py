"""Tests for the Orchestrator skeleton."""
from adjacent_app.agents.orchestrator_agent.orchestrator import Orchestrator


def test_orchestrator_decide_and_route_returns_dict():
    ork = Orchestrator()
    result = ork.decide_and_route({"transcript": "hello"})
    assert isinstance(result, dict)
    assert "extraction" in result and "plan" in result
