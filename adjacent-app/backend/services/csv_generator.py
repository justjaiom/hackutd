"""CSV generator service: converts roadmap JSON to CSV rows suitable for Jira import."""
from typing import Dict, Any, List
import io
import csv


def roadmap_to_csv(roadmap: Dict[str, Any]) -> str:
    """Convert roadmap JSON into CSV string.

    Simple implementation: flatten tasks and output minimal columns.
    """
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "title", "assignee", "estimate_hours", "depends_on", "sprint"]) 

    tasks = roadmap.get("tasks", [])
    for t in tasks:
        writer.writerow([
            t.get("id"),
            t.get("title"),
            t.get("assignee", ""),
            t.get("estimate_hours", ""),
            ";".join(t.get("depends_on", [])) if t.get("depends_on") else "",
            t.get("sprint", ""),
        ])

    return output.getvalue()
