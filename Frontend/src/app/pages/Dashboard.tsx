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
  Bell
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router";

// Mock data
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

const terrariums = [
  { id: "1", name: "Terrarium Python", species: "Python regius", temperature: 28, humidity: 65, status: "ok" as const, lastUpdate: "il y a 2 min" },
  { id: "2", name: "Terrarium Gecko", species: "Correlophus ciliatus", temperature: 22, humidity: 75, status: "ok" as const, lastUpdate: "il y a 5 min" },
  { id: "3", name: "Terrarium Dragon", species: "Pogona vitticeps", temperature: 35, humidity: 40, status: "warning" as const, lastUpdate: "il y a 1 min" },
];

const alerts = [
  { id: "1", type: "warning", message: "Température élevée - Terrarium Dragon", time: "Il y a 10 min" },
  { id: "2", type: "info", message: "Entretien prévu aujourd'hui - Terrarium Python", time: "Il y a 1h" },
];

export default function Dashboard() {
  const navigate = useNavigate();

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

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Terrariums actifs"
            value={terrariums.length}
            icon={Box}
            trend={{ value: "+1 ce mois", isPositive: true }}
            status="ok"
          />
          <MetricCard
            title="Alertes actives"
            value={1}
            icon={AlertTriangle}
            status="warning"
            subtitle="1 nécessite attention"
          />
          <MetricCard
            title="Tâches du jour"
            value={3}
            icon={Activity}
            subtitle="2 complétées"
          />
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
                    contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #D4AF37" }}
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
                    contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #10B981" }}
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
            {terrariums.map((terrarium) => (
              <TerrariumCard
                key={terrarium.id}
                {...terrarium}
                onClick={() => navigate(`/terrariums/${terrarium.id}`)}
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
                  <AlertTriangle className={`w-5 h-5 mt-0.5 ${alert.type === "warning" ? "text-[#F59E0B]" : "text-[#10B981]"}`} />
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
