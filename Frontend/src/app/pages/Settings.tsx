import { MainLayout } from "../components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Slider } from "../components/ui/slider";
import { Save, Bell, Thermometer, Droplets } from "lucide-react";

const species = [
  { id: "python", name: "Python regius", tempMin: 26, tempMax: 30, humMin: 60, humMax: 70 },
  { id: "gecko", name: "Correlophus ciliatus", tempMin: 20, tempMax: 24, humMin: 70, humMax: 80 },
  { id: "dragon", name: "Pogona vitticeps", tempMin: 32, tempMax: 38, humMin: 30, humMax: 40 },
  { id: "boa", name: "Boa constrictor", tempMin: 25, tempMax: 30, humMin: 60, humMax: 70 },
];

export default function Settings() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Paramètres</h1>
            <p className="text-gray-400 mt-1">Configuration du système</p>
          </div>
          <Button className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
            <Save className="w-4 h-4 mr-2" />
            Enregistrer
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="bg-[#121212] border border-[#D4AF37]/20">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="species">Espèces</TabsTrigger>
            <TabsTrigger value="alerts">Alertes</TabsTrigger>
            <TabsTrigger value="system">Système</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card className="bg-[#121212] border-[#D4AF37]/20">
              <CardHeader>
                <CardTitle className="text-white">Préférences générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Nom de l'installation</Label>
                  <Input 
                    defaultValue="Mon Élevage"
                    className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Langue</Label>
                  <Select defaultValue="fr">
                    <SelectTrigger className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fuseau horaire</Label>
                  <Select defaultValue="paris">
                    <SelectTrigger className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paris">Europe/Paris</SelectItem>
                      <SelectItem value="london">Europe/London</SelectItem>
                      <SelectItem value="newyork">America/New_York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Unité de température</Label>
                  <Select defaultValue="celsius">
                    <SelectTrigger className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="celsius">Celsius (°C)</SelectItem>
                      <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mode temps réel</Label>
                    <p className="text-sm text-gray-400">Mise à jour automatique des données</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Effets visuels</Label>
                    <p className="text-sm text-gray-400">Animations et effets de glow</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Species Settings */}
          <TabsContent value="species" className="space-y-4">
            <Card className="bg-[#121212] border-[#D4AF37]/20">
              <CardHeader>
                <CardTitle className="text-white">Plages de paramètres par espèce</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {species.map((sp) => (
                  <div key={sp.id} className="space-y-4 p-4 rounded-lg bg-[#1A1A1A]">
                    <h3 className="font-semibold text-white">{sp.name}</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-[#EF4444]" />
                        <Label className="flex-1">Température (°C)</Label>
                      </div>
                      <div className="flex items-center gap-4">
                        <Input 
                          type="number"
                          defaultValue={sp.tempMin}
                          className="w-20 bg-[#0A0A0A] border-[#D4AF37]/20 text-white"
                        />
                        <div className="flex-1">
                          <Slider 
                            defaultValue={[sp.tempMin, sp.tempMax]} 
                            max={45} 
                            step={1}
                            className="[&_[role=slider]]:bg-[#D4AF37]"
                          />
                        </div>
                        <Input 
                          type="number"
                          defaultValue={sp.tempMax}
                          className="w-20 bg-[#0A0A0A] border-[#D4AF37]/20 text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-[#10B981]" />
                        <Label className="flex-1">Humidité (%)</Label>
                      </div>
                      <div className="flex items-center gap-4">
                        <Input 
                          type="number"
                          defaultValue={sp.humMin}
                          className="w-20 bg-[#0A0A0A] border-[#D4AF37]/20 text-white"
                        />
                        <div className="flex-1">
                          <Slider 
                            defaultValue={[sp.humMin, sp.humMax]} 
                            max={100} 
                            step={1}
                            className="[&_[role=slider]]:bg-[#10B981]"
                          />
                        </div>
                        <Input 
                          type="number"
                          defaultValue={sp.humMax}
                          className="w-20 bg-[#0A0A0A] border-[#D4AF37]/20 text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Settings */}
          <TabsContent value="alerts" className="space-y-4">
            <Card className="bg-[#121212] border-[#D4AF37]/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#D4AF37]" />
                  Gestion des alertes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifications push</Label>
                    <p className="text-sm text-gray-400">Recevoir des notifications en temps réel</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Alertes email</Label>
                    <p className="text-sm text-gray-400">Envoyer un email pour les alertes critiques</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Alertes sonores</Label>
                    <p className="text-sm text-gray-400">Son d'alerte pour les problèmes critiques</p>
                  </div>
                  <Switch />
                </div>

                <div className="space-y-2">
                  <Label>Email de notification</Label>
                  <Input 
                    type="email"
                    defaultValue="admin@terra.com"
                    className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Seuil d'alerte température (écart en °C)</Label>
                  <div className="flex items-center gap-4">
                    <Slider 
                      defaultValue={[2]} 
                      max={10} 
                      step={0.5}
                      className="flex-1"
                    />
                    <span className="text-white w-12">2°C</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Seuil d'alerte humidité (écart en %)</Label>
                  <div className="flex items-center gap-4">
                    <Slider 
                      defaultValue={[5]} 
                      max={20} 
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-white w-12">5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system" className="space-y-4">
            <Card className="bg-[#121212] border-[#D4AF37]/20">
              <CardHeader>
                <CardTitle className="text-white">Paramètres système</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sauvegarde automatique</Label>
                    <p className="text-sm text-gray-400">Sauvegarde quotidienne des données</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>Fréquence de mise à jour des capteurs</Label>
                  <Select defaultValue="30">
                    <SelectTrigger className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 secondes</SelectItem>
                      <SelectItem value="30">30 secondes</SelectItem>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Rétention des données</Label>
                  <Select defaultValue="365">
                    <SelectTrigger className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 jours</SelectItem>
                      <SelectItem value="90">90 jours</SelectItem>
                      <SelectItem value="180">6 mois</SelectItem>
                      <SelectItem value="365">1 an</SelectItem>
                      <SelectItem value="0">Illimité</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 space-y-2">
                  <Button 
                    variant="outline"
                    className="w-full border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                  >
                    Exporter les données
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full border-[#F59E0B]/40 text-[#F59E0B] hover:bg-[#F59E0B]/10"
                  >
                    Réinitialiser les paramètres
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border-[#D4AF37]/20">
              <CardHeader>
                <CardTitle className="text-white">Informations système</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Version</span>
                  <span className="text-white">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Capteurs connectés</span>
                  <span className="text-[#10B981]">6 / 6</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Espace utilisé</span>
                  <span className="text-white">2.4 GB / 10 GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Dernière sauvegarde</span>
                  <span className="text-white">Il y a 2 heures</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
