from __future__ import annotations

import os
import json
import time
import asyncio
import random
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Supabase (optionnel mais supporté)
try:
    from supabase import create_client  # type: ignore
except Exception:  # pragma: no cover
    create_client = None


# -----------------------------
# Config via variables d'env
# -----------------------------
APP_NAME = os.getenv("APP_NAME", "Terranova Exotics Backend")

# Render fournit PORT automatiquement
PORT = int(os.getenv("PORT", "8000"))

# API routes
WS_PATH = os.getenv("WS_PATH", "/ws/sensor")

# CORS: liste séparée par virgules
# Exemple Render: CORS_ORIGINS=https://terranovaexotics.vercel.app,http://localhost:5173
CORS_ORIGINS_RAW = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
)
CORS_ORIGINS = [o.strip() for o in CORS_ORIGINS_RAW.split(",") if o.strip()]

# Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

# Simulation (si tu veux tester sans capteur)
SIM_ENABLED = os.getenv("SIM_ENABLED", "0") == "1"
SIM_INTERVAL_SEC = float(os.getenv("SIM_INTERVAL_SEC", "1.0"))

# Data dir local (fallback si supabase absent)
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA_DIR, exist_ok=True)
TERRARIUMS_FILE = os.path.join(DATA_DIR, "terrariums.json")


# -----------------------------
# App
# -----------------------------
app = FastAPI(title=APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Modèles
# -----------------------------
class ReadingIn(BaseModel):
    sensor_id: str = Field(..., min_length=1)
    temperature: float
    humidity: float


class TerrariumOut(BaseModel):
    id: str
    name: str
    species: Optional[str] = None
    sensor_id: str
    status: str = "ok"
    target_temp: Optional[float] = None
    target_humidity: Optional[float] = None
    last_temperature: Optional[float] = None
    last_humidity: Optional[float] = None
    created_at: Optional[str] = None


# -----------------------------
# Helpers: stockage
# -----------------------------
def _load_json(path: str, default: Any) -> Any:
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default


def _save_json(path: str, data: Any) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _now_iso() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


# -----------------------------
# Supabase client
# -----------------------------
sb = None
if SUPABASE_URL and SUPABASE_KEY and create_client is not None:
    try:
        sb = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception:
        sb = None


# -----------------------------
# WebSocket manager
# -----------------------------
class WSManager:
    def __init__(self) -> None:
        self.connections: List[WebSocket] = []

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        self.connections.append(ws)

    def disconnect(self, ws: WebSocket) -> None:
        try:
            self.connections.remove(ws)
        except ValueError:
            pass

    async def broadcast(self, payload: Dict[str, Any]) -> None:
        dead: List[WebSocket] = []
        for c in self.connections:
            try:
                await c.send_text(json.dumps(payload))
            except Exception:
                dead.append(c)
        for d in dead:
            self.disconnect(d)


ws_manager = WSManager()


# -----------------------------
# Routes
# -----------------------------
@app.get("/health")
def health() -> Dict[str, Any]:
    return {"ok": True, "name": APP_NAME, "time": _now_iso()}


@app.get("/api/terrariums", response_model=List[TerrariumOut])
def list_terrariums() -> List[TerrariumOut]:
    """
    - Si Supabase dispo: lit table public.sensors (adapter selon ton schéma)
    - Sinon: lit fichier local terrariums.json
    """
    if sb is not None:
        # ⚠️ Adapte si ton schéma/table diffère.
        # D'après tes captures: table public.sensors avec colonnes name, species, sensor_id, status, last_temperature, last_humidity, etc.
        try:
            res = sb.table("sensors").select("*").order("created_at", desc=True).execute()
            rows = res.data or []
            out: List[TerrariumOut] = []
            for r in rows:
                out.append(
                    TerrariumOut(
                        id=str(r.get("id", r.get("sensor_id", ""))),
                        name=str(r.get("name", "")),
                        species=r.get("species"),
                        sensor_id=str(r.get("sensor_id", "")),
                        status=str(r.get("status", "ok")),
                        target_temp=r.get("target_temp"),
                        target_humidity=r.get("target_humidity"),
                        last_temperature=r.get("last_temperature"),
                        last_humidity=r.get("last_humidity"),
                        created_at=r.get("created_at"),
                    )
                )
            return out
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Supabase error: {e}")

    # Fallback local
    data = _load_json(TERRARIUMS_FILE, default=[])
    return [TerrariumOut(**x) for x in data]


@app.post("/api/readings")
async def create_reading(body: ReadingIn) -> Dict[str, Any]:
    """
    - Insert dans Supabase public.readings si configuré
    - Broadcast en WebSocket
    """
    payload = {
        "type": "reading",
        "sensor_id": body.sensor_id,
        "temperature": body.temperature,
        "humidity": body.humidity,
        "ts": _now_iso(),
    }

    # Supabase insert (optionnel)
    if sb is not None:
        try:
            # ⚠️ D'après tes captures: public.readings avec sensor_id, temperature, humidity, created_at, owner_id (nullable)
            sb.table("readings").insert(
                {
                    "sensor_id": body.sensor_id,
                    "temperature": body.temperature,
                    "humidity": body.humidity,
                }
            ).execute()
        except Exception as e:
            # On renvoie l'erreur (sinon tu ne la verras pas côté frontend)
            raise HTTPException(status_code=500, detail=f"Supabase insert error: {e}")

    # WebSocket push
    await ws_manager.broadcast(payload)
    return {"ok": True, **payload}


@app.websocket(WS_PATH)
async def ws_sensor(ws: WebSocket) -> None:
    await ws_manager.connect(ws)
    try:
        # petit message d'accueil
        await ws.send_text(json.dumps({"type": "status", "status": "open", "ts": _now_iso()}))

        while True:
            msg = await ws.receive_text()
            # Ping simple
            if msg.strip().lower() == "ping":
                await ws.send_text(json.dumps({"type": "pong", "ts": _now_iso()}))
            else:
                # ignore ou echo
                await ws.send_text(json.dumps({"type": "echo", "data": msg}))
    except WebSocketDisconnect:
        ws_manager.disconnect(ws)
    except Exception:
        ws_manager.disconnect(ws)


# -----------------------------
# Simulateur (optionnel)
# -----------------------------
async def _sim_loop() -> None:
    while True:
        if ws_manager.connections:
            payload = {
                "type": "reading",
                "sensor_id": "SIM-001",
                "temperature": round(24 + random.random() * 4, 2),
                "humidity": round(60 + random.random() * 15, 2),
                "ts": _now_iso(),
            }
            await ws_manager.broadcast(payload)
        await asyncio.sleep(SIM_INTERVAL_SEC)


@app.on_event("startup")
async def on_startup() -> None:
    if SIM_ENABLED:
        asyncio.create_task(_sim_loop())