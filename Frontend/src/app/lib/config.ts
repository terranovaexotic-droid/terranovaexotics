export const API_BASE = "https://terranova-backend-dpqj.onrender.com"
export const WS_URL = "wss://terranova-backend-dpqj.onrender.com/ws/sensor"
export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

export const WS_BASE =
  import.meta.env.VITE_WS_BASE ||
  (API_BASE.startsWith("https")
    ? API_BASE.replace("https", "wss")
    : API_BASE.replace("http", "ws"));

export const WS_URL = `${WS_BASE}/ws/sensor`;