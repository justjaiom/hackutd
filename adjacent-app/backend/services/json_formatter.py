"""JSON formatting helpers for frontend consumption."""
from typing import Dict, Any


def normalize_roadmap(roadmap: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize roadmap structure to a consistent frontend-friendly schema."""
    # Placeholder: ensure keys exist and default types
    return {
        "epics": roadmap.get("epics", []),
        "tasks": roadmap.get("tasks", []),
    }
