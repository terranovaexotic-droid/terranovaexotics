import { MainLayout } from "../components/MainLayout";
import { TerrariumCard } from "../components/TerrariumCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";

const terrariums = [
  { id: "1", name: "Terrarium Python", species: "Python regius", temperature: 28, humidity: 65, status: "ok" as const, lastUpdate: "il y a 2 min" },
  { id: "2", name: "Terrarium Gecko", species: "Correlophus ciliatus", temperature: 22, humidity: 75, status: "ok" as const, lastUpdate: "il y a 5 min" },
  { id: "3", name: "Terrarium Dragon", species: "Pogona vitticeps", temperature: 35, humidity: 40, status: "warning" as const, lastUpdate: "il y a 1 min" },
  { id: "4", name: "Terrarium Boa", species: "Boa constrictor", temperature: 26, humidity: 70, status: "ok" as const, lastUpdate: "il y a 3 min" },
  { id: "5", name: "Terrarium Caméléon", species: "Chamaeleo calyptratus", temperature: 24, humidity: 80, status: "ok" as const, lastUpdate: "il y a 8 min" },
  { id: "6", name: "Terrarium Tortue", species: "Testudo hermanni", temperature: 30, humidity: 55, status: "warning" as const, lastUpdate: "il y a 4 min" },
];

export default function TerrariumsList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredTerrariums = terrariums.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.species.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || t.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Terrariums</h1>
            <p className="text-gray-400 mt-1">Gérez tous vos terrariums</p>
          </div>
          <Button 
            className="bg-[#D4AF37] hover:bg-[#B8860B] text-black w-full lg:w-auto"
            onClick={() => navigate("/terrariums/add")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un terrarium
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher un terrarium..."
              className="pl-10 bg-[#1A1A1A] border-[#D4AF37]/20 text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full lg:w-[200px] bg-[#1A1A1A] border-[#D4AF37]/20 text-white">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="ok">OK</SelectItem>
              <SelectItem value="warning">Attention</SelectItem>
              <SelectItem value="danger">Danger</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#121212] border border-[#D4AF37]/20 rounded-lg p-4">
            <p className="text-sm text-gray-400">Total</p>
            <p className="text-2xl font-bold text-white mt-1">{terrariums.length}</p>
          </div>
          <div className="bg-[#121212] border border-[#10B981]/20 rounded-lg p-4">
            <p className="text-sm text-gray-400">OK</p>
            <p className="text-2xl font-bold text-[#10B981] mt-1">
              {terrariums.filter(t => t.status === "ok").length}
            </p>
          </div>
          <div className="bg-[#121212] border border-[#F59E0B]/20 rounded-lg p-4">
            <p className="text-sm text-gray-400">Attention</p>
            <p className="text-2xl font-bold text-[#F59E0B] mt-1">
              {terrariums.filter(t => t.status === "warning").length}
            </p>
          </div>
          <div className="bg-[#121212] border border-[#EF4444]/20 rounded-lg p-4">
            <p className="text-sm text-gray-400">Danger</p>
            <p className="text-2xl font-bold text-[#EF4444] mt-1">
              {terrariums.filter(t => t.status === "danger").length}
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTerrariums.map((terrarium) => (
            <TerrariumCard
              key={terrarium.id}
              {...terrarium}
              onClick={() => navigate(`/terrariums/${terrarium.id}`)}
            />
          ))}
        </div>

        {filteredTerrariums.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">Aucun terrarium trouvé</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
