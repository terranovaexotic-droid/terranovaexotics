import { MainLayout } from "../components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { 
  Plus, 
  Search, 
  Package, 
  AlertCircle,
  QrCode,
  Filter
} from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";

const inventory = [
  { id: "1", name: "Souris adultes", category: "Nourriture", quantity: 24, minStock: 10, unit: "unités", status: "ok" },
  { id: "2", name: "Souris juvéniles", category: "Nourriture", quantity: 15, minStock: 10, unit: "unités", status: "ok" },
  { id: "3", name: "Substrat coco", category: "Substrat", quantity: 2, minStock: 5, unit: "sacs", status: "low" },
  { id: "4", name: "Calcium en poudre", category: "Suppléments", quantity: 1, minStock: 2, unit: "boîtes", status: "low" },
  { id: "5", name: "Thermomètre digital", category: "Matériel", quantity: 3, minStock: 2, unit: "unités", status: "ok" },
  { id: "6", name: "Grillons", category: "Nourriture", quantity: 0, minStock: 20, unit: "unités", status: "out" },
  { id: "7", name: "Eau déminéralisée", category: "Entretien", quantity: 8, minStock: 3, unit: "litres", status: "ok" },
  { id: "8", name: "Désinfectant terrarium", category: "Entretien", quantity: 1, minStock: 2, unit: "bouteilles", status: "low" },
];

export default function Inventory() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ok":
        return <Badge className="bg-[#10B981] text-black">En stock</Badge>;
      case "low":
        return <Badge className="bg-[#F59E0B] text-black">Stock bas</Badge>;
      case "out":
        return <Badge className="bg-[#EF4444] text-white">Rupture</Badge>;
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Inventaire</h1>
            <p className="text-gray-400 mt-1">Gérez votre stock et vos approvisionnements</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Scanner
            </Button>
            <Button 
              className="bg-[#D4AF37] hover:bg-[#B8860B] text-black"
              onClick={() => navigate("/inventory/add")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#121212] border-[#D4AF37]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Articles</p>
                  <p className="text-2xl font-bold text-white mt-1">{inventory.length}</p>
                </div>
                <Package className="w-8 h-8 text-[#D4AF37]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#10B981]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">En stock</p>
                  <p className="text-2xl font-bold text-[#10B981] mt-1">
                    {inventory.filter(i => i.status === "ok").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#F59E0B]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Stock bas</p>
                  <p className="text-2xl font-bold text-[#F59E0B] mt-1">
                    {inventory.filter(i => i.status === "low").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#EF4444]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Rupture</p>
                  <p className="text-2xl font-bold text-[#EF4444] mt-1">
                    {inventory.filter(i => i.status === "out").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {inventory.filter(i => i.status !== "ok").length > 0 && (
          <Card className="bg-[#121212] border-[#F59E0B]/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[#F59E0B]" />
                Alertes stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {inventory
                  .filter(i => i.status !== "ok")
                  .map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-[#1A1A1A]"
                    >
                      <div>
                        <p className="text-sm text-white font-medium">{item.name}</p>
                        <p className="text-xs text-gray-400">
                          {item.quantity} {item.unit} restant{item.quantity > 1 ? "s" : ""} (min: {item.minStock})
                        </p>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher dans l'inventaire..."
            className="pl-10 bg-[#1A1A1A] border-[#D4AF37]/20 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Inventory Table */}
        <Card className="bg-[#121212] border-[#D4AF37]/20">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-[#D4AF37]/20">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Article</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Catégorie</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Quantité</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Stock min</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Statut</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => (
                    <tr 
                      key={item.id}
                      className="border-b border-[#262626] hover:bg-[#1A1A1A] transition-colors"
                    >
                      <td className="p-4">
                        <p className="text-white font-medium">{item.name}</p>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="border-[#D4AF37]/40 text-gray-400">
                          {item.category}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <p className="text-white">
                          {item.quantity} {item.unit}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-gray-400">
                          {item.minStock} {item.unit}
                        </p>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#D4AF37] hover:text-[#FFD700]"
                        >
                          Modifier
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
