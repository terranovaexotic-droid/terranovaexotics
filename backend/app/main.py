from __future__ import annotations

import os
import json
import asyncio
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Set

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from supabase import create_client, Client  # supabase-py


# -----------------------------
# ENV
# -----------------------------
SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()

APP_NAME = os.getenv("APP_NAME", "Terranova Exotics Backend")
CORS_ORIGINS_RAW = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,https://terranovaexotics.vercel.app",
)

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    # On laisse l'app démarrer, mais les endpoints DB vont échouer proprement
    supabase: Optional[Client] = None
else:
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def parse_origins(raw: str) -> List[str]:
    return [o.strip() for o in raw.split(",") if o.strip()]


CORS_ORIGINS = parse_origins(CORS_ORIGINS_RAW)

app = FastAPI(title=APP_NAME, version="0.1.0")


# -----------------------------
# CORS
# -----------------------------
# IMPORTANT: Vercel => il faut autoriser ton domaine Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# WebSocket Manager (broadcast)
# -----------------------------
class WSManager:
    def __init__(self) -> None:
        self._clients: Set[WebSocket] = set()
        self._lock = asyncio.Lock()

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        async with self._lock:
            self._clients.add(ws)

    async def disconnect(self, ws: WebSocket) -> None:
        async with self._lock:
            self._clients.discard(ws)

    async def broadcast(self, payload: Dict[str, Any]) -> None:
        msg = json.dumps(payload, default=str)
        async with self._lock:
            clients = list(self._clients)

        dead: List[WebSocket] = []
        for ws in clients:
            try:
                await ws.send_text(msg)
            except Exception:
                dead.append(ws)

        if dead:
            async with self._lock:
                for ws in dead:
                    self._clients.discard(ws)


ws_manager = WSManager()


# -----------------------------
# Helpers
# -----------------------------
def db() -> Client:
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase is not configured (missing env vars).")
    return supabase


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


# -----------------------------
# Schemas
# -----------------------------
class TerrariumIn(BaseModel):
    name: str = Field(..., min_length=1)
    species: Optional[str] = None
    sensor_id: str = Field(..., min_length=1)
    target_temp: Optional[float] = None
    target_humidity: Optional[float] = None
    status: Optional[str] = "ok"


class TerrariumUpdate(BaseModel):
    name: Optional[str] = None
    species: Optional[str] = None
    sensor_id: Optional[str] = None
    target_temp: Optional[float] = None
    target_humidity: Optional[float] = None
    status: Optional[str] = None


class ReadingIn(BaseModel):
    sensor_id: str = Field(..., min_length=1)
    temperature: float
    humidity: float
    ts: Optional[datetime] = None


# -----------------------------
# Routes
# -----------------------------
@app.get("/health")
def health() -> Dict[str, Any]:
    return {"ok": True, "name": APP_NAME}


@app.get("/api/terrariums")
def list_terrariums() -> List[Dict[str, Any]]:
    res = db().table("terrariums").select("*").order("id", desc=False).execute()
    return res.data or []


@app.post("/api/terrariums")
def create_terrarium(payload: TerrariumIn) -> Dict[str, Any]:
    data = payload.model_dump()
    data["updated_at"] = now_utc().isoformat()

    # éviter doublon sensor_id (optionnel)
    check = db().table("terrariums").select("id").eq("sensor_id", payload.sensor_id).execute()
    if check.data:
        raise HTTPException(status_code=409, detail="sensor_id already exists")

    res = db().table("terrariums").insert(data).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Insert failed")
    return res.data[0]


@app.get("/api/terrariums/{terrarium_id}")
def get_terrarium(terrarium_id: int) -> Dict[str, Any]:
    res = db().table("terrariums").select("*").eq("id", terrarium_id).limit(1).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Terrarium not found")
    return res.data[0]


@app.put("/api/terrariums/{terrarium_id}")
def update_terrarium(terrarium_id: int, payload: TerrariumUpdate) -> Dict[str, Any]:
    patch = {k: v for k, v in payload.model_dump().items() if v is not None}
    patch["updated_at"] = now_utc().isoformat()

    res = db().table("terrariums").update(patch).eq("id", terrarium_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Terrarium not found or update failed")
    return res.data[0]


@app.delete("/api/terrariums/{terrarium_id}")
def delete_terrarium(terrarium_id: int) -> Dict[str, Any]:
    res = db().table("terrariums").delete().eq("id", terrarium_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Terrarium not found or delete failed")
    return {"deleted": True, "id": terrarium_id}


@app.post("/api/readings")
async def create_reading(payload: ReadingIn) -> Dict[str, Any]:
    ts = payload.ts or now_utc()
    reading_row = {
        "sensor_id": payload.sensor_id,
        "temperature": payload.temperature,
        "humidity": payload.humidity,
        "ts": ts.isoformat(),
    }

    # 1) insert reading
    ins = db().table("readings").insert(reading_row).execute()
    if not ins.data:
        raise HTTPException(status_code=500, detail="Insert reading failed")

    # 2) update terrarium last values (match by sensor_id)
    upd = db().table("terrariums").update(
        {
            "last_temperature": payload.temperature,
            "last_humidity": payload.humidity,
            "updated_at": now_utc().isoformat(),
        }
    ).eq("sensor_id", payload.sensor_id).execute()
    # (si aucun terrarium ne match, on n'échoue pas: ça permet d'envoyer d'abord le capteur)

    # 3) broadcast WS
    await ws_manager.broadcast(
        {
            "type": "sensor_reading",
            "sensor_id": payload.sensor_id,
            "temperature": payload.temperature,
            "humidity": payload.humidity,
            "ts": ts.isoformat(),
        }
    )

    return ins.data[0]


@app.get("/api/readings")
def list_readings(sensor_id: Optional[str] = None, limit: int = 200) -> List[Dict[str, Any]]:
    q = db().table("readings").select("*").order("ts", desc=True).limit(limit)
    if sensor_id:
        q = q.eq("sensor_id", sensor_id)
    res = q.execute()
    return res.data or []


@app.websocket("/ws/sensor")
async def ws_sensor(ws: WebSocket) -> None:
    await ws_manager.connect(ws)
    try:
        while True:
            # On lit des messages (ping du client, etc.)
            msg = await ws.receive_text()
            if msg.lower() == "ping":
                await ws.send_text("pong")
    except WebSocketDisconnect:
        await ws_manager.disconnect(ws)
    except Exception:
        await ws_manager.disconnect(ws)