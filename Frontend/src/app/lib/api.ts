import { API_BASE } from "./config";

async function parseJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const body = await parseJson(res);
    throw new Error(body?.detail || body?.error || `GET ${path} failed`);
  }
  return (await res.json()) as T;
}

export async function apiPost<T>(path: string, data: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await parseJson(res);
    throw new Error(body?.detail || body?.error || `POST ${path} failed`);
  }
  return (await res.json()) as T;
}

export async function apiPut<T>(path: string, data: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await parseJson(res);
    throw new Error(body?.detail || body?.error || `PUT ${path} failed`);
  }
  return (await res.json()) as T;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: "DELETE" });
  if (!res.ok) {
    const body = await parseJson(res);
    throw new Error(body?.detail || body?.error || `DELETE ${path} failed`);
  }
  return (await res.json()) as T;
}