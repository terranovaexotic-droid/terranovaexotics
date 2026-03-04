// src/app/lib/config.ts
export const API_BASE =
  (import.meta as any).env?.VITE_API_BASE?.trim() ||
  "http://localhost:8000"; // en local