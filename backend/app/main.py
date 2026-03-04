from __future__ import annotations

import os
import json
import time
import asyncio
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# -------------------------
# Config
# -------------------------
APP_NAME = os.getenv("APP_NAME", "Terranova Exotics Backend")

DEFAULT_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

FRONTEND_ORIGINS_ENV = os.getenv("FRONTEND_ORIGINS", "")
EXTRA_ORIGINS = [o.strip() for o in FRONTEND_ORIGINS_ENV.split(",") if o.strip()]
ALLOWED_ORIGINS = list(dict.fromkeys(DEFAULT_ORIGINS + EXTRA_ORIGINS))

# Autoriser tous les previews vercel si tu veux (optionnel)
ALLOW_VERCEL_REGEX = os.getenv("ALLOW_VERCEL_REGEX", "1") == "1"

WS_PATH = os.getenv("WS_PATH", "/ws/sensor")

SIM_ENABLED = os.getenv("SIM_ENABLED", "0") == "1"
SIM_INTERVAL_SEC = float(os.getenv("SIM_INTERVAL_SEC", "1.0"))

# -------------------------
# App
# -------------------------
app = FastAPI(title=APP_NAME, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"^https://.*\.vercel\.app$" if ALLOW_VERCEL_REGEX else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Storage (JSON simple) + support DATA_DIR (cloud disk)
# -------------------------
BASE_DIR = os.path.dirname(__file__)

DATA_DIR = os.getenv("DATA_DIR", os.path.join(BASE_DIR, "data"))
os.makedirs(DATA_DIR, exist_ok=True)

TERRARIUMS_FILE = os.path.join(DATA_DIR, "terrariums.json")
READINGS_FILE = os.path.join(DATA_DIR, "readings.json")


def _read_json(path: str, default: Any) -> Any:
    try:
        if not os.path.exists(path):
            return default
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default


def _write_json(path: str, value: Any) -> None:
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(value, f, ensure_ascii=False, indent=2)
    os.replace(tmp, path)


def _ensure_files() -> None:
    if not os.path.exists(TERRARIUMS_FILE):
        _write_json(TERRARIUMS_FILE, [])
    if not os.path.exists(READINGS_FILE):
        _write_json(READINGS_FILE, [])


_ensure_files()


def _next_id(items: List[Dict[str, Any]]) -> int:
    m = 0
    for it in items:
        try:
            m = max(m, int(it.get("id", 0)))
        except Exception:
            pass
    return m + 1


# -------------------------
# WebSocket manager
# -------------------------
class WSManager:
    def __init__(self) -> None:
        self.clients: List[WebSocket] = []

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        self.clients.append(ws)

    def disconnect(self, ws: WebSocket) -> None:
        if ws in self.clients:
            self.clients.remove(ws)

    async def broadcast(self, payload: Dict[str, Any]) -> None:
        dead: List[WebSocket] = []
        msg = json.dumps(payload)
        for ws in self.clients:
            try:
                await ws.send_text(msg)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


ws_manager = WSManager()


@app.websocket(WS_PATH)
async def ws_sensor(ws: WebSocket) -> None:
    await ws_manager.connect(ws)
    try:
        while True:
            msg = await ws.receive_text()
            if msg == "ping":
                await ws.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(ws)
    except Exception:
        ws_manager.disconnect(ws)


# -------------------------
# Helpers: last reading by sensor_id
# -------------------------
def _get_last_by_sensor(sensor_id: str) -> Optional[Dict[str, Any]]:
    readings = _read_json(READINGS_FILE, [])
    if not isinstance(readings, list):
        return None
    for item in reversed(readings):
        if str(item.get("sensor_id", "")).strip() == sensor_id:
            return item
    return None


def _enrich_terrarium(t: Dict[str, Any]) -> Dict[str, Any]:
    sensor_id = str(t.get("sensor_id", "")).strip()
    last = _get_last_by_sensor(sensor_id) if sensor_id else None
    return {
        **t,
        "last_temperature": last.get("temperature") if last else None,
        "last_humidity": last.get("humidity") if last else None,
        "last_ts": last.get("ts") if last else None,
    }


# -------------------------
# Routes
# -------------------------
@app.get("/health")
def health() -> Dict[str, Any]:
    return {
        "ok": True,
        "name": APP_NAME,
        "ws_path": WS_PATH,
        "allowed_origins": ALLOWED_ORIGINS,
        "allow_vercel_regex": ALLOW_VERCEL_REGEX,
        "data_dir": DATA_DIR,
        "sim_enabled": SIM_ENABLED,
    }


@app.get("/api/terrariums")
def list_terrariums() -> List[Dict[str, Any]]:
    terrariums = _read_json(TERRARIUMS_FILE, [])
    if not isinstance(terrariums, list):
        terrariums = []
    return [_enrich_terrarium(t) for t in terrariums]


@app.get("/api/terrariums/{terrarium_id}")
def get_terrarium(terrarium_id: int) -> Dict[str, Any]:
    terrariums = _read_json(TERRARIUMS_FILE, [])
    if not isinstance(terrariums, list):
        terrariums = []

    for t in terrariums:
        if int(t.get("id", -1)) == terrarium_id:
            return _enrich_terrarium(t)

    raise HTTPException(status_code=404, detail="terrarium introuvable")


@app.post("/api/terrariums")
def create_terrarium(payload: Dict[str, Any]) -> Dict[str, Any]:
    name = str(payload.get("name", "")).strip()
    sensor_id = str(payload.get("sensor_id", "")).strip()
    species = payload.get("species", None)

    if not name:
        raise HTTPException(status_code=400, detail="name requis")
    if not sensor_id:
        raise HTTPException(status_code=400, detail="sensor_id requis")

    terrariums = _read_json(TERRARIUMS_FILE, [])
    if not isinstance(terrariums, list):
        terrariums = []

    # éviter doublon sensor_id
    for t in terrariums:
        if str(t.get("sensor_id", "")).strip() == sensor_id:
            raise HTTPException(status_code=400, detail="sensor_id déjà utilisé")

    item = {
        "id": _next_id(terrariums),
        "name": name,
        "sensor_id": sensor_id,
        "species": species,
        "target_temp": payload.get("target_temp", None),
        "target_humidity": payload.get("target_humidity", None),
        "status": payload.get("status", "ok"),
        "created_at": time.time(),
    }

    terrariums.append(item)
    _write_json(TERRARIUMS_FILE, terrariums)
    return {"ok": True, "terrarium": item}


@app.put("/api/terrariums/{terrarium_id}")
def update_terrarium(terrarium_id: int, payload: Dict[str, Any]) -> Dict[str, Any]:
    terrariums = _read_json(TERRARIUMS_FILE, [])
    if not isinstance(terrariums, list):
        terrariums = []

    idx = None
    for i, t in enumerate(terrariums):
        if int(t.get("id", -1)) == terrarium_id:
            idx = i
            break
    if idx is None:
        raise HTTPException(status_code=404, detail="terrarium introuvable")

    name = str(payload.get("name", terrariums[idx].get("name", ""))).strip()
    sensor_id = str(payload.get("sensor_id", terrariums[idx].get("sensor_id", ""))).strip()

    if not name:
        raise HTTPException(status_code=400, detail="name requis")
    if not sensor_id:
        raise HTTPException(status_code=400, detail="sensor_id requis")

    # éviter doublon sensor_id (sauf lui-même)
    for t in terrariums:
        if int(t.get("id", -1)) != terrarium_id and str(t.get("sensor_id", "")).strip() == sensor_id:
            raise HTTPException(status_code=400, detail="sensor_id déjà utilisé")

    terrariums[idx] = {
        **terrariums[idx],
        "name": name,
        "species": payload.get("species", terrariums[idx].get("species", None)),
        "sensor_id": sensor_id,
        "target_temp": payload.get("target_temp", terrariums[idx].get("target_temp", None)),
        "target_humidity": payload.get("target_humidity", terrariums[idx].get("target_humidity", None)),
        "status": payload.get("status", terrariums[idx].get("status", "ok")),
        "updated_at": time.time(),
    }

    _write_json(TERRARIUMS_FILE, terrariums)
    return {"ok": True, "terrarium": terrariums[idx]}


@app.delete("/api/terrariums/{terrarium_id}")
def delete_terrarium(terrarium_id: int) -> Dict[str, Any]:
    terrariums = _read_json(TERRARIUMS_FILE, [])
    if not isinstance(terrariums, list):
        terrariums = []

    before = len(terrariums)
    terrariums = [t for t in terrariums if int(t.get("id", -1)) != terrarium_id]
    after = len(terrariums)

    if after == before:
        raise HTTPException(status_code=404, detail="terrarium introuvable")

    _write_json(TERRARIUMS_FILE, terrariums)
    return {"ok": True}


@app.post("/api/readings")
async def create_reading(payload: Dict[str, Any]) -> Dict[str, Any]:
    sensor_id = str(payload.get("sensor_id", "")).strip()
    temperature = payload.get("temperature", None)
    humidity = payload.get("humidity", None)

    if not sensor_id:
        raise HTTPException(status_code=400, detail="sensor_id requis")

    item = {
        "ts": time.time(),
        "sensor_id": sensor_id,
        "temperature": temperature,
        "humidity": humidity,
        "type": "sensor_reading",
    }

    readings = _read_json(READINGS_FILE, [])
    if not isinstance(readings, list):
        readings = []

    readings.append(item)
    _write_json(READINGS_FILE, readings[-2000:])

    # push en temps réel
    await ws_manager.broadcast(item)
    return {"ok": True}


# -------------------------
# Sensors (réels, basés sur les readings)
# -------------------------
@app.get("/api/sensors")
def list_sensors() -> List[Dict[str, Any]]:
    """
    Liste des capteurs détectés d'après les readings.
    Un capteur "existe" dès qu'on a reçu au moins une lecture.
    """
    readings = _read_json(READINGS_FILE, [])
    if not isinstance(readings, list):
        readings = []

    terrariums = _read_json(TERRARIUMS_FILE, [])
    if not isinstance(terrariums, list):
        terrariums = []

    terr_map: Dict[str, Dict[str, Any]] = {}
    for t in terrariums:
        sid = str(t.get("sensor_id", "")).strip()
        if sid:
            terr_map[sid] = t

    last_by: Dict[str, Dict[str, Any]] = {}
    for r in readings:
        sid = str(r.get("sensor_id", "")).strip()
        if not sid:
            continue
        last_by[sid] = r

    out: List[Dict[str, Any]] = []
    now = time.time()
    for sid, last in last_by.items():
        ts = float(last.get("ts") or 0.0)
        age_sec = max(0.0, now - ts)
        online = age_sec <= 120.0  # 2 minutes

        t = terr_map.get(sid)
        out.append(
            {
                "sensor_id": sid,
                "last_ts": ts,
                "age_sec": round(age_sec, 1),
                "online": online,
                "temperature": last.get("temperature"),
                "humidity": last.get("humidity"),
                "terrarium": (
                    {"id": t.get("id"), "name": t.get("name"), "species": t.get("species")}
                    if t
                    else None
                ),
            }
        )

    out.sort(key=lambda x: (not x["online"], -(x["last_ts"] or 0)))
    return out


@app.get("/api/sensors/{sensor_id}")
def get_sensor(sensor_id: str) -> Dict[str, Any]:
    sensor_id = str(sensor_id).strip()
    if not sensor_id:
        raise HTTPException(status_code=400, detail="sensor_id requis")

    last = _get_last_by_sensor(sensor_id)
    if not last:
        raise HTTPException(status_code=404, detail="capteur introuvable")

    now = time.time()
    ts = float(last.get("ts") or 0.0)
    age_sec = max(0.0, now - ts)
    online = age_sec <= 120.0

    terrariums = _read_json(TERRARIUMS_FILE, [])
    if not isinstance(terrariums, list):
        terrariums = []

    terr = None
    for t in terrariums:
        if str(t.get("sensor_id", "")).strip() == sensor_id:
            terr = {"id": t.get("id"), "name": t.get("name"), "species": t.get("species")}
            break

    return {
        "sensor_id": sensor_id,
        "last_ts": ts,
        "age_sec": round(age_sec, 1),
        "online": online,
        "temperature": last.get("temperature"),
        "humidity": last.get("humidity"),
        "terrarium": terr,
    }


# -------------------------
# Simulation (optionnel)
# -------------------------
async def _sim_loop() -> None:
    import random

    while True:
        await asyncio.sleep(SIM_INTERVAL_SEC)
        terrariums = _read_json(TERRARIUMS_FILE, [])
        if not isinstance(terrariums, list) or not terrariums:
            continue

        for t in terrariums:
            sid = str(t.get("sensor_id", "")).strip()
            if not sid:
                continue
            item = {
                "ts": time.time(),
                "sensor_id": sid,
                "temperature": round(24.0 + random.random() * 4.0, 2),
                "humidity": round(55.0 + random.random() * 20.0, 2),
                "type": "sensor_reading",
            }
            readings = _read_json(READINGS_FILE, [])
            if not isinstance(readings, list):
                readings = []
            readings.append(item)
            _write_json(READINGS_FILE, readings[-2000:])
            await ws_manager.broadcast(item)


@app.on_event("startup")
async def on_startup() -> None:
    if SIM_ENABLED:
        asyncio.create_task(_sim_loop())