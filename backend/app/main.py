from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Optional, List

from fastapi import FastAPI, Header, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.orm import Session

from .db import get_db  # backend/app/db.py (que je t'ai donné)
from .settings import settings  # backend/app/settings.py (API_KEY, etc.)

app = FastAPI(title="Terranova Exotics API", version="1.0.0")

# CORS (optionnel, mais pratique si tu consommes l'API depuis une app web)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Mets ton domaine plus tard au lieu de "*"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Models
# -----------------------------
class ReadingIn(BaseModel):
    terrarium_id: str = Field(..., min_length=1, max_length=64)
    temperature_c: Optional[float] = None
    humidity_pct: Optional[float] = None
    source: str = "esp32"


class ReadingOut(BaseModel):
    id: int
    terrarium_id: str
    temperature_c: Optional[float] = None
    humidity_pct: Optional[float] = None
    source: Optional[str] = None
    created_at: datetime


# -----------------------------
# Security helper
# -----------------------------
def require_key(x_api_key: Optional[str]) -> None:
    if not settings.API_KEY:
        # Si tu veux bloquer totalement quand API_KEY n'existe pas :
        raise HTTPException(status_code=500, detail="API_KEY is not configured on the server")

    if not x_api_key or x_api_key != settings.API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")


# -----------------------------
# Basic endpoints
# -----------------------------
@app.get("/")
def root():
    return {"status": "Terranova Exotics API is running"}


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/version")
def version():
    return {
        "service": "terranovaexotics-api",
        "render_commit": os.getenv("RENDER_GIT_COMMIT", "unknown"),
        "api_key_configured": bool(settings.API_KEY),
        "db_configured": bool(os.getenv("DATABASE_URL")),
        "time_utc": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/db-check")
def db_check(db: Session = Depends(get_db)):
    try:
        v = db.execute(text("select 1")).scalar()
        return {"db_ok": v == 1}
    except Exception as e:
        # Ne pas exposer trop de détails en prod, mais utile au début
        raise HTTPException(status_code=500, detail=f"DB error: {type(e).__name__}")


# -----------------------------
# Readings endpoints (Supabase table: readings)
# -----------------------------
@app.post("/api/v1/readings")
def create_reading(
    payload: ReadingIn,
    x_api_key: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    require_key(x_api_key)

    # INSERT + retourne l'enregistrement créé
    try:
        row = db.execute(
            text(
                """
                insert into readings (terrarium_id, temperature_c, humidity_pct, source)
                values (:terrarium_id, :temperature_c, :humidity_pct, :source)
                returning id, terrarium_id, temperature_c, humidity_pct, source, created_at
                """
            ),
            {
                "terrarium_id": payload.terrarium_id,
                "temperature_c": payload.temperature_c,
                "humidity_pct": payload.humidity_pct,
                "source": payload.source,
            },
        ).mappings().first()

        db.commit()

        if not row:
            raise HTTPException(status_code=500, detail="Insert failed")

        # FastAPI convertit datetime automatiquement
        return dict(row)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        # Erreur 500 claire au début (tu pourras durcir plus tard)
        raise HTTPException(status_code=500, detail=f"DB insert error: {type(e).__name__}")


@app.get("/api/v1/readings", response_model=List[ReadingOut])
def list_readings(
    terrarium_id: Optional[str] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=500),
    x_api_key: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    require_key(x_api_key)

    try:
        if terrarium_id:
            rows = db.execute(
                text(
                    """
                    select id, terrarium_id, temperature_c, humidity_pct, source, created_at
                    from readings
                    where terrarium_id = :terrarium_id
                    order by created_at desc
                    limit :limit
                    """
                ),
                {"terrarium_id": terrarium_id, "limit": limit},
            ).mappings().all()
        else:
            rows = db.execute(
                text(
                    """
                    select id, terrarium_id, temperature_c, humidity_pct, source, created_at
                    from readings
                    order by created_at desc
                    limit :limit
                    """
                ),
                {"limit": limit},
            ).mappings().all()

        return [dict(r) for r in rows]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB read error: {type(e).__name__}")