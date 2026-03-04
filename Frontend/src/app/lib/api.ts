import { API_BASE } from "./config";

async function check(res: Response) {
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} ${txt}`);
  }
  return res;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await check(fetch(`${API_BASE}${path}`, { credentials: "include" }));
  return res.json();
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
  const res = await check(
    fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    })
  );
  return res.json();
}

export async function apiPut<T>(path: string, body: any): Promise<T> {
  const res = await check(
    fetch(`${API_BASE}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    })
  );
  return res.json();
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await check(
    fetch(`${API_BASE}${path}`, {
      method: "DELETE",
      credentials: "include",
    })
  );
  return res.json();
}