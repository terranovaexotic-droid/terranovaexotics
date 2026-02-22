from __future__ import annotations

import os
from datetime import date
from typing import Optional, Dict, Any, List

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

from .settings import settings

app = FastAPI(title="Terranova API")


# -----------------------------
# Models
# -----------------------------
class ReadingIn(BaseModel):
    terrarium_id: str = Field(..., min_length=1)
    temperature_c: Optional[float] = None
    humidity_pct: Optional[float] = None
    source: str = "esp32"


# -----------------------------
# Security
# -----------------------------
def require_key(x_api_key: Optional[str]) -> None:
    """
    Simple API key check using header 'x-api-key'.
    Value must match settings.API_KEY (from env on Render).
    """
    expected = getattr(settings, "API_KEY", None)
    if not expected:
        # Misconfiguration: API_KEY not set in environment
        raise HTTPException(status_code=500, detail="Server misconfigured: API_KEY not set")

    if not x_api_key or x_api_key != expected:
        raise HTTPException(status_code=401, detail="Invalid API key")


# -----------------------------
# Basic endpoints
# -----------------------------
@app.get("/")
def root() -> Dict[str, Any]:
    return {"status": "Terranova Exotics API is running"}


@app.get("/health")
def health() -> Dict[str, bool]:
    return {"ok": True}


@app.get("/version")
def version() -> Dict[str, str]:
    return {
        "render_commit": os.getenv("RENDER_GIT_COMMIT", "unknown"),
        "service": os.getenv("RENDER_SERVICE_NAME", "terranovaexotics-api"),
    }


# -----------------------------
# API v1
# -----------------------------
@app.post("/api/v1/readings")
def post_reading(payload: ReadingIn, x_api_key: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    """
    Receives sensor readings (ESP32, etc.). For now: returns success.
    Later: insert into Supabase/Postgres + trigger alerts.
    """
    require_key(x_api_key)

    # TODO: save into DB (Supabase/Postgres)
    # Example return only
    return {
        "saved": True,
        "terrarium_id": payload.terrarium_id,
        "temperature_c": payload.temperature_c,
        "humidity_pct": payload.humidity_pct,
        "source": payload.source,
    }


@app.get("/api/v1/dashboard/today")
def dashboard_today(x_api_key: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    """
    Summary for today: terrariums status, alerts, tasks, low stock.
    """
    require_key(x_api_key)

    return {
        "terrariums": [],
        "alerts_active": [],
        "tasks_today": [],
        "low_stock": [],
    }


@app.get("/api/v1/alerts")
def get_alerts(
    status: str = "ACTIVE",
    x_api_key: Optional[str] = Header(default=None),
) -> Dict[str, Any]:
    require_key(x_api_key)
    return {"items": [], "status": status}


@app.get("/api/v1/tasks")
def get_tasks(
    day: Optional[date] = None,
    x_api_key: Optional[str] = Header(default=None),
) -> Dict[str, Any]:
    require_key(x_api_key)
    resolved_day = day or date.today()
    return {"items": [], "day": resolved_day.isoformat()}


@app.get("/api/v1/inventory/low-stock")
def low_stock(x_api_key: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    require_key(x_api_key)
    return {"items": []}