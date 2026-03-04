import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../lib/http";

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
  const [items, setItems] = useState<Terrarium[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await apiGet<Terrarium[]>("/api/terrariums");
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  // ✅ recharge à chaque arrivée sur la page
  useEffect(() => {
    load();
  }, []);

  const total = items.length;

  const withSensor = useMemo(
    () => items.filter((t) => (t.sensor_id || "").trim().length > 0).length,
    [items]
  );

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#D4AF37]">Terrariums</h1>
          <p className="text-sm text-gray-400 mt-1">
            Gestion de tes terrariums et association avec capteurs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="px-3 py-2 rounded-lg border border-[#D4AF37]/20 hover:bg-white/5"
          >
            Actualiser
          </button>

          <Link
            to="/terrariums/add"
            className="px-3 py-2 rounded-lg bg-[#D4AF37] text-black font-semibold"
          >
            + Ajouter
          </Link>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-200">
          {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-gray-400">Total</div>
          <div className="text-2xl font-bold">{total}</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-gray-400">Avec capteur</div>
          <div className="text-2xl font-bold">{withSensor}</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-gray-400">Statut</div>
          <div className="text-2xl font-bold text-emerald-400">
            {loading ? "..." : "OK"}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Liste</h2>
          {loading && <span className="text-sm text-gray-400">Chargement…</span>}
        </div>

        <div className="mt-4 space-y-3">
          {!loading && items.length === 0 && (
            <div className="text-gray-400">Aucun terrarium.</div>
          )}

          {items.map((t) => (
            <Link
              key={t.id}
              to={`/terrariums/${t.id}`}
              className="block rounded-xl border border-white/10 bg-black/20 hover:bg-white/5 p-4 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">
                    {t.name}{" "}
                    <span className="text-gray-400 font-normal">
                      — {t.species || "—"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Capteur :{" "}
                    <span className="text-[#D4AF37]">
                      {t.sensor_id || "—"}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-gray-300">
                  {t.status || "ok"}
                </div>
              </div>

              <div className="mt-3 text-sm text-gray-300">
                Temp cible :{" "}
                <span className="text-[#D4AF37] font-semibold">
                  {t.target_temp ?? "—"}°C
                </span>{" "}
                | Hum cible :{" "}
                <span className="text-emerald-300 font-semibold">
                  {t.target_humidity ?? "—"}%
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}