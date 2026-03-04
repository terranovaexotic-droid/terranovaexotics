import { MainLayout } from "../components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { ArrowLeft, Save, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AddInventoryItem() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/inventory");
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
            onClick={() => navigate("/inventory")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Ajouter un article</h1>
            <p className="text-gray-400 mt-1">Ajoutez un nouvel article à l'inventaire</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="bg-[#121212] border-[#D4AF37]/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Informations de l'article</CardTitle>
                <Button 
                  type="button"
                  variant="outline"
                  className="border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Scanner code
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nom de l'article *</Label>
                  <Input 
                    placeholder="Ex: Souris adultes"
                    className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Catégorie *</Label>
                  <Select required>
                    <SelectTrigger className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food">Nourriture</SelectItem>
                      <SelectItem value="substrate">Substrat</SelectItem>
                      <SelectItem value="supplements">Suppléments</SelectItem>
                      <SelectItem value="equipment">Matériel</SelectItem>
                      <SelectItem value="maintenance">Entretien</SelectItem>
                      <SelectItem value="medical">Médical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quantité actuelle *</Label>
                  <Input 
                    type="number"
                    placeholder="24"
                    className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Unité *</Label>
                  <Select required>
                    <SelectTrigger className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="units">Unités</SelectItem>
                      <SelectItem value="kg">Kilogrammes</SelectItem>
                      <SelectItem value="g">Grammes</SelectItem>
                      <SelectItem value="l">Litres</SelectItem>
                      <SelectItem value="bags">Sacs</SelectItem>
                      <SelectItem value="boxes">Boîtes</SelectItem>
                      <SelectItem value="bottles">Bouteilles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Stock minimum *</Label>
                  <Input 
                    type="number"
                    placeholder="10"
                    className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white"
                    required
                  />
                  <p className="text-xs text-gray-500">Alerte déclenchée si stock inférieur</p>
                </div>

                <div className="space-y-2">
                  <Label>Prix unitaire</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    placeholder="2.50"
                    className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Fournisseur</Label>
                  <Input 
                    placeholder="Ex: Fournisseur XYZ"
                    className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Référence / SKU</Label>
                  <Input 
                    placeholder="Ex: SOUR-ADU-001"
                    className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date d'expiration</Label>
                  <Input 
                    type="date"
                    className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Emplacement de stockage</Label>
                  <Input 
                    placeholder="Ex: Congélateur A"
                    className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Code-barres / QR</Label>
                <Input 
                  placeholder="Scannez ou saisissez le code"
                  className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Input 
                  placeholder="Informations supplémentaires"
                  className="bg-[#1A1A1A] border-[#D4AF37]/20 text-white"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 mt-6">
            <Button 
              type="button"
              variant="outline"
              className="flex-1 border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10"
              onClick={() => navigate("/inventory")}
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-[#D4AF37] hover:bg-[#B8860B] text-black"
            >
              <Save className="w-4 h-4 mr-2" />
              Ajouter à l'inventaire
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
