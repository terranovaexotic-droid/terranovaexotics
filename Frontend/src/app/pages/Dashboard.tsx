import { useEffect, useState } from "react";
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

import { useNavigate } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://terranova-backend-dpqj.onrender.com";

type Terrarium = {
  id: number;
  name: string;
  species?: string;
  sensor_id: string;
  status?: string;
  last_temperature?: number;
  last_humidity?: number;
  last_ts?: number;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [terrariums, setTerrariums] = useState<Terrarium[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/terrariums`)
      .then((res) => res.json())
      .then((data) => {
        setTerrariums(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur chargement terrariums:", err);
        setLoading(false);
      });
  }, []);

  const temperatureData = terrariums.map((t, i) => ({
    time: `T${i}`,
    value: t.last_temperature ?? 0,
  }));

  const humidityData = terrariums.map((t, i) => ({
    time: `T${i}`,
    value: t.last_humidity ?? 0,
  }));

  const alerts = terrariums.filter((t) => t.status !== "ok");

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-1">
              Vue d'ensemble de votre élevage
            </p>
          </div>

          <Button
            className="bg-[#D4AF37] hover:bg-[#B8860B] text-black"
            onClick={() => navigate("/terrariums/add")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau terrarium
          </Button>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Terrariums actifs"
            value={terrariums.length}
            icon={Box}
            status="ok"
          />

          <MetricCard
            title="Alertes actives"
            value={alerts.length}
            icon={AlertTriangle}
            status={alerts.length > 0 ? "warning" : "ok"}
          />

          <MetricCard
            title="Capteurs actifs"
            value={terrariums.filter((t) => t.last_temperature).length}
            icon={Activity}
          />

          <MetricCard
            title="Taux de santé"
            value={alerts.length > 0 ? "90%" : "100%"}
            icon={TrendingUp}
            status={alerts.length > 0 ? "warning" : "ok"}
          />
        </div>

        {/* GRAPHIQUES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-[#121212] border-[#D4AF37]/20">
            <CardHeader>
              <CardTitle className="text-white">
                Température
              </CardTitle>
            </CardHeader>

            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={temperatureData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#D4AF37"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#D4AF37]/20">
            <CardHeader>
              <CardTitle className="text-white">
                Humidité
              </CardTitle>
            </CardHeader>

            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={humidityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip />
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

        {/* TERRARIUMS */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              Terrariums
            </h2>

            <Button
              variant="outline"
              className="border-[#D4AF37]/40 text-[#D4AF37]"
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
                temperature={t.last_temperature ?? 0}
                humidity={t.last_humidity ?? 0}
                status={(t.status ?? "ok") as any}
                lastUpdate="live"
                onClick={() => navigate(`/terrariums/${t.id}`)}
              />
            ))}
          </div>
        </div>

        {/* ALERTES */}
        <Card className="bg-[#121212] border-[#D4AF37]/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#D4AF37]" />
              Alertes
            </CardTitle>
          </CardHeader>

          <CardContent>
            {alerts.length === 0 && (
              <p className="text-gray-400">Aucune alerte</p>
            )}

            {alerts.map((a) => (
              <div key={a.id} className="text-white">
                Problème détecté dans {a.name}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}