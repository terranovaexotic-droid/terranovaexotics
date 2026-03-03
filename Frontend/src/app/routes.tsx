import { createBrowserRouter } from "react-router";
import Dashboard from "./pages/Dashboard";
import TerrariumsList from "./pages/TerrariumsList";
import TerrariumDetail from "./pages/TerrariumDetail";
import AddTerrarium from "./pages/AddTerrarium";
import Inventory from "./pages/Inventory";
import AddInventoryItem from "./pages/AddInventoryItem";
import Tasks from "./pages/Tasks";
import Notifications from "./pages/Notifications";
import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import Sensors from "./pages/Sensors";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Dashboard,
  },
  {
    path: "/terrariums",
    Component: TerrariumsList,
  },
  {
    path: "/terrariums/:id",
    Component: TerrariumDetail,
  },
  {
    path: "/terrariums/add",
    Component: AddTerrarium,
  },
  {
    path: "/terrariums/:id/edit",
    Component: AddTerrarium,
  },
  {
    path: "/inventory",
    Component: Inventory,
  },
  {
    path: "/inventory/add",
    Component: AddInventoryItem,
  },
  {
    path: "/tasks",
    Component: Tasks,
  },
  {
    path: "/notifications",
    Component: Notifications,
  },
  {
    path: "/statistics",
    Component: Statistics,
  },
  {
    path: "/sensors",
    Component: Sensors,
  },
  {
    path: "/settings",
    Component: Settings,
  },
  {
    path: "/users",
    Component: Users,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);