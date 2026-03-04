import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../lib/api";
import { useSensorWS } from "../hooks/useSensorWS";

type Terrarium = {
  id: number;
  name: string;
  species?: string | null;
  sensor_id: string;
  target_temp?: number | null;
  target_humidity?: number | null;
  status?: string | null;
  last_temperature?: number | null;
  last_humidity?: number | null;
};

export default function Dashboard() {
  const [terrariums, setTerrariums] = useState<Terrarium[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { status: wsStatus, lastMessage } = useSensorWS();

  // load initial
  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const data = await apiGet<Terrarium[]>("/api/terrariums");
        setTerrariums(data);
      } catch (e: any) {
        setError(e?.message || "Erreur");
      }
    })();
  }, []);

  // apply realtime updates
  useEffect(() => {
    if (!lastMessage || typeof lastMessage !== "object") return;
    if (lastMessage.type !== "sensor_reading") return;

    const { sensor_id, temperature, humidity } = lastMessage;

    setTerrariums((prev) =>
      prev.map((t) =>
        t.sensor_id === sensor_id
          ? { ...t, last_temperature: temperature, last_humidity: humidity }
          : t
      )
    );
  }, [lastMessage]);

  const total = terrariums.length;

  const onlineCount = useMemo(() => {
    return terrariums.filter((t) => t.last_temperature != null && t.last_humidity != null).length;
  }, [terrariums]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>
      <div style={{ opacity: 0.8, marginBottom: 10 }}>
        WS: <b>{wsStatus}</b>
      </div>

      {error && <div style={{ color: "salmon" }}>{error}</div>}

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div style={{ padding: 12, border: "1px solid #333", borderRadius: 10 }}>
          Terrariums: <b>{total}</b>
        </div>
        <div style={{ padding: 12, border: "1px solid #333", borderRadius: 10 }}>
          Avec données: <b>{onlineCount}</b>
        </div>
      </div>

      <h2>Terrariums</h2>
      <div style={{ display: "grid", gap: 10 }}>
        {terrariums.map((t) => (
          <div key={t.id} style={{ padding: 12, border: "1px solid #333", borderRadius: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <b>{t.name}</b> — {t.species || "—"} — capteur: <b>{t.sensor_id}</b>
              </div>
              <div>{t.status || "ok"}</div>
            </div>

            <div style={{ marginTop: 8, opacity: 0.9 }}>
              Temp: <b>{t.last_temperature ?? "—"}</b> °C | Hum: <b>{t.last_humidity ?? "—"}</b> %
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}