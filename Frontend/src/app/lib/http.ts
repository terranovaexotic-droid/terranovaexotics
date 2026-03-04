// src/app/lib/http.ts
import { API_BASE } from "./config";

async function readBody(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractErrorMessage(data: any): string {
  const detail = data?.detail;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail
      .map((x) => x?.msg || x?.message || JSON.stringify(x))
      .join(" | ");
  }

  if (typeof data === "string") return data;

  return data?.message || "Erreur lors de la requête.";
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await readBody(res);

  if (!res.ok) {
    const msg = extractErrorMessage(data);
    throw new Error(msg);
  }

  return data as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  const data = await readBody(res);

  if (!res.ok) {
    const msg = extractErrorMessage(data);
    throw new Error(msg);
  }

  return data as T;
}