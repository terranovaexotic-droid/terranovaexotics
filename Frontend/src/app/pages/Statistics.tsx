import { MainLayout } from "../components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Activity, Clock, Thermometer } from "lucide-react";

const monthlyData = [
  { month: "Sep", temperature: 26, humidity: 68, feeding: 12 },
  { month: "Oct", temperature: 25, humidity: 65, feeding: 14 },
  { month: "Nov", temperature: 26, humidity: 70, feeding: 13 },
  { month: "Déc", temperature: 27, humidity: 67, feeding: 12 },
  { month: "Jan", temperature: 26, humidity: 69, feeding: 15 },
  { month: "Fév", temperature: 25, humidity: 71, feeding: 14 },
];

const speciesDistribution = [
  { name: "Serpents", value: 3, color: "#D4AF37" },
  { name: "Lézards", value: 2, color: "#10B981" },
  { name: "Tortues", value: 1, color: "#F59E0B" },
];

const activityData = [
  { hour: "00h", activity: 2 },
  { hour: "04h", activity: 1 },
  { hour: "08h", activity: 5 },
  { hour: "12h", activity: 8 },
  { hour: "16h", activity: 10 },
  { hour: "20h", activity: 7 },
];

export default function Statistics() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Statistiques & Rapports</h1>
            <p className="text-gray-400 mt-1">Analyses et tendances de votre élevage</p>
          </div>
          <Select defaultValue="6months">
            <SelectTrigger className="w-full lg:w-[200px] bg-[#1A1A1A] border-[#D4AF37]/20 text-white">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 mois</SelectItem>
              <SelectItem value="3months">3 mois</SelectItem>
              <SelectItem value="6months">6 mois</SelectItem>
              <SelectItem value="1year">1 an</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#121212] border-[#D4AF37]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Temp. moyenne</p>
                  <p className="text-2xl font-bold text-white mt-1">26°C</p>
                  <p className="text-xs text-[#10B981] mt-1">+0.5°C</p>
                </div>
                <Thermometer className="w-8 h-8 text-[#D4AF37]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#D4AF37]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Humidité moy.</p>
                  <p className="text-2xl font-bold text-white mt-1">68%</p>
                  <p className="text-xs text-[#10B981] mt-1">+2%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#D4AF37]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Repas total</p>
                  <p className="text-2xl font-bold text-white mt-1">80</p>
                  <p className="text-xs text-[#10B981] mt-1">+8 vs période</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#D4AF37]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Alertes traitées</p>
                  <p className="text-2xl font-bold text-white mt-1">15</p>
                  <p className="text-xs text-[#F59E0B] mt-1">-3 vs période</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-[#121212] border-[#D4AF37]/20">
            <CardHeader>
              <CardTitle className="text-white">Évolution des paramètres (6 mois)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #D4AF37" }}
                    labelStyle={{ color: "#F5F5F5" }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    name="Température (°C)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="humidity" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Humidité (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#D4AF37]/20">
            <CardHeader>
              <CardTitle className="text-white">Répartition des espèces</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={speciesDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {speciesDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #D4AF37" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-[#121212] border-[#D4AF37]/20">
            <CardHeader>
              <CardTitle className="text-white">Fréquence d'alimentation (6 mois)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #D4AF37" }}
                    labelStyle={{ color: "#F5F5F5" }}
                  />
                  <Bar dataKey="feeding" fill="#D4AF37" name="Repas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#D4AF37]/20">
            <CardHeader>
              <CardTitle className="text-white">Activité par heure</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="hour" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #10B981" }}
                    labelStyle={{ color: "#F5F5F5" }}
                  />
                  <Bar dataKey="activity" fill="#10B981" name="Détections" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        <Card className="bg-[#121212] border-[#D4AF37]/20">
          <CardHeader>
            <CardTitle className="text-white">Résumé de la période</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Santé générale</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
                    <div className="h-full bg-[#10B981]" style={{ width: "98%" }} />
                  </div>
                  <span className="text-sm font-semibold text-white">98%</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Taux de conformité</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
                    <div className="h-full bg-[#D4AF37]" style={{ width: "95%" }} />
                  </div>
                  <span className="text-sm font-semibold text-white">95%</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Réponse aux alertes</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
                    <div className="h-full bg-[#10B981]" style={{ width: "100%" }} />
                  </div>
                  <span className="text-sm font-semibold text-white">100%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
