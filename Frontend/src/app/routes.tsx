import { createBrowserRouter, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import TerrariumsList from "./pages/TerrariumsList";
import TerrariumDetail from "./pages/TerrariumDetail";
// (si tu as d'autres pages, ajoute-les pareil)

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },

  { path: "/dashboard", element: <Dashboard /> },

  { path: "/terrariums", element: <TerrariumsList /> },
  { path: "/terrariums/:id", element: <TerrariumDetail /> },
]);