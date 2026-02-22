from __future__ import annotations

import os
import time
from typing import Optional

from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# --- Config (ENV) ---
API_KEY = os.getenv("API_KEY")  # obligatoire pour endpoints protégés
SERVICE_NAME = os.getenv("SERVICE_NAME", "terranovaexotics-api")
RENDER_GIT_COMMIT = os.getenv("RENDER_GIT_COMMIT", "unknown")

app = FastAPI(title="Terranova Exotics API")


# --- Models ---
class ReadingIn(BaseModel):
    terrarium_id: str = Field(..., min_length=1, max_length=64)
    temperature_c: Optional[float] = None
    humidity_pct: Optional[float] = None
    source: str = "esp32"


# --- Helpers ---
def require_key(x_api_key: Optional[str]) -> None:
    # Si API_KEY n'est pas configurée sur Render, on bloque proprement au lieu de faire planter.
    if not API_KEY:
        raise HTTPException(status_code=500, detail="Server not configured: API_KEY missing")

    if not x_api_key or x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")


# --- Global error handler (pour éviter les 500 “muets”) ---
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Log minimal en console Render
    print("UNHANDLED_ERROR:", repr(exc))
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"},
    )


# --- Routes ---
@app.get("/")
def root():
    return {"status": "Terranova Exotics API is running"}

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/version")
def version():
    return {
        "service": SERVICE_NAME,
        "render_commit": RENDER_GIT_COMMIT,
        "api_key_configured": bool(API_KEY),
    }

@app.post("/api/v1/readings")
def post_reading(payload: ReadingIn, x_api_key: Optional[str] = Header(default=None)):
    require_key(x_api_key)

    # Ici, pas de DB encore : on confirme juste que l'API reçoit bien les données.
    now = int(time.time())
    return {
        "saved": True,
        "ts": now,
        "reading": payload.model_dump(),
    }


@app.get("/api/v1/dashboard/today")
def dashboard_today(x_api_key: Optional[str] = Header(default=None)):
    require_key(x_api_key)
    return {"terrariums": [], "alerts_active": [], "tasks_today": [], "low_stock": []}

@app.get("/api/v1/alerts")
def get_alerts(status: str = "ACTIVE", x_api_key: Optional[str] = Header(default=None)):
    require_key(x_api_key)
    return {"items": [], "status": status}

@app.get("/api/v1/tasks")
def get_tasks(day: Optional[str] = None, x_api_key: Optional[str] = Header(default=None)):
    require_key(x_api_key)
    return {"items": [], "day": day or "today"}

@app.get("/api/v1/inventory/low-stock")
def low_stock(x_api_key: Optional[str] = Header(default=None)):
    require_key(x_api_key)
    return {"items": []}