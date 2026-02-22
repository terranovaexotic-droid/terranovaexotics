import os
import time
import logging
from datetime import datetime, date
from typing import Optional, List, Literal

from fastapi import FastAPI, Header, HTTPException, Depends, Query
from pydantic import BaseModel, Field

from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Float,
    DateTime,
    text,
    Index,
)
from sqlalchemy.orm import sessionmaker, declarative_base, Session


# -----------------------------------------------------------------------------
# Logging
# -----------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
log = logging.getLogger("terranova-api")


# -----------------------------------------------------------------------------
# Config (Render env vars)
# -----------------------------------------------------------------------------
API_KEY = os.getenv("API_KEY", "").strip()
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

# Render exposes this (useful for /version)
RENDER_GIT_COMMIT = os.getenv("RENDER_GIT_COMMIT", "unknown")
SERVICE_NAME = os.getenv("RENDER_SERVICE_NAME", "terranovaexotics-api")


def require_env():
    """Fail fast if critical env vars are missing."""
    if not API_KEY:
        log.warning("API_KEY is missing (set Render env var API_KEY).")
    if not DATABASE_URL:
        log.warning("DATABASE_URL is missing (set Render env var DATABASE_URL).")


# -----------------------------------------------------------------------------
# DB (SQLAlchemy)
# -----------------------------------------------------------------------------
Base = declarative_base()

# Pool settings: safe defaults for Render
# (Supabase pooler recommended; keep pool size modest)
engine = None
SessionLocal = None


def init_db():
    global engine, SessionLocal
    if not DATABASE_URL:
        return

    # Important: Supabase gives postgresql://... which SQLAlchemy supports.
    # If you use Supabase "pooler", it often needs SSL; Supabase strings usually include it.
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_size=int(os.getenv("DB_POOL_SIZE", "5")),
        max_overflow=int(os.getenv("DB_MAX_OVERFLOW", "5")),
        pool_recycle=int(os.getenv("DB_POOL_RECYCLE", "1800")),
        future=True,
    )
    SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, future=True)


def get_db() -> Session:
    if SessionLocal is None:
        raise HTTPException(status_code=500, detail="Database not configured (DATABASE_URL missing).")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class Reading(Base):
    __tablename__ = "readings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    terrarium_id = Column(String(64), nullable=False, index=True)
    temperature_c = Column(Float, nullable=True)
    humidity_pct = Column(Float, nullable=True)
    source = Column(String(32), nullable=False, default="esp32")
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_readings_terrarium_created", "terrarium_id", "created_at"),
    )


# -----------------------------------------------------------------------------
# API models
# -----------------------------------------------------------------------------
class ReadingIn(BaseModel):
    terrarium_id: str = Field(..., min_length=1, max_length=64)
    temperature_c: Optional[float] = None
    humidity_pct: Optional[float] = None
    source: str = Field(default="esp32", max_length=32)


class ReadingOut(BaseModel):
    id: int
    terrarium_id: str
    temperature_c: Optional[float]
    humidity_pct: Optional[float]
    source: str
    created_at: datetime


class ReadingsListOut(BaseModel):
    items: List[ReadingOut]


class VersionOut(BaseModel):
    service: str
    render_commit: str
    api_key_configured: bool
    db_configured: bool
    time_utc: str


# -----------------------------------------------------------------------------
# Security: x-api-key
# -----------------------------------------------------------------------------
def require_key(x_api_key: Optional[str]):
    if not API_KEY:
        # If you prefer to hard-fail when API_KEY missing, replace with HTTPException(500)
        raise HTTPException(status_code=500, detail="API_KEY not configured on server.")
    if not x_api_key or x_api_key.strip() != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")


def api_key_dep(x_api_key: Optional[str] = Header(default=None)) -> str:
    require_key(x_api_key)
    return x_api_key


# -----------------------------------------------------------------------------
# FastAPI app
# -----------------------------------------------------------------------------
app = FastAPI(
    title="Terranova Exotics API",
    version="1.0.0",
)


@app.on_event("startup")
def on_startup():
    require_env()
    init_db()

    # Create tables automatically for now (simple + reliable).
    # Pro next step would be Alembic migrations.
    if engine is not None:
        Base.metadata.create_all(bind=engine)
        log.info("DB initialized and tables ensured.")


# -----------------------------------------------------------------------------
# Basic endpoints
# -----------------------------------------------------------------------------
@app.get("/", tags=["system"])
def root():
    return {"status": "Terranova Exotics API is running"}


@app.get("/health", tags=["system"])
def health():
    return {"ok": True}


@app.get("/version", response_model=VersionOut, tags=["system"])
def version():
    return VersionOut(
        service=SERVICE_NAME,
        render_commit=RENDER_GIT_COMMIT,
        api_key_configured=bool(API_KEY),
        db_configured=bool(DATABASE_URL),
        time_utc=datetime.utcnow().isoformat() + "Z",
    )


@app.get("/db-check", tags=["system"])
def db_check(_=Depends(api_key_dep), db: Session = Depends(get_db)):
    # Simple connectivity check
    try:
        v = db.execute(text("select 1")).scalar()
        return {"db_ok": v == 1}
    except Exception as e:
        log.exception("DB check failed")
        raise HTTPException(status_code=500, detail=f"DB check failed: {type(e).__name__}")


# -----------------------------------------------------------------------------
# Readings endpoints (DB real)
# -----------------------------------------------------------------------------
@app.post("/api/v1/readings", response_model=ReadingOut, tags=["readings"])
def post_reading(
    payload: ReadingIn,
    _=Depends(api_key_dep),
    db: Session = Depends(get_db),
):
    try:
        row = Reading(
            terrarium_id=payload.terrarium_id.strip(),
            temperature_c=payload.temperature_c,
            humidity_pct=payload.humidity_pct,
            source=(payload.source or "esp32").strip(),
            created_at=datetime.utcnow(),
        )
        db.add(row)
        db.commit()
        db.refresh(row)

        return ReadingOut(
            id=row.id,
            terrarium_id=row.terrarium_id,
            temperature_c=row.temperature_c,
            humidity_pct=row.humidity_pct,
            source=row.source,
            created_at=row.created_at,
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        log.exception("Failed to insert reading")
        raise HTTPException(status_code=500, detail=f"Insert failed: {type(e).__name__}")


@app.get("/api/v1/readings/latest", response_model=ReadingsListOut, tags=["readings"])
def latest_readings(
    terrarium_id: Optional[str] = Query(default=None, max_length=64),
    limit: int = Query(default=20, ge=1, le=200),
    _=Depends(api_key_dep),
    db: Session = Depends(get_db),
):
    q = db.query(Reading)
    if terrarium_id:
        q = q.filter(Reading.terrarium_id == terrarium_id.strip())

    rows = q.order_by(Reading.created_at.desc()).limit(limit).all()

    return ReadingsListOut(
        items=[
            ReadingOut(
                id=r.id,
                terrarium_id=r.terrarium_id,
                temperature_c=r.temperature_c,
                humidity_pct=r.humidity_pct,
                source=r.source,
                created_at=r.created_at,
            )
            for r in rows
        ]
    )


# -----------------------------------------------------------------------------
# Dashboard skeleton (ready for next modules)
# -----------------------------------------------------------------------------
@app.get("/api/v1/dashboard/today", tags=["dashboard"])
def dashboard_today(_=Depends(api_key_dep)):
    # Prochaine étape: agréger DB (readings, tasks, alerts, stock, etc.)
    return {
        "terrariums": [],
        "alerts_active": [],
        "tasks_today": [],
        "low_stock": [],
    }


@app.get("/api/v1/alerts", tags=["alerts"])
def alerts(
    status: Literal["ACTIVE", "ALL", "RESOLVED"] = Query(default="ACTIVE"),
    _=Depends(api_key_dep),
):
    # Prochaine étape: table alerts + règles (temp/hum)
    return {"items": [], "status": status}


@app.get("/api/v1/tasks", tags=["tasks"])
def tasks(
    day: Optional[date] = None,
    _=Depends(api_key_dep),
):
    # Prochaine étape: table tasks + planification
    return {"items": [], "day": str(day or date.today())}