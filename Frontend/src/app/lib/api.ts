import { API_BASE } from "./config";

export type Reading = {
  sensor_id: string;
  temperature: number | null;
  humidity: number | null;
  created_at: string;
};

export async function postReading(payload: {
  sensor_id: string;
  temperature?: number | null;
  humidity?: number | null;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/api/readings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST /api/readings failed: ${res.status} ${text}`);
  }
}