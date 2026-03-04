import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Box, 
  Package, 
  CheckSquare, 
  Bell, 
  BarChart3, 
  Settings,
  Users,
  Gauge
} from "lucide-react";

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/terrariums", icon: Box, label: "Terrariums" },
  { path: "/inventory", icon: Package, label: "Inventaire" },
  { path: "/sensors", icon: Gauge, label: "Capteurs" },
  { path: "/tasks", icon: CheckSquare, label: "Tâches" },
  { path: "/notifications", icon: Bell, label: "Alertes" },
  { path: "/statistics", icon: BarChart3, label: "Statistiques" },
  { path: "/settings", icon: Settings, label: "Paramètres" },
  { path: "/users", icon: Users, label: "Utilisateurs" },
];

export function DesktopNavigation() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0F0F0F] border-r border-[#D4AF37]/20 hidden lg:flex flex-col">
      <div className="p-6 border-b border-[#D4AF37]/20">
        <h1 className="text-2xl font-bold text-[#D4AF37]">TerraManager</h1>
        <p className="text-xs text-gray-500 mt-1">Gestion intelligente</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive 
                  ? "bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]" 
                  : "text-gray-400 hover:bg-[#1A1A1A] hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-[#D4AF37]/20">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-[#10B981] flex items-center justify-center">
            <span className="text-sm font-semibold text-black">AD</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Admin</p>
            <p className="text-xs text-gray-500">admin@terra.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function MobileNavigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0F0F0F] border-t border-[#D4AF37]/20 lg:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.slice(0, 5).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? "text-[#D4AF37]" : "text-gray-400"
              }`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}