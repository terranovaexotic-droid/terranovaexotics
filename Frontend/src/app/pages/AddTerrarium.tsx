import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type TerrariumCreatePayload = {
  name: string;
  species?: string | null;
  sensor_id: string;
  target_temp?: number | null;
  target_humidity?: number | null;
  status?: string | null;
};

function toNumberOrNull(v: string): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  // lire la réponse (json ou texte)
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }

  if (!res.ok) {
    const detail = data?.detail;
    const msg =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((x) => x?.msg || JSON.stringify(x)).join(" | ")
          : typeof data === "string"
            ? data
            : data?.message || "Erreur lors de la création du terrarium.";

    throw new Error(msg);
  }

  return data as T;
}

export default function AddTerrarium() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [sensorId, setSensorId] = useState("");
  const [targetTemp, setTargetTemp] = useState("");
  const [targetHum, setTargetHum] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return name.trim().length >= 2 && sensorId.trim().length >= 1 && !loading;
  }, [name, sensorId, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    const payload: TerrariumCreatePayload = {
      name: name.trim(),
      species: species.trim() ? species.trim() : null,
      sensor_id: sensorId.trim(),
      target_temp: targetTemp.trim() ? toNumberOrNull(targetTemp) : null,
      target_humidity: targetHum.trim() ? toNumberOrNull(targetHum) : null,
      status: "ok",
    };

    try {
      await postJSON("/api/terrariums", payload);
      navigate("/terrariums", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#D4AF37]">
            Ajouter un terrarium
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Crée un terrarium et associe-le à un capteur (sensor_id).
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/terrariums")}
          className="px-3 py-2 rounded-lg border border-[#D4AF37]/20 hover:bg-white/5"
        >
          Retour
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <label className="block text-sm text-gray-300 mb-2">Nom *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: A-01"
            className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[#D4AF37]/30"
          />
          <p className="text-xs text-gray-500 mt-2">Minimum 2 caractères.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <label className="block text-sm text-gray-300 mb-2">
            Espèce (optionnel)
          </label>
          <input
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            placeholder="Ex: Gecko gargouille"
            className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[#D4AF37]/30"
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <label className="block text-sm text-gray-300 mb-2">
            Sensor ID *
          </label>
          <input
            value={sensorId}
            onChange={(e) => setSensorId(e.target.value)}
            placeholder="Ex: terrarium_1"
            className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[#D4AF37]/30"
          />
          <p className="text-xs text-gray-500 mt-2">
            Doit correspondre au capteur qui envoie les lectures (ex: terrarium_1).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <label className="block text-sm text-gray-300 mb-2">
              Temp cible (°C)
            </label>
            <input
              value={targetTemp}
              onChange={(e) => setTargetTemp(e.target.value)}
              placeholder="Ex: 26.0"
              inputMode="decimal"
              className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[#D4AF37]/30"
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <label className="block text-sm text-gray-300 mb-2">
              Hum cible (%)
            </label>
            <input
              value={targetHum}
              onChange={(e) => setTargetHum(e.target.value)}
              placeholder="Ex: 70"
              inputMode="decimal"
              className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[#D4AF37]/30"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled={!canSubmit}
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#D4AF37] text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Création..." : "Créer"}
          </button>

          <span className="text-xs text-gray-500">
            Champs requis : Nom + Sensor ID
          </span>
        </div>
      </form>
    </div>
  );
}