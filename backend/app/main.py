from __future__ import annotations

import os
import json
import asyncio
from datetime import datetime
from typing import Any, Dict, List, Optional, Set

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Supabase (backend only)
from supabase import create_client, Client  # pip: supabase

APP_NAME = os.getenv("APP_NAME", "Terranova Exotics Backend")

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()

# Exemple Render env:
# CORS_ORIGINS = "https://terranovaexotics.vercel.app,https://terranovaexotics-xxxx.vercel.app"
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").strip()

WS_PATH = os.getenv("WS_PATH", "/ws/sensor").strip()          # Frontend WS
READINGS_BROADCAST = os.getenv("READINGS_BROADCAST", "1") == "1"

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    # On laisse démarrer, mais les routes DB vont retourner 500 avec message clair
    supabase: Optional[Client] = None
else:
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# ---------- Models ----------
class TerrariumCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    species: Optional[str] = Field(default=None, max_length=120)
    sensor_id: Optional[str] = Field(default=None, max_length=50)
    target_temp: Optional[float] = None
    target_humidity: Optional[float] = None
    status: Optional[str] = Field(default="ok", max_length=30)

class TerrariumOut(BaseModel):
    id: int
    name: str
    species: Optional[str] = None
    sensor_id: Optional[str] = None
    target_temp: Optional[float] = None
    target_humidity: Optional[float] = None
    status: Optional[str] = None
    last_temperature: Optional[float] = None
    last_humidity: Optional[float] = None
    created_at: Optional[str] = None

class ReadingIn(BaseModel):
    sensor_id: str = Field(min_length=1, max_length=50)
    temperature: float
    humidity: float
    ts: Optional[str] = None  # ISO string optional

# ---------- App ----------
app = FastAPI(title=APP_NAME)

# CORS
if CORS_ORIGINS == "*":
    origins = ["*"]
else:
    origins = [o.strip() for o in CORS_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- WebSocket manager ----------
class WSManager:
    def __init__(self) -> None:
        self.clients: Set[WebSocket] = set()
        self.lock = asyncio.Lock()

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        async with self.lock:
            self.clients.add(ws)

    async def disconnect(self, ws: WebSocket) -> None:
        async with self.lock:
            if ws in self.clients:
                self.clients.remove(ws)

    async def broadcast(self, payload: Dict[str, Any]) -> None:
        msg = json.dumps(payload, ensure_ascii=False)
        async with self.lock:
            clients = list(self.clients)
        if not clients:
            return
        dead: List[WebSocket] = []
        for ws in clients:
            try:
                await ws.send_text(msg)
            except Exception:
                dead.append(ws)
        if dead:
            async with self.lock:
                for ws in dead:
                    self.clients.discard(ws)

ws_manager = WSManager()

# ---------- Helpers ----------
def _require_supabase() -> Client:
    if supabase is None:
        raise HTTPException(
            status_code=500,
            detail="Supabase n'est pas configuré. Ajoute SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sur Render.",
        )
    return supabase

# ---------- Routes ----------
@app.get("/health")
def health() -> Dict[str, Any]:
    return {"ok": True, "name": APP_NAME, "ws_path": WS_PATH}

@app.get("/api/terrariums", response_model=List[TerrariumOut])
def list_terrariums() -> List[TerrariumOut]:
    sb = _require_supabase()
    res = sb.table("terrariums").select("*").order("id", desc=False).execute()
    data = res.data or []
    # Normalisation created_at -> str
    out: List[TerrariumOut] = []
    for r in data:
        if isinstance(r.get("created_at"), str):
            created = r.get("created_at")
        else:
            created = str(r.get("created_at")) if r.get("created_at") is not None else None
        r["created_at"] = created
        out.append(TerrariumOut(**r))
    return out

@app.post("/api/terrariums", response_model=TerrariumOut)
def create_terrarium(payload: TerrariumCreate) -> TerrariumOut:
    sb = _require_supabase()

    insert_obj = {
        "name": payload.name.strip(),
        "species": payload.species.strip() if payload.species else None,
        "sensor_id": payload.sensor_id.strip() if payload.sensor_id else None,
        "target_temp": payload.target_temp,
        "target_humidity": payload.target_humidity,
        "status": payload.status or "ok",
        "created_at": datetime.utcnow().isoformat(),
    }

    res = sb.table("terrariums").insert(insert_obj).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Insert terrarium failed.")
    return TerrariumOut(**res.data[0])

@app.delete("/api/terrariums/{terrarium_id}")
def delete_terrarium(terrarium_id: int) -> Dict[str, Any]:
    sb = _require_supabase()
    res = sb.table("terrariums").delete().eq("id", terrarium_id).execute()
    # Supabase retourne parfois [] même si OK selon config; on renvoie ok quand même
    return {"ok": True, "deleted_id": terrarium_id}

@app.post("/api/readings")
async def create_reading(payload: ReadingIn) -> Dict[str, Any]:
    """
    Tu peux appeler ça depuis ton ESP32 / ton script capteur.
    Exemple:
      POST https://<render>/api/readings
      { "sensor_id":"A-01", "temperature":24.8, "humidity":72.0 }
    """
    sb = _require_supabase()

    ts = payload.ts or datetime.utcnow().isoformat()

    # 1) Update last values in terrariums by sensor_id
    upd = (
        sb.table("terrariums")
        .update({"last_temperature": payload.temperature, "last_humidity": payload.humidity})
        .eq("sensor_id", payload.sensor_id)
        .execute()
    )

    # 2) (Optionnel) si tu as une table "readings", tu peux l’enregistrer
    #    Décommente si tu crées la table readings(sensor_id, temperature, humidity, ts)
    # sb.table("readings").insert({
    #     "sensor_id": payload.sensor_id,
    #     "temperature": payload.temperature,
    #     "humidity": payload.humidity,
    #     "ts": ts
    # }).execute()

    # 3) Broadcast WS
    if READINGS_BROADCAST:
        await ws_manager.broadcast(
            {
                "type": "reading",
                "sensor_id": payload.sensor_id,
                "temperature": payload.temperature,
                "humidity": payload.humidity,
                "ts": ts,
            }
        )

    return {"ok": True, "sensor_id": payload.sensor_id, "ts": ts}

@app.websocket(WS_PATH)
async def ws_sensor(ws: WebSocket) -> None:
    await ws_manager.connect(ws)
    try:
        # petit hello
        await ws.send_text(json.dumps({"type": "hello", "ws": WS_PATH}))
        while True:
            # On reçoit parfois "ping" du front
            msg = await ws.receive_text()
            if msg.strip().lower() == "ping":
                await ws.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        pass
    finally:
        await ws_manager.disconnect(ws)