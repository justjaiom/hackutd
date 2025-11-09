"""Plan routes: endpoints to trigger the agent pipeline and return JSON roadmaps."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict

router = APIRouter()


class GeneratePlanRequest(BaseModel):
    transcript: str
    metadata: Dict[str, Any] = {}


@router.post("/generate_plan")
def generate_plan(req: GeneratePlanRequest):
    """Placeholder endpoint that should invoke the orchestrator pipeline.

    Returns JSON roadmap.
    """
    # TODO: import and call Orchestrator -> Extraction -> Planner
    if not req.transcript:
        raise HTTPException(status_code=400, detail="transcript is required")

    # placeholder response
    roadmap = {"epics": [], "tasks": []}
    return {"status": "ok", "roadmap": roadmap}
