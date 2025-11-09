"""FastAPI app exposing Adjacent App endpoints.

Endpoints:
- POST /generate_plan -> accepts transcripts/docs, returns JSON roadmap
- GET  /download_csv -> converts a roadmap JSON into CSV for Jira import
"""
from fastapi import FastAPI

from .routes import plan_routes, csv_routes

app = FastAPI(title="Adjacent App - Agent Pipeline")

# include routers
app.include_router(plan_routes.router)
app.include_router(csv_routes.router)


@app.get("/")
def index():
    return {"status": "Adjacent App backend is running"}
