import { useEffect, useState } from "react";
import { API_BASE } from "../lib/config";

export default function TerrariumsList() {
  const [terrariums, setTerrariums] = useState<any[]>([]);

  async function loadTerrariums() {
    const res = await fetch(`${API_BASE}/api/terrariums`);
    const data = await res.json();
    setTerrariums(data);
  }

  useEffect(() => {
    loadTerrariums();
  }, []);

  return (
    <div>
      {terrariums.map((t) => (
        <div key={t.id}>
          <h3>{t.name}</h3>
          <p>{t.species}</p>
          <p>Temp: {t.last_temperature ?? "--"}°C</p>
          <p>Humidité: {t.last_humidity ?? "--"}%</p>
        </div>
      ))}
    </div>
  );
}