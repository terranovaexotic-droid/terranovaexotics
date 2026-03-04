import { useEffect, useMemo, useRef, useState } from "react";
import { WS_URL } from "../lib/config";

type WSStatus = "connecting" | "open" | "closed" | "error";

export function useSensorWS() {
  const [status, setStatus] = useState<WSStatus>("connecting");
  const [lastMessage, setLastMessage] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const url = useMemo(() => WS_URL, []);

  useEffect(() => {
    setStatus("connecting");
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setStatus("open");
    ws.onclose = () => setStatus("closed");
    ws.onerror = () => setStatus("error");

    ws.onmessage = (ev) => {
      try {
        setLastMessage(JSON.parse(ev.data));
      } catch {
        setLastMessage(ev.data);
      }
    };

    const ping = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.send("ping");
    }, 15000);

    return () => {
      clearInterval(ping);
      try { ws.close(); } catch {}
    };
  }, [url]);

  return { status, lastMessage };
}