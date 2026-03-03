import { MainLayout } from "../components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Plus, Thermometer, Droplets, Gauge, Edit2, Trash2, Check, X } from "lucide-react";
import { useState } from "react";

interface Sensor {
  id: string;
  name: string;
  type: "temperature" | "humidity" | "combo";
  reference: string;
  location: string;
  status: "available" | "assigned";
  assignedTo?: string;
}

export default function Sensors() {
  const [sensors, setSensors] = useState<Sensor[]>([
    {
      id: "1",
      name: "Capteur Principal Terra 1",
      type: "combo",
      reference: "DHT22-001",
      location: "Étagère A - Niveau 1",
      status: "assigned",
      assignedTo: "Terrarium Python Regius #1"
    },
    {
      id: "2",
      name: "Capteur Température Salle",
      type: "temperature",
      reference: "DS18B20-001",
      location: "Mur Nord",
      status: "available"
    },
    {
      id: "3",
      name: "Capteur Humidité Zone Tropicale",
      type: "humidity",
      reference: "SHT31-001",
      location: "Étagère B - Niveau 2",
      status: "assigned",
      assignedTo: "Terrarium Gecko #2"
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newSensor, setNewSensor] = useState({
    name: "",
    type: "combo" as "temperature" | "humidity" | "combo",
    reference: "",
    location: ""
  });

  const handleAddSensor = () => {
    if (newSensor.name && newSensor.reference) {
      const sensor: Sensor = {
        id: Date.now().toString(),
        name: newSensor.name,
        type: newSensor.type,
        reference: newSensor.reference,
        location: newSensor.location,
        status: "available"
      };
      setSensors([...sensors, sensor]);
      setNewSensor({ name: "", type: "combo", reference: "", location: "" });
      setShowAddForm(false);
    }
  };

  const handleDeleteSensor = (id: string) => {
    setSensors(sensors.filter(s => s.id !== id));
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case "temperature":
        return <Thermometer className="w-5 h-5" />;
      case "humidity":
        return <Droplets className="w-5 h-5" />;
      case "combo":
        return <Gauge className="w-5 h-5" />;
      default:
        return <Gauge className="w-5 h-5" />;
    }
  };

  const getSensorTypeLabel = (type: string) => {
    switch (type) {
      case "temperature":
        return "Température";
      case "humidity":
        return "Humidité";
      case "combo":
        return "Température + Humidité";
      default:
        return type;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Gestion des capteurs</h1>
            <p className="text-gray-400 mt-1">
              Gérez vos capteurs et leur affectation aux terrariums
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-[#D4AF37] hover:bg-[#B8860B] text-black"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un capteur
          </Button>
        </div>

        {/* Add Sensor Form */}
        {showAddForm && (
          <Card className="bg-[#121212] border-[#D4AF37]/20">
            <CardHeader>
              <CardTitle className="text-white">Nouveau capteur</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom du capteur *</Label>
                  <Input
                    placeholder="Ex: Capteur Principal Terra 1"
                    className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white"
                    value={newSensor.name}
                    onChange={(e) => setNewSensor({ ...newSensor, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type de capteur *</Label>
                  <Select
                    value={newSensor.type}
                    onValueChange={(value: "temperature" | "humidity" | "combo") => 
                      setNewSensor({ ...newSensor, type: value })
                    }
                  >
                    <SelectTrigger className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="combo">Température + Humidité</SelectItem>
                      <SelectItem value="temperature">Température uniquement</SelectItem>
                      <SelectItem value="humidity">Humidité uniquement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Référence / ID *</Label>
                  <Input
                    placeholder="Ex: DHT22-001"
                    className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white"
                    value={newSensor.reference}
                    onChange={(e) => setNewSensor({ ...newSensor, reference: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Emplacement / Notes</Label>
                  <Input
                    placeholder="Ex: Étagère A - Niveau 1"
                    className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white"
                    value={newSensor.location}
                    onChange={(e) => setNewSensor({ ...newSensor, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <Button
                  onClick={handleAddSensor}
                  className="bg-[#50C878] hover:bg-[#3FA864] text-black"
                  disabled={!newSensor.name || !newSensor.reference}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-[#1A1A1A] to-[#121212] border-[#D4AF37]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total capteurs</p>
                  <p className="text-2xl font-bold text-white mt-1">{sensors.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                  <Gauge className="w-6 h-6 text-[#D4AF37]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#1A1A1A] to-[#121212] border-[#50C878]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Disponibles</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {sensors.filter(s => s.status === "available").length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-[#50C878]/10 flex items-center justify-center">
                  <Check className="w-6 h-6 text-[#50C878]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#1A1A1A] to-[#121212] border-[#D4AF37]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Assignés</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {sensors.filter(s => s.status === "assigned").length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                  <Gauge className="w-6 h-6 text-[#D4AF37]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#1A1A1A] to-[#121212] border-[#50C878]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Capteurs combo</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {sensors.filter(s => s.type === "combo").length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-[#50C878]/10 flex items-center justify-center">
                  <Gauge className="w-6 h-6 text-[#50C878]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sensors List */}
        <Card className="bg-[#121212] border-[#D4AF37]/20">
          <CardHeader>
            <CardTitle className="text-white">Liste des capteurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sensors.map((sensor) => (
                <div
                  key={sensor.id}
                  className="p-4 rounded-lg bg-[#1A1A1A] border border-[#D4AF37]/10 hover:border-[#D4AF37]/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        sensor.status === "available" 
                          ? "bg-[#50C878]/10 text-[#50C878]" 
                          : "bg-[#D4AF37]/10 text-[#D4AF37]"
                      }`}>
                        {getSensorIcon(sensor.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-white font-semibold">{sensor.name}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            sensor.status === "available"
                              ? "bg-[#50C878]/20 text-[#50C878]"
                              : "bg-[#D4AF37]/20 text-[#D4AF37]"
                          }`}>
                            {sensor.status === "available" ? "Disponible" : "Assigné"}
                          </span>
                        </div>
                        
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-400">
                            <span className="text-gray-500">Type:</span> {getSensorTypeLabel(sensor.type)}
                          </p>
                          <p className="text-sm text-gray-400">
                            <span className="text-gray-500">Référence:</span> {sensor.reference}
                          </p>
                          {sensor.location && (
                            <p className="text-sm text-gray-400">
                              <span className="text-gray-500">Emplacement:</span> {sensor.location}
                            </p>
                          )}
                          {sensor.assignedTo && (
                            <p className="text-sm text-[#D4AF37]">
                              <span className="text-gray-500">Assigné à:</span> {sensor.assignedTo}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/40 text-red-500 hover:bg-red-500/10"
                        onClick={() => handleDeleteSensor(sensor.id)}
                        disabled={sensor.status === "assigned"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {sensors.length === 0 && (
                <div className="text-center py-12">
                  <Gauge className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Aucun capteur configuré</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Cliquez sur "Ajouter un capteur" pour commencer
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
