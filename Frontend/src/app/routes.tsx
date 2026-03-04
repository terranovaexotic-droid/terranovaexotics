import { createBrowserRouter, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import TerrariumsList from "./pages/TerrariumsList";
import TerrariumDetail from "./pages/TerrariumDetail";
import Sensors from "./pages/Sensors";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/terrariums" replace /> },

  { path: "/dashboard", element: <Dashboard /> },
  { path: "/terrariums", element: <TerrariumsList /> },
  { path: "/terrariums/:id", element: <TerrariumDetail /> },

  { path: "/sensors", element: <Sensors /> }, // ✅ AJOUTE ÇA
]);