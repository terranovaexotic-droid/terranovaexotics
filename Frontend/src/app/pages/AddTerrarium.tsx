import { MainLayout } from "../components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { ArrowLeft, Save, Plus, Gauge, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";

export default function AddTerrarium() {
  const navigate = useNavigate();

  // Mock data for available sensors
  const [availableSensors] = useState([
    {
      id: "1",
      name: "Capteur Principal Terra 1",
      type: "combo",
      reference: "DHT22-001",
      location: "Étagère A - Niveau 1",
      status: "assigned"
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
      status: "assigned"
    },
    {
      id: "4",
      name: "DHT22 - Nouveau",
      type: "combo",
      reference: "DHT22-004",
      location: "Stock",
      status: "available"
    },
    {
      id: "5",
      name: "Capteur Combo Zone A",
      type: "combo",
      reference: "DHT22-005",
      location: "Étagère C",
      status: "available"
    },
  ]);

  const [selectedSensors, setSelectedSensors] = useState({
    temperature: "",
    humidity: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    navigate("/terrariums");
  };

  const getSensorLabel = (sensor: typeof availableSensors[0]) => {
    return `${sensor.name} (${sensor.reference}) - ${sensor.location}`;
  };

  const getAvailableSensorsForType = (type: "temperature" | "humidity") => {
    return availableSensors.filter(s => 
      s.status === "available" && (s.type === type || s.type === "combo")
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl">
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
          <div>
            <h1 className="text-3xl font-bold text-white">Nouveau terrarium</h1>
            <p className="text-gray-400 mt-1">Ajoutez un nouveau terrarium à votre élevage</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="bg-[#121212] border-[#D4AF37]/20">
            <CardHeader>
              <CardTitle className="text-white">Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nom du terrarium *</Label>
                  <Input 
                    placeholder="Ex: Terrarium Python"
                    className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Espèce *</Label>
                  <Select required>
                    <SelectTrigger className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white">
                      <SelectValue placeholder="Sélectionner une espèce" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="python">Python regius</SelectItem>
                      <SelectItem value="gecko">Correlophus ciliatus</SelectItem>
                      <SelectItem value="dragon">Pogona vitticeps</SelectItem>
                      <SelectItem value="boa">Boa constrictor</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Nom de l'animal</Label>
                  <Input 
                    placeholder="Ex: Rex"
                    className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Âge / Date de naissance</Label>
                  <Input 
                    type="date"
                    className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sexe</Label>
                  <Select>
                    <SelectTrigger className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Mâle</SelectItem>
                      <SelectItem value="female">Femelle</SelectItem>
                      <SelectItem value="unknown">Inconnu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Poids actuel (g)</Label>
                  <Input 
                    type="number"
                    placeholder="1500"
                    className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea 
                  placeholder="Informations supplémentaires, historique médical, particularités..."
                  className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#D4AF37]/20 mt-6">
            <CardHeader>
              <CardTitle className="text-white">Paramètres environnementaux</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Température cible min (°C) *</Label>
                  <Input 
                    type="number"
                    placeholder="26"
                    defaultValue="26"
                    className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Température cible max (°C) *</Label>
                  <Input 
                    type="number"
                    placeholder="30"
                    defaultValue="30"
                    className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Humidité cible min (%) *</Label>
                  <Input 
                    type="number"
                    placeholder="60"
                    defaultValue="60"
                    className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Humidité cible max (%) *</Label>
                  <Input 
                    type="number"
                    placeholder="70"
                    defaultValue="70"
                    className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type de substrat</Label>
                  <Select>
                    <SelectTrigger className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coco">Fibre de coco</SelectItem>
                      <SelectItem value="paper">Papier</SelectItem>
                      <SelectItem value="sand">Sable</SelectItem>
                      <SelectItem value="bark">Écorce</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Taille du terrarium</Label>
                  <Input 
                    placeholder="Ex: 120x60x60 cm"
                    className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#D4AF37]/20 mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Capteurs</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                  onClick={() => window.open("/sensors", "_blank")}
                >
                  <Gauge className="w-4 h-4 mr-2" />
                  Gérer les capteurs
                  <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Info box */}
              <div className="p-4 bg-[#50C878]/10 border border-[#50C878]/20 rounded-lg">
                <div className="flex gap-3">
                  <Gauge className="w-5 h-5 text-[#50C878] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-[#50C878] font-medium">
                      Capteurs disponibles : {getAvailableSensorsForType("temperature").length} température / {getAvailableSensorsForType("humidity").length} humidité
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Sélectionnez les capteurs à utiliser pour ce terrarium. Les capteurs combo peuvent mesurer température et humidité.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Capteur température</Label>
                  <Select
                    value={selectedSensors.temperature}
                    onValueChange={(value) => setSelectedSensors({ ...selectedSensors, temperature: value })}
                  >
                    <SelectTrigger className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white">
                      <SelectValue placeholder="Sélectionner un capteur" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableSensorsForType("temperature").length > 0 ? (
                        getAvailableSensorsForType("temperature").map(sensor => (
                          <SelectItem key={sensor.id} value={sensor.id}>
                            {getSensorLabel(sensor)}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>Aucun capteur disponible</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {selectedSensors.temperature && (
                    <p className="text-xs text-[#50C878]">
                      ✓ Capteur sélectionné
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Capteur humidité</Label>
                  <Select
                    value={selectedSensors.humidity}
                    onValueChange={(value) => setSelectedSensors({ ...selectedSensors, humidity: value })}
                  >
                    <SelectTrigger className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white">
                      <SelectValue placeholder="Sélectionner un capteur" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableSensorsForType("humidity").length > 0 ? (
                        getAvailableSensorsForType("humidity").map(sensor => (
                          <SelectItem key={sensor.id} value={sensor.id}>
                            {getSensorLabel(sensor)}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>Aucun capteur disponible</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {selectedSensors.humidity && (
                    <p className="text-xs text-[#50C878]">
                      ✓ Capteur sélectionné
                    </p>
                  )}
                </div>
              </div>

              {/* Warning if no sensors available */}
              {(getAvailableSensorsForType("temperature").length === 0 || 
                getAvailableSensorsForType("humidity").length === 0) && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="text-sm text-yellow-500 font-medium">
                        Capteurs manquants
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Certains types de capteurs ne sont pas disponibles. Veuillez en ajouter dans la page de gestion des capteurs.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4 mt-6">
            <Button 
              type="button"
              variant="outline"
              className="flex-1 border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10"
              onClick={() => navigate("/terrariums")}
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-[#D4AF37] hover:bg-[#B8860B] text-black"
            >
              <Save className="w-4 h-4 mr-2" />
              Créer le terrarium
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}