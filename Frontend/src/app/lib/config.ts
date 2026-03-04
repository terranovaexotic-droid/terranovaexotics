// src/app/lib/config.ts

// Base HTTP pour l’API (GET/POST /api/...)
export const API_BASE =
  (import.meta as any).env?.VITE_API_BASE?.trim() ||
  "http://localhost:8000";

// Base WS pour les capteurs (/ws/sensor)
export const WS_URL =
  (import.meta as any).env?.VITE_WS_URL?.trim() ||
  "ws://localhost:8000";