import { createBrowserRouter } from "react-router";

import Dashboard from "./app/pages/Dashboard";
import TerrariumsList from "./app/pages/TerrariumsList";
import TerrariumDetail from "./app/pages/TerrariumDetail";
import AddTerrarium from "./app/pages/AddTerrarium";
import Inventory from "./app/pages/Inventory";
import AddInventoryItem from "./app/pages/AddInventoryItem";
import Tasks from "./app/pages/Tasks";
import Notifications from "./app/pages/Notifications";
import Statistics from "./app/pages/Statistics";
import Settings from "./app/pages/Settings";
import Users from "./app/pages/Users";
import Sensors from "./app/pages/Sensors";
import NotFound from "./app/pages/NotFound";

export const router = createBrowserRouter([
  { path: "/", Component: Dashboard },
  { path: "/terrariums", Component: TerrariumsList },
  { path: "/terrariums/:id", Component: TerrariumDetail },
  { path: "/terrariums/add", Component: AddTerrarium },
  { path: "/terrariums/:id/edit", Component: AddTerrarium },
  { path: "/inventory", Component: Inventory },
  { path: "/inventory/add", Component: AddInventoryItem },
  { path: "/tasks", Component: Tasks },
  { path: "/notifications", Component: Notifications },
  { path: "/statistics", Component: Statistics },
  { path: "/sensors", Component: Sensors },
  { path: "/settings", Component: Settings },
  { path: "/users", Component: Users },
  { path: "*", Component: NotFound },
]);