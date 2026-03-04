import { API_BASE } from "../lib/config";

export default function TerrariumDetail({ terrarium, onDeleted }: any) {
  async function remove() {
    await fetch(`${API_BASE}/api/terrariums/${terrarium.id}`, {
      method: "DELETE",
    });

    if (onDeleted) onDeleted();
  }

  return (
    <div>
      <h2>{terrarium.name}</h2>
      <button onClick={remove}>Supprimer</button>
    </div>
  );
}