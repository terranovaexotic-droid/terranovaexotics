export const API_BASE =
  import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";

export const WS_URL =
  import.meta.env.VITE_WS_URL ??
  (API_BASE.startsWith("https")
    ? API_BASE.replace("https", "wss") + "/ws/sensor"
    : API_BASE.replace("http", "ws") + "/ws/sensor");