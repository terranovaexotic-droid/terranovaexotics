import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "../components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { StatusBadge } from "../components/StatusBadge";
import { apiGet, apiPut } from "../lib/api";
import {
  RefreshCw,
  Thermometer,
  Droplets,
  Link2,
  PlugZap,
  ShieldAlert,
  Plus,
} from "lucide-react";

type SensorRow = {
  sensor_id: string;
  online: boolean;
  age_sec: number;
  last_ts: number;
  temperature: number | null;
  humidity: number | null;
  terrarium: { id: number; name: string; species?: string | null } | null;
};

type Terrarium = {
  id: number;
  name: string;
  species?: string | null;
  sensor_id: string;
  target_temp?: number | null;
  target_humidity?: number | null;
  status?: string | null;
};

function formatAge(ageSec: number) {
  if (!Number.isFinite(ageSec)) return "—";
  if (ageSec < 60) return `${Math.round(ageSec)} s`;
  const m = Math.floor(ageSec / 60);
  const s = Math.round(ageSec % 60);
  return `${m} min ${s} s`;
}

export default function Sensors() {
  const [sensors, setSensors] = useState<SensorRow[]>([]);
  const [terrariums, setTerrariums] = useState<Terrarium[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function loadAll() {
    try {
      setErr(null);
      setLoading(true);

      // IMPORTANT: ces 2 appels doivent apparaître dans DevTools > Network (Fetch/XHR)
      const [s, t] = await Promise.all([
        apiGet<SensorRow[]>("/api/sensors"),
        apiGet<Terrarium[]>("/api/terrariums"),
      ]);

      setSensors(Array.isArray(s) ? s : []);
      setTerrariums(Array.isArray(t) ? t : []);
    } catch (e: any) {
      setErr(e?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    const it = setInterval(loadAll, 15000);
    return () => clearInterval(it);
  }, []);

  const stats = useMemo(() => {
    const total = sensors.length;
    const online = sensors.filter((s) => s.online).length;
    const assigned = sensors.filter((s) => !!s.terrarium).length;
    const available = Math.max(0, total - assigned);
    const combo = sensors.filter((s) => s.temperature != null && s.humidity != null).length;
    return { total, online, assigned, available, combo };
  }, [sensors]);

  async function assignSensorToTerrarium(sensor_id: string, terrarium_id: number) {
    const t = terrariums.find((x) => x.id === terrarium_id);
    if (!t) return;

    await apiPut(`/api/terrariums/${terrarium_id}`, {
      name: t.name,
      species: t.species ?? null,
      sensor_id, // <-- on assigne le capteur ici
      target_temp: t.target_temp ?? null,
      target_humidity: t.target_humidity ?? null,
      status: t.status ?? "ok",
    });

    await loadAll();
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-white">Gestion des capteurs</h1>
            <p className="text-gray-400 mt-1">
              Capteurs détectés automatiquement via les lectures (cloud)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10"
              onClick={loadAll}
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>

            <Button
              className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90"
              onClick={() => {
                alert(
                  "Un capteur apparaît automatiquement dès qu’il envoie une lecture au cloud (POST /api/readings)."
                );
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un capteur
            </Button>
          </div>
        </div>

        {/* Error */}
        {err && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {err}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#121212] border-[#D4AF37]/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total capteurs</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#D4AF37]/10">
                  <PlugZap className="w-6 h-6 text-[#D4AF37]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#D4AF37]/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">En ligne</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.online}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#10B981]/10">
                  <StatusBadge status="ok" label="OK" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#D4AF37]/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">Assignés</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.assigned}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#D4AF37]/10">
                  <Link2 className="w-6 h-6 text-[#D4AF37]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#D4AF37]/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">Capteurs combo</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.combo}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#10B981]/10">
                  <Droplets className="w-6 h-6 text-[#10B981]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* List */}
        <Card className="bg-[#121212] border-[#D4AF37]/20">
          <CardHeader>
            <CardTitle className="text-white">Liste des capteurs</CardTitle>
            <p className="text-gray-400 text-sm">
              Un capteur apparaît dès qu’une lecture est reçue sur le cloud.
            </p>
          </CardHeader>

          <CardContent className="space-y-3">
            {sensors.length === 0 && (
              <div className="rounded-lg border border-[#D4AF37]/15 bg-black/20 p-4 text-gray-400">
                Aucun capteur détecté. Envoie une lecture test via{" "}
                <code className="text-white">POST /api/readings</code> (dans{" "}
                <code className="text-white">/docs</code>) ou via ton ESP32.
              </div>
            )}

            {sensors.map((s) => (
              <div
                key={s.sensor_id}
                className="rounded-xl border border-[#D4AF37]/15 bg-black/20 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-full">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="text-white font-semibold">
                        <span className="font-mono">{s.sensor_id}</span>
                      </div>

                      <StatusBadge
                        status={s.online ? "ok" : "warning"}
                        label={s.online ? "En ligne" : "Hors ligne"}
                      />

                      <span className="text-xs text-gray-400">
                        Dernière lecture :{" "}
                        <b className="text-white">{formatAge(s.age_sec)}</b>
                      </span>

                      {!s.online && (
                        <span className="flex items-center gap-2 text-xs text-yellow-300 border border-yellow-500/20 bg-yellow-500/10 px-3 py-1.5 rounded-lg">
                          <ShieldAlert className="w-4 h-4" />
                          Pas de lecture récente
                        </span>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Thermometer className="w-4 h-4 text-[#EF4444]" />
                        <span className="text-gray-400">Température :</span>
                        <span className="text-white font-semibold">
                          {s.temperature == null ? "—" : `${s.temperature}°C`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Droplets className="w-4 h-4 text-[#10B981]" />
                        <span className="text-gray-400">Humidité :</span>
                        <span className="text-white font-semibold">
                          {s.humidity == null ? "—" : `${s.humidity}%`}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-gray-400">
                      Terrarium lié :{" "}
                      {s.terrarium ? (
                        <span className="text-white font-semibold">
                          {s.terrarium.name}
                          <span className="text-gray-400 font-normal">
                            {" "}
                            — {s.terrarium.species || "—"}
                          </span>
                        </span>
                      ) : (
                        <span className="text-gray-500">Aucun</span>
                      )}
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-[#D4AF37]" />
                      <select
                        className="w-full bg-[#0C0F0E] text-white border border-[#D4AF37]/20 rounded-md px-3 py-2"
                        defaultValue=""
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (!v) return;
                          assignSensorToTerrarium(s.sensor_id, v);
                          e.currentTarget.value = "";
                        }}
                      >
                        <option value="">Assigner à un terrarium…</option>
                        {terrariums.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.species || "—"})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}