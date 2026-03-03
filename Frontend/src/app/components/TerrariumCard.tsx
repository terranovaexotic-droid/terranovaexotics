import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { StatusBadge } from "./StatusBadge";
import { Thermometer, Droplets, Calendar } from "lucide-react";

interface TerrariumCardProps {
  id: string;
  name: string;
  species: string;
  temperature: number;
  humidity: number;
  status: "ok" | "warning" | "danger";
  lastUpdate: string;
  onClick?: () => void;
}

export function TerrariumCard({
  name,
  species,
  temperature,
  humidity,
  status,
  lastUpdate,
  onClick,
}: TerrariumCardProps) {
  return (
    <Card 
      className="bg-[#121212] border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-white group-hover:text-[#D4AF37] transition-colors">
              {name}
            </CardTitle>
            <p className="text-sm text-gray-400 mt-1">{species}</p>
          </div>
          <StatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-[#EF4444]" />
            <div>
              <p className="text-xs text-gray-400">Température</p>
              <p className="text-sm font-semibold text-white">{temperature}°C</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-[#10B981]" />
            <div>
              <p className="text-xs text-gray-400">Humidité</p>
              <p className="text-sm font-semibold text-white">{humidity}%</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="w-3 h-3" />
          <span>Mis à jour {lastUpdate}</span>
        </div>
      </CardContent>
    </Card>
  );
}
