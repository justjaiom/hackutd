"""CSV routes: convert JSON roadmap to CSV for download or Jira import."""
from fastapi import APIRouter, Response
from typing import Dict, Any

router = APIRouter()


@router.post("/download_csv")
def download_csv(roadmap: Dict[str, Any]):
    """Return a CSV representation of the roadmap.

    This is a placeholder; the real implementation should call a service
    that formats CSV using `csv_generator`.
    """
    # TODO: validate roadmap and call csv_generator
    csv_content = "id,title,assignee,estimate_hours\n"
    return Response(content=csv_content, media_type="text/csv")
