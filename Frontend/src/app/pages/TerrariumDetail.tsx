import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "../components/MainLayout";
import { StatusBadge } from "../components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  ArrowLeft,
  Thermometer,
  Droplets,
  Activity,
  Calendar,
  Settings,
  Clock,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
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

export default function TerrariumDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [t, setT] = useState<Terrarium | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { lastMessage } = useSensorWS();

  // charge le terrarium
  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const data = await apiGet<Terrarium>(`/api/terrariums/${id}`);
        setT(data);
      } catch (e: any) {
        setError(e?.message || "Erreur chargement terrarium");
      }
    })();
  }, [id]);

  // realtime : si message correspond au sensor_id -> update
  useEffect(() => {
    if (!t) return;
    if (!lastMessage || typeof lastMessage !== "object") return;
    if (lastMessage.type !== "sensor_reading") return;
    if (String(lastMessage.sensor_id) !== String(t.sensor_id)) return;

    setT((prev) =>
      prev
        ? {
            ...prev,
            last_temperature: lastMessage.temperature ?? prev.last_temperature,
            last_humidity: lastMessage.humidity ?? prev.last_humidity,
          }
        : prev
    );
  }, [lastMessage, t]);

  const tempNow = t?.last_temperature ?? null;
  const humNow = t?.last_humidity ?? null;

  const tempTarget = useMemo(() => {
    // si tu veux un range plus tard, on le fera
    return t?.target_temp ?? null;
  }, [t]);

  const humTarget = useMemo(() => {
    return t?.target_humidity ?? null;
  }, [t]);

  // graphiques : pour l’instant on garde une série simple (pas fake “Python”)
  const temperatureHistory = useMemo(() => {
    const base = tempTarget ?? 26;
    const now = tempNow ?? base;
    return [
      { time: "00:00", value: now - 2, target: base },
      { time: "04:00", value: now - 1, target: base },
      { time: "08:00", value: now - 0.5, target: base },
      { time: "12:00", value: now, target: base },
      { time: "16:00", value: now + 0.3, target: base },
      { time: "20:00", value: now - 0.2, target: base },
    ];
  }, [tempNow, tempTarget]);

  const humidityHistory = useMemo(() => {
    const base = humTarget ?? 70;
    const now = humNow ?? base;
    return [
      { time: "00:00", value: now - 6, target: base },
      { time: "04:00", value: now - 2, target: base },
      { time: "08:00", value: now + 1, target: base },
      { time: "12:00", value: now, target: base },
      { time: "16:00", value: now - 1, target: base },
      { time: "20:00", value: now + 2, target: base },
    ];
  }, [humNow, humTarget]);

  if (error) {
    return (
      <MainLayout>
        <div className="text-red-400 border border-red-400/30 bg-red-500/10 rounded-lg p-4">
          {error}
        </div>
      </MainLayout>
    );
  }

  if (!t) {
    return (
      <MainLayout>
        <div className="text-gray-400">Chargement...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
            onClick={() => navigate("/terrariums")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{t.name}</h1>
              <StatusBadge status={t.status || "ok"} />
            </div>
            <p className="text-gray-400 mt-1">
              {t.species || "—"} • ID: {t.id} • Capteur: {t.sensor_id}
            </p>
          </div>

          <Button
            variant="outline"
            className="border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10"
            onClick={() => navigate(`/terrariums/${t.id}/edit`)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Modifier
          </Button>
        </div>

        {/* Real-time metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#121212] border-[#D4AF37]/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">Température</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {tempNow == null ? "—" : `${tempNow}°C`}
                  </p>
                  <p className="text-xs text-[#10B981] mt-2">
                    Cible: {tempTarget == null ? "—" : `${tempTarget}°C`}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[#EF4444]/10">
                  <Thermometer className="w-6 h-6 text-[#EF4444]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#D4AF37]/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">Humidité</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {humNow == null ? "—" : `${humNow}%`}
                  </p>
                  <p className="text-xs text-[#10B981] mt-2">
                    Cible: {humTarget == null ? "—" : `${humTarget}%`}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[#10B981]/10">
                  <Droplets className="w-6 h-6 text-[#10B981]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#D4AF37]/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">Activité</p>
                  <p className="text-3xl font-bold text-white mt-1">—</p>
                  <p className="text-xs text-gray-500 mt-2">À venir</p>
                </div>
                <div className="p-3 rounded-lg bg-[#D4AF37]/10">
                  <Activity className="w-6 h-6 text-[#D4AF37]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#D4AF37]/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">Prochain repas</p>
                  <p className="text-3xl font-bold text-white mt-1">—</p>
                  <p className="text-xs text-gray-500 mt-2">À venir</p>
                </div>
                <div className="p-3 rounded-lg bg-[#D4AF37]/10">
                  <Calendar className="w-6 h-6 text-[#D4AF37]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="charts" className="space-y-4">
          <TabsList className="bg-[#121212] border border-[#D4AF37]/20">
            <TabsTrigger value="charts">Graphiques</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
            <TabsTrigger value="sensors">Capteurs</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#121212] border-[#D4AF37]/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Thermometer className="w-5 h-5 text-[#EF4444]" />
                    Température (24h)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={temperatureHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                      <XAxis dataKey="time" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #D4AF37" }}
                        labelStyle={{ color: "#F5F5F5" }}
                      />
                      <Line type="monotone" dataKey="value" stroke="#EF4444" strokeWidth={2} name="Actuelle" />
                      <Line type="monotone" dataKey="target" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" name="Cible" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-[#121212] border-[#D4AF37]/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-[#10B981]" />
                    Humidité (24h)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={humidityHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                      <XAxis dataKey="time" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #10B981" }}
                        labelStyle={{ color: "#F5F5F5" }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#10B981" fill="#10B981" fillOpacity={0.2} name="Actuelle" />
                      <Line type="monotone" dataKey="target" stroke="#D4AF37" strokeWidth={2} strokeDasharray="5 5" name="Cible" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-[#121212] border-[#D4AF37]/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#D4AF37]" />
                  Historique
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm">
                  À brancher ensuite : lecture de <code>/data/readings.json</code> filtrée par sensor_id.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sensors">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-[#121212] border-[#D4AF37]/20">
                <CardHeader>
                  <CardTitle className="text-white text-base">Capteur (actif)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">ID</span>
                    <span className="text-white">{t.sensor_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Temp</span>
                    <span className="text-white">{tempNow == null ? "—" : `${tempNow}°C`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hum</span>
                    <span className="text-white">{humNow == null ? "—" : `${humNow}%`}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#121212] border-[#D4AF37]/20">
                <CardHeader>
                  <CardTitle className="text-white text-base">Cibles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Temp cible</span>
                    <span className="text-white">{tempTarget == null ? "—" : `${tempTarget}°C`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hum cible</span>
                    <span className="text-white">{humTarget == null ? "—" : `${humTarget}%`}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notes">
            <Card className="bg-[#121212] border-[#D4AF37]/20">
              <CardHeader>
                <CardTitle className="text-white">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm">
                  À brancher ensuite : notes par terrarium (JSON ou Supabase).
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}