"""Planner - builds JSON roadmap from structured extraction outputs.

Responsibilities:
- Build epics, tasks, subtasks
- Assign sprints/milestones and effort estimates
- Produce normalized JSON suitable for frontend and CSV export
"""
from typing import Dict, Any, List


class Planner:
    def __init__(self):
        pass

    def build_roadmap(self, extracted: Dict[str, Any]) -> Dict[str, Any]:
        """Return a JSON roadmap given extracted structure from the Extractor."""
        # TODO: implement dependency graph construction + timeline logic
        return {"epics": [], "tasks": []}
