from __future__ import annotations

import os
import json
import asyncio
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Any, Dict

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .db import get_supabase

# Charge toujours backend/.env
load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / ".env")

APP_NAME = os.getenv("APP_NAME", "Terranova Exotics Backend")
WS_PATH = os.getenv("WS_PATH", "/ws/sensor")

allowed_origins = [
    o.strip()
    for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    if o.strip()
]

app = FastAPI(title=APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------
# WebSocket manager
# ---------------------------
class WSManager:
    def __init__(self) -> None:
        self.clients: set[WebSocket] = set()
        self.lock = asyncio.Lock()

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        async with self.lock:
            self.clients.add(ws)

    async def disconnect(self, ws: WebSocket) -> None:
        async with self.lock:
            self.clients.discard(ws)

    async def broadcast(self, payload: dict) -> None:
        msg = json.dumps(payload, ensure_ascii=False)
        async with self.lock:
            clients = list(self.clients)

        dead: list[WebSocket] = []
        for ws in clients:
            try:
                await ws.send_text(msg)
            except Exception:
                dead.append(ws)

        for ws in dead:
            await self.disconnect(ws)


ws_manager = WSManager()


# ---------------------------
# Models
# ---------------------------
class ReadingIn(BaseModel):
    # Ici sensor_id = code terrarium (ex: "A-01")
    sensor_id: str
    temperature: Optional[float] = None
    humidity: Optional[float] = None


# ---------------------------
# Routes
# ---------------------------
@app.get("/health")
def health() -> dict:
    return {
        "ok": True,
        "name": APP_NAME,
        "ws_path": WS_PATH,
        "allowed_origins": allowed_origins,
    }


@app.get("/api/terrariums")
def list_terrariums() -> dict:
    """
    Retourne les terrariums (12 max) pour afficher sur le dashboard.
    """
    try:
        supa = get_supabase()
        res = (
            supa.table("terrariums")
            .select("*")
            .order("created_at", desc=True)
            .limit(12)
            .execute()
        )
        return {"items": res.data}
    except Exception as e:
        print("SUPABASE LIST TERRARIUMS ERROR:", repr(e))
        raise HTTPException(status_code=500, detail="Erreur Supabase (voir console backend).")


@app.post("/api/readings")
async def create_reading(body: ReadingIn) -> dict:
    """
    1) Insert dans readings
    2) Update du terrarium correspondant (terrariums.sensor_id == body.sensor_id)
    3) Broadcast WS en live
    """
    created_at = datetime.now(timezone.utc).isoformat()

    payload: Dict[str, Any] = {
        "sensor_id": body.sensor_id,
        "temperature": body.temperature,
        "humidity": body.humidity,
        "created_at": created_at,
    }

    try:
        supa = get_supabase()

        # 1) insert readings
        insert_res = supa.table("readings").insert(payload).execute()

        # 2) update terrarium
        # (si aucun terrarium n'existe avec ce sensor_id, ça ne fera rien — c'est OK)
        try:
            supa.table("terrariums").update(
                {
                    "last_temperature": body.temperature,
                    "last_humidity": body.humidity,
                    "last_update": created_at,
                }
            ).eq("sensor_id", body.sensor_id).execute()
        except Exception as e:
            print("SUPABASE UPDATE TERRARIUM ERROR:", repr(e))

    except Exception as e:
        print("SUPABASE INSERT ERROR:", repr(e))
        raise HTTPException(status_code=500, detail="Erreur Supabase (voir console backend).")

    # 3) broadcast
    await ws_manager.broadcast({"type": "reading", "data": payload})

    return {"inserted": True, "data": payload, "db": insert_res.data}


@app.websocket(WS_PATH)
async def ws_sensor(ws: WebSocket):
    await ws_manager.connect(ws)
    try:
        await ws.send_text(json.dumps({"type": "hello", "ws": WS_PATH}))
        while True:
            # garde la connexion ouverte
            await ws.receive_text()
    except WebSocketDisconnect:
        await ws_manager.disconnect(ws)
    except Exception:
        await ws_manager.disconnect(ws)