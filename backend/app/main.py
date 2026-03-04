from __future__ import annotations

import os
import json
import time
import asyncio
from typing import Any, Dict, List, Optional, Set

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


# -------------------------
# Config
# -------------------------
APP_NAME = os.getenv("APP_NAME", "TerranovaExotics Backend")

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
TERRARIUMS_FILE = os.path.join(DATA_DIR, "terrariums.json")
SENSORS_FILE = os.path.join(DATA_DIR, "sensors.json")
READINGS_FILE = os.path.join(DATA_DIR, "readings.json")

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


class TerrariumUpdate(BaseModel):
    name: Optional[str] = None
    species: Optional[str] = None
    sensor_id: Optional[str] = None
    target_temp: Optional[float] = None
    target_humidity: Optional[float] = None
    status: Optional[str] = None


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


class ReadingIn(BaseModel):
    sensor_id: str = Field(min_length=1)
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
# WebSocket manager
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
            self.clients.discard(ws)

    async def broadcast(self, data: Dict[str, Any]) -> None:
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
# App + CORS (CORRIGÉ)
# -------------------------
app = FastAPI(title=APP_NAME)

# ✅ CORS stable pour Vercel -> Render
# Important: si allow_origins=["*"], il faut allow_credentials=False
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# Storage in memory
# -------------------------
terrariums: List[Dict[str, Any]] = _read_json(TERRARIUMS_FILE, [])
sensors: Dict[str, Dict[str, Any]] = _read_json(SENSORS_FILE, {})
readings: List[Dict[str, Any]] = _read_json(READINGS_FILE, [])


def _persist() -> None:
    _write_json(TERRARIUMS_FILE, terrariums)
    _write_json(SENSORS_FILE, sensors)
    _write_json(READINGS_FILE, readings)


def _next_terrarium_id() -> int:
    return max([int(t.get("id", 0)) for t in terrariums], default=0) + 1


def _find_terrarium(tid: int) -> Dict[str, Any]:
    for t in terrariums:
        if int(t.get("id")) == tid:
            return t
    raise HTTPException(status_code=404, detail="Terrarium not found")


def _apply_sensor_to_terrariums(sensor_id: str, temperature: float, humidity: float, ts: int) -> None:
    for t in terrariums:
        if t.get("sensor_id") == sensor_id:
            t["last_temperature"] = temperature
            t["last_humidity"] = humidity
            t["last_ts"] = ts


# -------------------------
# Routes
# -------------------------
@app.get("/health")
def health() -> Dict[str, Any]:
    # ✅ Permet de confirmer que Render a bien redeploy ce fichier
    return {"ok": True, "app": APP_NAME, "version": "cors-fix-002", "ts": int(time.time())}


@app.get("/api/terrariums", response_model=List[TerrariumOut])
def list_terrariums() -> List[Dict[str, Any]]:
    return terrariums


@app.post("/api/terrariums", response_model=TerrariumOut)
def create_terrarium(payload: TerrariumCreate) -> Dict[str, Any]:
    name_lower = payload.name.strip().lower()
    for t in terrariums:
        if str(t.get("name", "")).strip().lower() == name_lower:
            raise HTTPException(status_code=409, detail="Terrarium name already exists")

    tid = _next_terrarium_id()
    item: Dict[str, Any] = {
        "id": tid,
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

    s = sensors.get(item["sensor_id"])
    if s:
        item["last_temperature"] = s.get("last_temperature")
        item["last_humidity"] = s.get("last_humidity")
        item["last_ts"] = s.get("last_ts")

    terrariums.append(item)
    _persist()
    return item


@app.get("/api/terrariums/{terrarium_id}", response_model=TerrariumOut)
def get_terrarium(terrarium_id: int) -> Dict[str, Any]:
    return _find_terrarium(terrarium_id)


@app.put("/api/terrariums/{terrarium_id}", response_model=TerrariumOut)
def update_terrarium(terrarium_id: int, payload: TerrariumUpdate) -> Dict[str, Any]:
    t = _find_terrarium(terrarium_id)

    if payload.name is not None:
        new_name = payload.name.strip()
        if len(new_name) < 2:
            raise HTTPException(status_code=422, detail="Name too short")
        new_lower = new_name.lower()
        for other in terrariums:
            if int(other.get("id")) != terrarium_id and str(other.get("name", "")).strip().lower() == new_lower:
                raise HTTPException(status_code=409, detail="Terrarium name already exists")
        t["name"] = new_name

    if payload.species is not None:
        t["species"] = payload.species.strip() if payload.species else None

    if payload.sensor_id is not None:
        t["sensor_id"] = payload.sensor_id.strip()
        s = sensors.get(t["sensor_id"])
        if s:
            t["last_temperature"] = s.get("last_temperature")
            t["last_humidity"] = s.get("last_humidity")
            t["last_ts"] = s.get("last_ts")

    if payload.target_temp is not None:
        t["target_temp"] = payload.target_temp
    if payload.target_humidity is not None:
        t["target_humidity"] = payload.target_humidity
    if payload.status is not None:
        t["status"] = payload.status

    _persist()
    return t


@app.delete("/api/terrariums/{terrarium_id}")
def delete_terrarium(terrarium_id: int) -> Dict[str, Any]:
    t = _find_terrarium(terrarium_id)
    terrariums.remove(t)
    _persist()
    return {"ok": True}


@app.post("/api/readings")
async def create_reading(payload: ReadingIn) -> Dict[str, Any]:
    ts = int(payload.ts or time.time())
    sensor_id = payload.sensor_id.strip()

    sensors[sensor_id] = {
        "last_temperature": float(payload.temperature),
        "last_humidity": float(payload.humidity),
        "last_ts": ts,
    }

    readings.append(
        {
            "sensor_id": sensor_id,
            "temperature": float(payload.temperature),
            "humidity": float(payload.humidity),
            "ts": ts,
        }
    )
    if len(readings) > 5000:
        readings[:] = readings[-5000:]

    _apply_sensor_to_terrariums(sensor_id, float(payload.temperature), float(payload.humidity), ts)
    _persist()

    await ws_manager.broadcast(
        {
            "type": "sensor_reading",
            "sensor_id": sensor_id,
            "temperature": float(payload.temperature),
            "humidity": float(payload.humidity),
            "ts": ts,
        }
    )

    return {"ok": True}


@app.get("/api/sensors", response_model=List[SensorOut])
def list_sensors() -> List[Dict[str, Any]]:
    now = int(time.time())
    out: List[Dict[str, Any]] = []
    for sid, s in sensors.items():
        last_ts = int(s.get("last_ts") or 0)
        out.append(
            {
                "sensor_id": sid,
                "last_temperature": s.get("last_temperature"),
                "last_humidity": s.get("last_humidity"),
                "last_ts": last_ts or None,
                "online": (now - last_ts) <= 120,
            }
        )
    out.sort(key=lambda x: x["sensor_id"])
    return out


@app.get("/api/sensors/{sensor_id}", response_model=SensorOut)
def get_sensor(sensor_id: str) -> Dict[str, Any]:
    sid = sensor_id.strip()
    if sid not in sensors:
        raise HTTPException(status_code=404, detail="Sensor not found")

    now = int(time.time())
    s = sensors[sid]
    last_ts = int(s.get("last_ts") or 0)
    return {
        "sensor_id": sid,
        "last_temperature": s.get("last_temperature"),
        "last_humidity": s.get("last_humidity"),
        "last_ts": last_ts or None,
        "online": (now - last_ts) <= 120,
    }


@app.websocket("/ws/sensor")
async def ws_sensor(ws: WebSocket) -> None:
    await ws_manager.connect(ws)
    try:
        await ws.send_json({"type": "hello", "ts": int(time.time())})
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        await ws_manager.disconnect(ws)


# Render start command:
# uvicorn main:app --host 0.0.0.0 --port $PORT