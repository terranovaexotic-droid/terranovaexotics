import { useState } from "react";
import { API_BASE } from "../lib/config";

export default function AddTerrarium({ onAdded }: any) {
  const [name, setName] = useState("");
  const [sensorId, setSensorId] = useState("");

  async function add() {
    await fetch(`${API_BASE}/api/terrariums`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        sensor_id: sensorId,
      }),
    });

    if (onAdded) onAdded();
  }

  return (
    <div>
      <input
        placeholder="Nom"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Sensor ID"
        value={sensorId}
        onChange={(e) => setSensorId(e.target.value)}
      />

      <button onClick={add}>Ajouter</button>
    </div>
  );
}