import { Card, CardContent } from "./ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  status?: "ok" | "warning" | "danger";
  subtitle?: string;
}

export function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  status,
  subtitle 
}: MetricCardProps) {
  const getStatusColor = () => {
    if (!status) return "";
    const colors = {
      ok: "shadow-[0_0_15px_rgba(16,185,129,0.3)]",
      warning: "shadow-[0_0_15px_rgba(245,158,11,0.3)]",
      danger: "shadow-[0_0_15px_rgba(239,68,68,0.3)]",
    };
    return colors[status];
  };

  return (
    <Card className={`bg-[#121212] border-[#D4AF37]/20 transition-all hover:border-[#D4AF37]/40 ${getStatusColor()}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-1">{title}</p>
            <p className="text-3xl font-semibold text-white mb-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
            {trend && (
              <p className={`text-xs mt-2 ${trend.isPositive ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                {trend.isPositive ? "↑" : "↓"} {trend.value}
              </p>
            )}
          </div>
          <div className="ml-4">
            <div className="p-3 rounded-lg bg-[#D4AF37]/10">
              <Icon className="w-6 h-6 text-[#D4AF37]" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
