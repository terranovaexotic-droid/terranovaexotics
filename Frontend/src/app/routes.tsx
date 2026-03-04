import { createBrowserRouter, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import TerrariumsList from "./pages/TerrariumsList";
import AddTerrarium from "./pages/AddTerrarium";
import TerrariumDetail from "./pages/TerrariumDetail";

import Sensors from "./pages/Sensors";
import Inventory from "./pages/Inventory";
import AddInventoryItem from "./pages/AddInventoryItem";
import Tasks from "./pages/Tasks";
import Notifications from "./pages/Notifications";
import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },

  { path: "/dashboard", element: <Dashboard /> },

  { path: "/terrariums", element: <TerrariumsList /> },
  { path: "/terrariums/add", element: <AddTerrarium /> },
  { path: "/terrariums/:id", element: <TerrariumDetail /> },

  { path: "/sensors", element: <Sensors /> },

  { path: "/inventory", element: <Inventory /> },
  { path: "/inventory/add", element: <AddInventoryItem /> },

  { path: "/tasks", element: <Tasks /> },
  { path: "/notifications", element: <Notifications /> },
  { path: "/statistics", element: <Statistics /> },
  { path: "/settings", element: <Settings /> },
  { path: "/users", element: <Users /> },

  { path: "*", element: <NotFound /> },
]);