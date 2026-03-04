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

type SensorReadingMsg = {
  type: "sensor_reading";
  sensor_id: string;
  temperature: number | null;
  humidity: number | null;
};

function isSensorReadingMsg(x: unknown): x is SensorReadingMsg {
  if (!x || typeof x !== "object") return false;
  const o = x as any;
  return (
    o.type === "sensor_reading" &&
    typeof o.sensor_id === "string" &&
    ("temperature" in o) &&
    ("humidity" in o)
  );
}

function badgeClassesForWS(status: string) {
  if (status === "open" || status === "connected") {
    return "bg-emerald-500/10 text-emerald-200 border-emerald-500/30";
  }
  if (status === "connecting") {
    return "bg-amber-500/10 text-amber-200 border-amber-500/30";
  }
  return "bg-rose-500/10 text-rose-200 border-rose-500/30";
}

function statusDotForTerrarium(t: Terrarium) {
  const hasData = t.last_temperature != null && t.last_humidity != null;
  return hasData ? "bg-emerald-400" : "bg-zinc-500";
}

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
        setError(e?.message || "Erreur lors du chargement des terrariums.");
      }
    })();
  }, []);

  // apply realtime updates
  useEffect(() => {
    if (!isSensorReadingMsg(lastMessage)) return;

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
    return terrariums.filter(
      (t) => t.last_temperature != null && t.last_humidity != null
    ).length;
  }, [terrariums]);

  const avgTemp = useMemo(() => {
    const vals = terrariums
      .map((t) => t.last_temperature)
      .filter((v): v is number => typeof v === "number");
    if (!vals.length) return null;
    const sum = vals.reduce((a, b) => a + b, 0);
    return sum / vals.length;
  }, [terrariums]);

  const avgHum = useMemo(() => {
    const vals = terrariums
      .map((t) => t.last_humidity)
      .filter((v): v is number => typeof v === "number");
    if (!vals.length) return null;
    const sum = vals.reduce((a, b) => a + b, 0);
    return sum / vals.length;
  }, [terrariums]);

  return (
    <div className="min-h-screen bg-[#0C0F0E] text-[#E8F5F2]">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <div className="mt-2 flex items-center gap-2 text-sm text-white/70">
              <span>WebSocket</span>
              <span
                className={[
                  "px-2 py-1 rounded-md border text-xs font-medium",
                  badgeClassesForWS(String(wsStatus || "closed")),
                ].join(" ")}
              >
                {String(wsStatus || "closed")}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="px-3 py-2 rounded-xl border border-white/10 bg-white/5">
              <div className="text-xs text-white/60">Terrariums</div>
              <div className="text-lg font-semibold">{total}</div>
            </div>
            <div className="px-3 py-2 rounded-xl border border-emerald-400/20 bg-emerald-500/5">
              <div className="text-xs text-white/60">Avec données</div>
              <div className="text-lg font-semibold">{onlineCount}</div>
            </div>
            <div className="px-3 py-2 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5">
              <div className="text-xs text-white/60">Temp. moyenne</div>
              <div className="text-lg font-semibold">
                {avgTemp == null ? "—" : avgTemp.toFixed(1)}°C
              </div>
            </div>
            <div className="px-3 py-2 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5">
              <div className="text-xs text-white/60">Hum. moyenne</div>
              <div className="text-lg font-semibold">
                {avgHum == null ? "—" : avgHum.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-rose-100">
            {error}
          </div>
        )}

        {/* List */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Terrariums</h2>
            <div className="text-sm text-white/60">
              {onlineCount}/{total} actifs
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {terrariums.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          "inline-block h-2.5 w-2.5 rounded-full",
                          statusDotForTerrarium(t),
                        ].join(" ")}
                        title="Statut données"
                      />
                      <div className="font-semibold truncate">{t.name}</div>
                    </div>

                    <div className="mt-1 text-sm text-white/60 truncate">
                      {t.species || "Espèce non définie"}
                    </div>

                    <div className="mt-2 text-xs text-white/50">
                      Capteur: <span className="text-white/70 font-medium">{t.sensor_id}</span>
                    </div>
                  </div>

                  <div className="text-xs px-2 py-1 rounded-lg border border-[#D4AF37]/25 bg-[#D4AF37]/10 text-[#F3E7B6]">
                    {t.status || "ok"}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <div className="text-xs text-white/60">Température</div>
                    <div className="mt-1 text-lg font-semibold">
                      {t.last_temperature == null ? "—" : t.last_temperature.toFixed(1)}°C
                    </div>
                    <div className="mt-1 text-xs text-white/45">
                      Cible: {t.target_temp == null ? "—" : `${t.target_temp.toFixed(1)}°C`}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <div className="text-xs text-white/60">Humidité</div>
                    <div className="mt-1 text-lg font-semibold">
                      {t.last_humidity == null ? "—" : `${Math.round(t.last_humidity)}%`}
                    </div>
                    <div className="mt-1 text-xs text-white/45">
                      Cible: {t.target_humidity == null ? "—" : `${Math.round(t.target_humidity)}%`}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {terrariums.length === 0 && !error && (
              <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
                Aucun terrarium trouvé. Vérifiez que l’API `/api/terrariums` retourne bien des données.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}