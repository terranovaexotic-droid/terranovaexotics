# main.py (COMPLET) — TerranovaExotics Backend
# - REST: /api/terrariums (GET/POST), /api/sensors (GET), /api/ingest (POST)
# - WS:   /ws/sensor (broadcast temps/hum en temps réel)
# - Stockage: JSON local (data/terrariums.json, data/sensors.json)
# - Compatible ESP32 (HTTP POST /api/ingest)

from __future__ import annotations

import os
import json
import time
import asyncio
from typing import Any, Dict, List, Optional, Set

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


# -------------------------
# Config
# -------------------------
APP_NAME = os.getenv("APP_NAME", "TerranovaExotics Backend")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")  # ex: "https://xxx.vercel.app,https://yyy.vercel.app"
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

TERRARIUMS_FILE = os.path.join(DATA_DIR, "terrariums.json")
SENSORS_FILE = os.path.join(DATA_DIR, "sensors.json")

os.makedirs(DATA_DIR, exist_ok=True)


def _read_json(path: str, default: Any) -> Any:
    try:
        if not os.path.exists(path):
            return default
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default


def _write_json(path: str, data: Any) -> None:
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(tmp, path)


# -------------------------
# Models
# -------------------------
class TerrariumCreate(BaseModel):
    name: str = Field(min_length=2)
    species: Optional[str] = None
    sensor_id: str = Field(min_length=1)
    target_temp: Optional[float] = None
    target_humidity: Optional[float] = None
    status: Optional[str] = "ok"


class TerrariumOut(BaseModel):
    id: int
    name: str
    species: Optional[str] = None
    sensor_id: str
    target_temp: Optional[float] = None
    target_humidity: Optional[float] = None
    status: Optional[str] = None
    last_temperature: Optional[float] = None
    last_humidity: Optional[float] = None
    last_ts: Optional[int] = None


class IngestPayload(BaseModel):
    # ESP32 envoie ça
    type: str = "sensor_reading"
    sensor_id: str
    temperature: float
    humidity: float
    ts: Optional[int] = None


class SensorOut(BaseModel):
    sensor_id: str
    last_temperature: Optional[float] = None
    last_humidity: Optional[float] = None
    last_ts: Optional[int] = None
    online: bool = False


# -------------------------
# WebSocket Manager
# -------------------------
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

    async def broadcast_json(self, data: Dict[str, Any]) -> None:
        async with self.lock:
            clients = list(self.clients)

        dead: List[WebSocket] = []
        for ws in clients:
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)

        if dead:
            async with self.lock:
                for ws in dead:
                    self.clients.discard(ws)


ws_manager = WSManager()


# -------------------------
# App
# -------------------------
app = FastAPI(title=APP_NAME)

origins = [o.strip() for o in CORS_ORIGINS.split(",")] if CORS_ORIGINS != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# In-memory cache (chargé depuis JSON)
# -------------------------
# terrariums: list[dict]
# sensors: dict[sensor_id] = {last_temperature, last_humidity, last_ts}
terrariums: List[Dict[str, Any]] = _read_json(TERRARIUMS_FILE, [])
sensors: Dict[str, Dict[str, Any]] = _read_json(SENSORS_FILE, {})

# index rapide sensor_id -> terrarium ids
def _rebuild_indexes() -> None:
    # aucune structure complexe nécessaire ici
    pass


def _next_terrarium_id() -> int:
    if not terrariums:
        return 1
    return max(int(t.get("id", 0)) for t in terrariums) + 1


def _apply_sensor_to_terrariums(sensor_id: str, temperature: float, humidity: float, ts: int) -> None:
    for t in terrariums:
        if t.get("sensor_id") == sensor_id:
            t["last_temperature"] = temperature
            t["last_humidity"] = humidity
            t["last_ts"] = ts


def _persist_all() -> None:
    _write_json(TERRARIUMS_FILE, terrariums)
    _write_json(SENSORS_FILE, sensors)


# -------------------------
# Routes
# -------------------------
@app.get("/health")
def health() -> Dict[str, Any]:
    return {"ok": True, "app": APP_NAME, "time": int(time.time())}


@app.get("/api/terrariums", response_model=List[TerrariumOut])
def get_terrariums() -> List[Dict[str, Any]]:
    return terrariums


@app.post("/api/terrariums", response_model=TerrariumOut)
def create_terrarium(payload: TerrariumCreate) -> Dict[str, Any]:
    # simple règle anti-doublon sur le nom
    name_lower = payload.name.strip().lower()
    for t in terrariums:
        if str(t.get("name", "")).strip().lower() == name_lower:
            # FastAPI format "detail"
            return _raise_409(f"Un terrarium avec le nom '{payload.name}' existe déjà.")

    new_id = _next_terrarium_id()
    item = {
        "id": new_id,
        "name": payload.name.strip(),
        "species": payload.species.strip() if payload.species else None,
        "sensor_id": payload.sensor_id.strip(),
        "target_temp": payload.target_temp,
        "target_humidity": payload.target_humidity,
        "status": payload.status or "ok",
        "last_temperature": None,
        "last_humidity": None,
        "last_ts": None,
    }

    # si on a déjà vu le capteur, on remplit last_*
    s = sensors.get(item["sensor_id"])
    if s:
        item["last_temperature"] = s.get("last_temperature")
        item["last_humidity"] = s.get("last_humidity")
        item["last_ts"] = s.get("last_ts")

    terrariums.append(item)
    _persist_all()
    return item


def _raise_409(msg: str):
    # petit helper sans dépendance supplémentaire
    from fastapi import HTTPException

    raise HTTPException(status_code=409, detail=msg)


@app.get("/api/sensors", response_model=List[SensorOut])
def get_sensors() -> List[Dict[str, Any]]:
    now = int(time.time())
    out: List[Dict[str, Any]] = []
    for sensor_id, s in sensors.items():
        last_ts = int(s.get("last_ts") or 0)
        online = (now - last_ts) <= 120  # online si <= 2 minutes
        out.append(
            {
                "sensor_id": sensor_id,
                "last_temperature": s.get("last_temperature"),
                "last_humidity": s.get("last_humidity"),
                "last_ts": last_ts or None,
                "online": online,
            }
        )
    # tri stable
    out.sort(key=lambda x: x["sensor_id"])
    return out


@app.post("/api/ingest")
async def ingest(payload: IngestPayload) -> Dict[str, Any]:
    ts = int(payload.ts or time.time())
    sensor_id = payload.sensor_id.strip()

    # update sensors cache
    sensors[sensor_id] = {
        "last_temperature": float(payload.temperature),
        "last_humidity": float(payload.humidity),
        "last_ts": ts,
    }

    # apply to terrariums that share sensor_id
    _apply_sensor_to_terrariums(sensor_id, float(payload.temperature), float(payload.humidity), ts)

    _persist_all()

    # broadcast to all WS clients
    msg = {
        "type": "sensor_reading",
        "sensor_id": sensor_id,
        "temperature": float(payload.temperature),
        "humidity": float(payload.humidity),
        "ts": ts,
    }
    await ws_manager.broadcast_json(msg)

    return {"ok": True, "received": msg}


# -------------------------
# WebSocket
# -------------------------
@app.websocket("/ws/sensor")
async def ws_sensor(ws: WebSocket) -> None:
    await ws_manager.connect(ws)

    # Optionnel: envoyer un petit hello
    try:
        await ws.send_json({"type": "hello", "ts": int(time.time())})

        # boucle d'attente (on ne dépend pas des messages client)
        while True:
            # on lit pour garder la connexion vivante si le client envoie quelque chose
            await ws.receive_text()
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        await ws_manager.disconnect(ws)


# -------------------------
# Run local
# -------------------------
# uvicorn main:app --host 0.0.0.0 --port 8000