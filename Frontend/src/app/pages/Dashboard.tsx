import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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

// ✅ IMPORTANT : adapte l'import selon ton projet
// Option A (recommandé si tu l’as déjà) : getApiBase()
import { getApiBase } from "../lib/config";
// Option B : si tu n’as PAS getApiBase, commente la ligne ci-dessus et décommente celle-ci :
// const getApiBase = () => import.meta.env.VITE_API_BASE || "https://terranova-backend-dpqj.onrender.com";

type TerrariumApi = {
  id: number;
  name: string;
  species?: string | null;
  sensor_id: string;
  status?: string | null;
  target_temp?: number | null;
  target_humidity?: number | null;
  last_temperature?: number | null;
  last_humidity?: number | null;
  last_ts?: number | null;
};

type TerrariumCardItem = {
  id: string;
  name: string;
  species: string;
  temperature: number | null;
  humidity: number | null;
  status: "ok" | "warning";
  lastUpdate: string;
};

function timeAgoFromTs(ts?: number | null) {
  if (!ts) return "—";
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.max(0, now - ts);

  if (diff < 60) return `il y a ${diff}s`;
  const min = Math.floor(diff / 60);
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  return `il y a ${d}j`;
}

// Mock alerts (tu pourras les brancher plus tard)
const alerts = [
  { id: "1", type: "warning", message: "Température élevée - Vérifier un terrarium", time: "Il y a 10 min" },
  { id: "2", type: "info", message: "Entretien prévu aujourd'hui", time: "Il y a 1h" },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const [terrariums, setTerrariums] = useState<TerrariumApi[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const API_BASE = useMemo(() => getApiBase(), []);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/api/terrariums`, {
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`Erreur API /api/terrariums (${res.status}) ${txt}`);
        }

        const data = (await res.json()) as TerrariumApi[];
        if (!alive) return;

        setTerrariums(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Erreur lors du chargement");
        setTerrariums([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, [API_BASE]);

  // Transforme en props pour TerrariumCard (sans toucher au design)
  const terrariumCards: TerrariumCardItem[] = useMemo(() => {
    return terrariums.map((t) => {
      const temp = t.last_temperature ?? null;
      const hum = t.last_humidity ?? null;

      // règle simple : warning si status != ok
      const st = (t.status || "ok").toLowerCase() === "ok" ? "ok" : "warning";

      return {
        id: String(t.id),
        name: t.name,
        species: t.species ?? "—",
        temperature: temp,
        humidity: hum,
        status: st,
        lastUpdate: timeAgoFromTs(t.last_ts),
      };
    });
  }, [terrariums]);

  // Metrics
  const totalTerrariums = terrariums.length;

  const withSensorData = useMemo(() => {
    return terrariums.filter(
      (t) => t.last_temperature != null && t.last_humidity != null
    ).length;
  }, [terrariums]);

  const warningCount = useMemo(() => {
    return terrariums.filter(
      (t) => (t.status || "ok").toLowerCase() !== "ok"
    ).length;
  }, [terrariums]);

  // Graphs : on “simule” une courbe à partir de la moyenne actuelle (en attendant l’historique réel)
  const avgTemp = useMemo(() => {
    const vals = terrariums
      .map((t) => t.last_temperature)
      .filter((v): v is number => typeof v === "number");
    if (!vals.length) return null;
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  }, [terrariums]);

  const avgHum = useMemo(() => {
    const vals = terrariums
      .map((t) => t.last_humidity)
      .filter((v): v is number => typeof v === "number");
    if (!vals.length) return null;
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  }, [terrariums]);

  const temperatureData = useMemo(
    () => [
      { time: "00:00", value: avgTemp ?? 0 },
      { time: "04:00", value: avgTemp ?? 0 },
      { time: "08:00", value: avgTemp ?? 0 },
      { time: "12:00", value: avgTemp ?? 0 },
      { time: "16:00", value: avgTemp ?? 0 },
      { time: "20:00", value: avgTemp ?? 0 },
    ],
    [avgTemp]
  );

  const humidityData = useMemo(
    () => [
      { time: "00:00", value: avgHum ?? 0 },
      { time: "04:00", value: avgHum ?? 0 },
      { time: "08:00", value: avgHum ?? 0 },
      { time: "12:00", value: avgHum ?? 0 },
      { time: "16:00", value: avgHum ?? 0 },
      { time: "20:00", value: avgHum ?? 0 },
    ],
    [avgHum]
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
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

        {/* Error / Loading (sans casser le design) */}
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-200 p-3">
            {error}
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Terrariums actifs"
            value={loading ? "…" : totalTerrariums}
            icon={Box}
            trend={{ value: "+0 ce mois", isPositive: true }}
            status="ok"
          />

          <MetricCard
            title="Avec capteur"
            value={loading ? "…" : withSensorData}
            icon={Activity}
            subtitle="Lectures reçues"
          />

          <MetricCard
            title="Alertes actives"
            value={loading ? "…" : warningCount}
            icon={AlertTriangle}
            status={warningCount > 0 ? "warning" : "ok"}
            subtitle={
              warningCount > 0 ? `${warningCount} nécessite attention` : "Aucune"
            }
          />

          <MetricCard
            title="Taux de santé"
            value={loading ? "…" : warningCount > 0 ? "90%" : "98%"}
            icon={TrendingUp}
            trend={{
              value: warningCount > 0 ? "-8% ce mois" : "+2% ce mois",
              isPositive: warningCount === 0,
            }}
            status={warningCount > 0 ? "warning" : "ok"}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-[#121212] border-[#D4AF37]/20">
            <CardHeader>
              <CardTitle className="text-white">Température moyenne (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={temperatureData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1A1A1A",
                      border: "1px solid #D4AF37",
                    }}
                    labelStyle={{ color: "#F5F5F5" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#D4AF37"
                    strokeWidth={2}
                    dot={{ fill: "#D4AF37" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#D4AF37]/20">
            <CardHeader>
              <CardTitle className="text-white">Humidité moyenne (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={humidityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1A1A1A",
                      border: "1px solid #10B981",
                    }}
                    labelStyle={{ color: "#F5F5F5" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.2}
                  />
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
            {terrariumCards.map((terrarium) => (
              <TerrariumCard
                key={terrarium.id}
                {...terrarium}
                onClick={() => navigate(`/terrariums/${terrarium.id}`)}
              />
            ))}
          </div>

          {!loading && terrariumCards.length === 0 && (
            <div className="text-gray-400 mt-4">Aucun terrarium.</div>
          )}
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