from fastapi import FastAPI, BackgroundTasks, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import json
from datetime import datetime

app = FastAPI(title="Polyglot Training Pipeline", version="0.1.0")

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
COMPONENTS_DIR = os.path.join(DATA_DIR, "components")
os.makedirs(COMPONENTS_DIR, exist_ok=True)


class PipelineRequest(BaseModel):
    n_per_combination: int = 1


def _load_json(path: str) -> List[Dict[str, Any]]:
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_json(path: str, payload: List[Dict[str, Any]]) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=True, indent=2)


def run_pipeline_task(n_per_combination: int) -> None:
    # Placeholder for the async NIM generation pipeline.
    # This writes a minimal marker so downstream API consumers can validate wiring.
    payload = [
        {
            "type": "placeholder",
            "style": "stub",
            "score": 0,
            "generatedAt": datetime.utcnow().isoformat() + "Z",
        }
    ]
    _save_json(os.path.join(COMPONENTS_DIR, "best.json"), payload)


@app.get("/health")
async def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/pipeline/run")
async def run_pipeline(
    req: PipelineRequest, background_tasks: BackgroundTasks
) -> Dict[str, Any]:
    background_tasks.add_task(run_pipeline_task, req.n_per_combination)
    return {"status": "queued", "n_per_combination": req.n_per_combination}


@app.get("/components/best")
async def components_best(
    component_type: Optional[str] = Query(default=None, alias="type"),
    limit: int = 50,
) -> Dict[str, Any]:
    items = _load_json(os.path.join(COMPONENTS_DIR, "best.json"))
    if component_type:
        items = [item for item in items if item.get("type") == component_type]
    return {"items": items[: max(1, min(limit, 200))]}
