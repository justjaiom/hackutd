"""Tests for the Planner placeholder."""
from adjacent_app.agents.planning_agent.planner import Planner


def test_planner_build_roadmap_schema():
    planner = Planner()
    roadmap = planner.build_roadmap({})
    assert isinstance(roadmap, dict)
    assert "epics" in roadmap and "tasks" in roadmap
