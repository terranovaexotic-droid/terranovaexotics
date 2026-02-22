from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from datetime import date
from .settings import settings

app = FastAPI(title="Terranova V3 API")

@app.get("/")
def root():
    return {"status": "Terranova Exotics API is running"}

class ReadingIn(BaseModel):
    terrarium_id: str
    temperature_c: float | None = None
    humidity_pct: float | None = None
    source: str = "esp32"

def require_key(x_api_key: str | None):
    if not x_api_key or x_api_key != settings.API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/api/v1/readings")
def post_reading(payload: ReadingIn, x_api_key: str | None = Header(default=None)):
    require_key(x_api_key)
    # Étape suivante : insert DB + logique alertes
    return {"saved": True, "terrarium_id": payload.terrarium_id}

@app.get("/api/v1/dashboard/today")
def dashboard_today(x_api_key: str | None = Header(default=None)):
    require_key(x_api_key)
    return {"terrariums": [], "alerts_active": [], "tasks_today": [], "low_stock": []}

@app.get("/api/v1/alerts")
def get_alerts(status: str = "ACTIVE", x_api_key: str | None = Header(default=None)):
    require_key(x_api_key)
    return {"items": [], "status": status}

@app.get("/api/v1/tasks")
def get_tasks(day: date | None = None, x_api_key: str | None = Header(default=None)):
    require_key(x_api_key)
    return {"items": [], "day": str(day or date.today())}

@app.get("/api/v1/inventory/low-stock")
def low_stock(x_api_key: str | None = Header(default=None)):
    require_key(x_api_key)
    return {"items": []}