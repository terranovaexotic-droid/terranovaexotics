import { useEffect, useMemo, useState } from "react";
import { useSensorWS } from "../hooks/useSensorWS";
import { API_BASE } from "../lib/config";

import { MainLayout } from "../components/MainLayout";
import { MetricCard } from "../components/MetricCard";
import { TerrariumCard } from "../components/TerrariumCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Box,
  AlertTriangle,
  Activity,
  TrendingUp,
  Plus,
  Bell,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router";

// fallback si pas encore de live
const temperatureData = [
  { time: "00:00", value: 24 },
  { time: "04:00", value: 23 },
  { time: "08:00", value: 25 },
  { time: "12:00", value: 27 },
  { time: "16:00", value: 26 },
  { time: "20:00", value: 25 },
];

const humidityData = [
  { time: "00:00", value: 65 },
  { time: "04:00", value: 70 },
  { time: "08:00", value: 68 },
  { time: "12:00", value: 62 },
  { time: "16:00", value: 65 },
  { time: "20:00", value: 68 },
];

const alerts = [
  { id: "1", type: "warning", message: "Température élevée - Terrarium Dragon", time: "Il y a 10 min" },
  { id: "2", type: "info", message: "Entretien prévu aujourd'hui - Terrarium Python", time: "Il y a 1h" },
];

type TerrariumRow = {
  id: string;
  name: string;
  species?: string | null;
  sensor_id?: string | null; // A-01 etc
  status?: "ok" | "warning" | "critical" | string | null;
  last_temperature?: number | null;
  last_humidity?: number | null;
  last_update?: string | null;
  created_at?: string | null;
};

type LiveReadingMsg = {
  type: "reading";
  data: {
    sensor_id?: string;
    temperature?: number | null;
    humidity?: number | null;
    created_at?: string;
  };
};

function timeAgo(iso?: string | null) {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  const diff = Date.now() - t;
  const mins = Math.floor(diff / 60000);
  if (mins <= 0) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `il y a ${hrs} h`;
  const days = Math.floor(hrs / 24);
  return `il y a ${days} j`;
}

export default function Dashboard() {
  const navigate = useNavigate();

  // WS live
  const { status: wsStatus, lastMessage } = useSensorWS();

  // Terrariums (vrai data)
  const [terrariums, setTerrariums] = useState<TerrariumRow[]>([]);

  // Valeurs live globales (affichées en haut des graphs)
  const [liveTemp, setLiveTemp] = useState<number | null>(null);
  const [liveHum, setLiveHum] = useState<number | null>(null);

  // séries locales (24 points max)
  const [tempSeries, setTempSeries] = useState<{ time: string; value: number }[]>([]);
  const [humSeries, setHumSeries] = useState<{ time: string; value: number }[]>([]);

  const chartTempData = useMemo(
    () => (tempSeries.length ? tempSeries : temperatureData),
    [tempSeries]
  );
  const chartHumData = useMemo(
    () => (humSeries.length ? humSeries : humidityData),
    [humSeries]
  );

  // Charger les terrariums depuis le backend
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/terrariums`);
        const json = await res.json();
        setTerrariums((json.items ?? []) as TerrariumRow[]);
      } catch (e) {
        console.error("LOAD TERRARIUMS ERROR", e);
      }
    })();
  }, []);

  // Appliquer les lectures live au bon terrarium (sensor_id = code terrarium)
  useEffect(() => {
    if (!lastMessage || typeof lastMessage !== "object") return;
    if ((lastMessage as any).type !== "reading") return;

    const msg = lastMessage as LiveReadingMsg;
    const r = msg.data ?? {};
    const sensorId = r.sensor_id;
    if (!sensorId) return;

    const now = new Date();
    const label = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (typeof r.temperature === "number") {
      setLiveTemp(r.temperature);
      setTempSeries((prev) => [...prev, { time: label, value: r.temperature! }].slice(-24));
    }
    if (typeof r.humidity === "number") {
      setLiveHum(r.humidity);
      setHumSeries((prev) => [...prev, { time: label, value: r.humidity! }].slice(-24));
    }

    // Met à jour le terrarium correspondant dans la liste UI
    setTerrariums((prev) =>
      prev.map((t) => {
        if ((t.sensor_id ?? "") !== sensorId) return t;
        return {
          ...t,
          last_temperature: typeof r.temperature === "number" ? r.temperature : t.last_temperature,
          last_humidity: typeof r.humidity === "number" ? r.humidity : t.last_humidity,
          last_update: r.created_at ?? new Date().toISOString(),
        };
      })
    );
  }, [lastMessage]);

  // Metrics
  const activeTerrariums = terrariums.length;
  const activeAlerts = terrariums.filter((t) => t.status === "warning" || t.status === "critical").length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>

              <span
                className={`text-xs px-2 py-1 rounded-full border ${
                  wsStatus === "open"
                    ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
                    : wsStatus === "error"
                    ? "border-red-500/40 text-red-300 bg-red-500/10"
                    : "border-yellow-500/40 text-yellow-300 bg-yellow-500/10"
                }`}
              >
                {wsStatus === "open" ? "LIVE" : wsStatus === "error" ? "ERREUR" : "HORS LIGNE"}
              </span>
            </div>

            <p className="text-gray-400 mt-1">Vue d'ensemble de votre élevage</p>
          </div>

          <Button
            className="bg-[#D4AF37] hover:bg-[#B8860B] text-black"
            onClick={() => navigate("/terrariums/add")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau terrarium
          </Button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Terrariums actifs"
            value={activeTerrariums}
            icon={Box}
            trend={{ value: "+1 ce mois", isPositive: true }}
            status="ok"
          />

          <MetricCard
            title="Alertes actives"
            value={activeAlerts}
            icon={AlertTriangle}
            status={activeAlerts > 0 ? "warning" : "ok"}
            subtitle={activeAlerts > 0 ? `${activeAlerts} nécessite attention` : "Aucune alerte"}
          />

          <MetricCard title="Tâches du jour" value={3} icon={Activity} subtitle="2 complétées" />

          <MetricCard
            title="Taux de santé"
            value="98%"
            icon={TrendingUp}
            trend={{ value: "+2% ce mois", isPositive: true }}
            status="ok"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-[#121212] border-[#D4AF37]/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Température moyenne (24h)</CardTitle>
              <div className="text-sm text-gray-300">
                Actuel :{" "}
                <span className="text-[#D4AF37] font-semibold">
                  {liveTemp != null ? `${liveTemp.toFixed(1)}°C` : "—"}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartTempData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #D4AF37" }}
                    labelStyle={{ color: "#F5F5F5" }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={2} dot={{ fill: "#D4AF37" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#D4AF37]/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Humidité moyenne (24h)</CardTitle>
              <div className="text-sm text-gray-300">
                Actuel :{" "}
                <span className="text-emerald-300 font-semibold">
                  {liveHum != null ? `${liveHum.toFixed(0)}%` : "—"}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartHumData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #10B981" }}
                    labelStyle={{ color: "#F5F5F5" }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Terrariums Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Terrariums récents</h2>
            <Button
              variant="outline"
              className="border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10"
              onClick={() => navigate("/terrariums")}
            >
              Voir tout
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {terrariums.map((t) => (
              <TerrariumCard
                key={t.id}
                id={t.id}
                name={t.name}
                species={t.species ?? ""}
                temperature={typeof t.last_temperature === "number" ? t.last_temperature : 0}
                humidity={typeof t.last_humidity === "number" ? t.last_humidity : 0}
                status={(t.status ?? "ok") as any}
                lastUpdate={timeAgo(t.last_update)}
                onClick={() => navigate(`/terrariums/${t.id}`)}
              />
            ))}
          </div>
        </div>

        {/* Alerts */}
        <Card className="bg-[#121212] border-[#D4AF37]/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#D4AF37]" />
                Alertes récentes
              </CardTitle>
              <Button
                variant="ghost"
                className="text-[#D4AF37] hover:text-[#FFD700]"
                onClick={() => navigate("/notifications")}
              >
                Voir tout
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-[#1A1A1A] hover:bg-[#262626] transition-colors"
                >
                  <AlertTriangle
                    className={`w-5 h-5 mt-0.5 ${
                      alert.type === "warning" ? "text-[#F59E0B]" : "text-[#10B981]"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-white">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}