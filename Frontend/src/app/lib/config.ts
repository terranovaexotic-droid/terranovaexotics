export const API_BASE =
import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000"

export const WS_BASE =
import.meta.env.VITE_WS_BASE ||
API_BASE.replace("https","wss").replace("http","ws")

export const WS_URL = `${WS_BASE}/ws/sensor`