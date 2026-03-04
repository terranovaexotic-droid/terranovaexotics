import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../components/MainLayout";
import { StatusBadge } from "../components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Plus, Search, Trash2, Pencil } from "lucide-react";
import { apiGet, apiDelete } from "../lib/api";
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

export default function TerrariumsList() {
  const navigate = useNavigate();
  const [terrariums, setTerrariums] = useState<Terrarium[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { lastMessage } = useSensorWS();

  const load = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await apiGet<Terrarium[]>("/api/terrariums");
      // Nettoyage simple des "tests" côté UI si tu en as encore
      const cleaned = data.filter((t) => {
        const n = (t.name || "").toLowerCase();
        const s = (t.species || "").toLowerCase();
        return !n.includes("test") && !s.includes("test");
      });
      setTerrariums(cleaned);
    } catch (e: any) {
      setError(e?.message || "Erreur chargement terrariums");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Realtime capteur → met à jour les cartes
  useEffect(() => {
    if (!lastMessage || typeof lastMessage !== "object") return;
    if (lastMessage.type !== "sensor_reading") return;

    const { sensor_id, temperature, humidity } = lastMessage;

    setTerrariums((prev) =>
      prev.map((t) =>
        t.sensor_id === sensor_id
          ? { ...t, last_temperature: temperature, last_humidity: humidity }
          : t
      )
    );
  }, [lastMessage]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return terrariums;
    return terrariums.filter((t) => {
      return (
        (t.name || "").toLowerCase().includes(qq) ||
        (t.species || "").toLowerCase().includes(qq) ||
        (t.sensor_id || "").toLowerCase().includes(qq)
      );
    });
  }, [terrariums, q]);

  const onDelete = async (id: number) => {
    // volontairement sans confirm modal (pour ne pas casser ton UI);
    // si tu veux, on ajoutera un Dialog shadcn plus tard.
    try {
      setError(null);
      await apiDelete(`/api/terrariums/${id}`);
      setTerrariums((prev) => prev.filter((t) => t.id !== id));
    } catch (e: any) {
      setError(e?.message || "Erreur suppression");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Terrariums</h1>
            <p className="text-gray-400 mt-1">Liste, capteurs temps réel, ajout et suppression.</p>
          </div>

          <Button
            className="bg-[#10B981] hover:bg-[#0ea371] text-black font-semibold"
            onClick={() => navigate("/terrariums/add")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>

        <Card className="bg-[#121212] border-[#D4AF37]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-[#D4AF37]" />
              Recherche
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nom, espèce, capteur..."
              className="bg-[#0f0f0f] border-[#D4AF37]/20 text-white"
            />
            <Button
              variant="outline"
              className="border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10"
              onClick={() => setQ("")}
            >
              Effacer
            </Button>
          </CardContent>
        </Card>

        {error && (
          <div className="text-sm text-red-400 border border-red-400/30 bg-red-500/10 rounded-lg p-3">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-gray-400">Chargement...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((t) => (
              <Card key={t.id} className="bg-[#121212] border-[#D4AF37]/20">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-white">{t.name}</CardTitle>
                      <p className="text-gray-400 text-sm mt-1">
                        {t.species || "—"} • Capteur: <span className="text-white">{t.sensor_id}</span>
                      </p>
                    </div>
                    <StatusBadge status={t.status || "ok"} />
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between bg-[#0f0f0f] border border-[#D4AF37]/10 rounded-lg p-3">
                    <div className="text-gray-400 text-sm">Température</div>
                    <div className="text-white font-semibold">
                      {t.last_temperature ?? "—"}°C
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-[#0f0f0f] border border-[#D4AF37]/10 rounded-lg p-3">
                    <div className="text-gray-400 text-sm">Humidité</div>
                    <div className="text-white font-semibold">
                      {t.last_humidity ?? "—"}%
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => navigate(`/terrariums/${t.id}`)}
                    >
                      Ouvrir
                    </Button>

                    <Button
                      variant="outline"
                      className="border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                      onClick={() => navigate(`/terrariums/${t.id}/edit`)}
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="outline"
                      className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                      onClick={() => onDelete(t.id)}
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}