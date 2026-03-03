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
  AlertTriangle,
  TrendingUp,
  Clock
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const temperatureHistory = [
  { time: "00:00", value: 24, target: 26 },
  { time: "04:00", value: 23, target: 26 },
  { time: "08:00", value: 25, target: 26 },
  { time: "12:00", value: 27, target: 26 },
  { time: "16:00", value: 26, target: 26 },
  { time: "20:00", value: 28, target: 26 },
];

const humidityHistory = [
  { time: "00:00", value: 65, target: 70 },
  { time: "04:00", value: 70, target: 70 },
  { time: "08:00", value: 68, target: 70 },
  { time: "12:00", value: 62, target: 70 },
  { time: "16:00", value: 65, target: 70 },
  { time: "20:00", value: 68, target: 70 },
];

const events = [
  { date: "2026-03-02 14:30", type: "feeding", description: "Alimentation effectuée" },
  { date: "2026-03-01 09:15", type: "cleaning", description: "Nettoyage du terrarium" },
  { date: "2026-02-28 16:45", type: "measurement", description: "Mesures manuelles prises" },
  { date: "2026-02-27 11:20", type: "alert", description: "Alerte température élevée" },
];

export default function TerrariumDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

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
              <h1 className="text-3xl font-bold text-white">Terrarium Python</h1>
              <StatusBadge status="ok" />
            </div>
            <p className="text-gray-400 mt-1">Python regius • ID: {id}</p>
          </div>
          <Button 
            variant="outline"
            className="border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10"
            onClick={() => navigate(`/terrariums/${id}/edit`)}
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
                  <p className="text-3xl font-bold text-white mt-1">28°C</p>
                  <p className="text-xs text-[#10B981] mt-2">Cible: 26-30°C</p>
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
                  <p className="text-3xl font-bold text-white mt-1">65%</p>
                  <p className="text-xs text-[#10B981] mt-2">Cible: 60-70%</p>
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
                  <p className="text-3xl font-bold text-white mt-1">Normale</p>
                  <p className="text-xs text-gray-500 mt-2">Dernière détection</p>
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
                  <p className="text-3xl font-bold text-white mt-1">2j</p>
                  <p className="text-xs text-gray-500 mt-2">Vendredi 4 mars</p>
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
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#EF4444" 
                        strokeWidth={2}
                        name="Actuelle"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="target" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Cible"
                      />
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
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#10B981" 
                        fill="#10B981"
                        fillOpacity={0.2}
                        name="Actuelle"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="target" 
                        stroke="#D4AF37" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Cible"
                      />
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
                  Événements récents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events.map((event, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-4 p-4 rounded-lg bg-[#1A1A1A] hover:bg-[#262626] transition-colors"
                    >
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        event.type === "alert" ? "bg-[#EF4444]" : "bg-[#10B981]"
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-white">{event.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{event.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sensors">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-[#121212] border-[#D4AF37]/20">
                <CardHeader>
                  <CardTitle className="text-white text-base">Capteur température</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">État</span>
                    <StatusBadge status="ok" label="En ligne" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">ID</span>
                    <span className="text-white">TEMP-001</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Batterie</span>
                    <span className="text-[#10B981]">95%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Signal</span>
                    <span className="text-[#10B981]">Excellent</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#121212] border-[#D4AF37]/20">
                <CardHeader>
                  <CardTitle className="text-white text-base">Capteur humidité</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">État</span>
                    <StatusBadge status="ok" label="En ligne" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">ID</span>
                    <span className="text-white">HUM-001</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Batterie</span>
                    <span className="text-[#10B981]">87%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Signal</span>
                    <span className="text-[#10B981]">Bon</span>
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
                  Dernière mue le 25 février. Animal en bonne santé, comportement normal.
                  Prochain repas prévu vendredi avec souris adulte décongelée.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
