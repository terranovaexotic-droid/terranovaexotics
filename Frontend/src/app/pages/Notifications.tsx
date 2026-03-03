import { MainLayout } from "../components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  Thermometer,
  Droplets,
  BatteryWarning,
  Trash2
} from "lucide-react";

const notifications = [
  {
    id: "1",
    type: "alert",
    severity: "high",
    title: "Température élevée",
    message: "Le terrarium Dragon dépasse la température cible de 2°C",
    terrarium: "Terrarium Dragon",
    timestamp: "Il y a 5 min",
    icon: Thermometer,
    read: false,
  },
  {
    id: "2",
    type: "warning",
    severity: "medium",
    title: "Stock bas",
    message: "Le substrat coco atteint le niveau minimum de stock",
    terrarium: "Inventaire",
    timestamp: "Il y a 15 min",
    icon: AlertTriangle,
    read: false,
  },
  {
    id: "3",
    type: "info",
    severity: "low",
    title: "Entretien programmé",
    message: "Nettoyage du terrarium Python prévu aujourd'hui",
    terrarium: "Terrarium Python",
    timestamp: "Il y a 1h",
    icon: Info,
    read: false,
  },
  {
    id: "4",
    type: "alert",
    severity: "high",
    title: "Humidité basse",
    message: "L'humidité du terrarium Gecko est inférieure à 60%",
    terrarium: "Terrarium Gecko",
    timestamp: "Il y a 2h",
    icon: Droplets,
    read: true,
  },
  {
    id: "5",
    type: "warning",
    severity: "medium",
    title: "Batterie capteur faible",
    message: "Le capteur TEMP-003 a une batterie à 15%",
    terrarium: "Terrarium Tortue",
    timestamp: "Il y a 3h",
    icon: BatteryWarning,
    read: true,
  },
  {
    id: "6",
    type: "success",
    severity: "low",
    title: "Paramètres mis à jour",
    message: "Les plages de température ont été ajustées avec succès",
    terrarium: "Terrarium Python",
    timestamp: "Il y a 5h",
    icon: CheckCircle,
    read: true,
  },
];

export default function Notifications() {
  const getSeverityColor = (severity: string, read: boolean) => {
    if (read) return "border-l-gray-600";
    
    switch (severity) {
      case "high":
        return "border-l-[#EF4444]";
      case "medium":
        return "border-l-[#F59E0B]";
      case "low":
        return "border-l-[#10B981]";
      default:
        return "border-l-gray-600";
    }
  };

  const getIconColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-[#EF4444]";
      case "medium":
        return "text-[#F59E0B]";
      case "low":
        return "text-[#10B981]";
      default:
        return "text-gray-400";
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Bell className="w-8 h-8 text-[#D4AF37]" />
              Notifications & Alertes
            </h1>
            <p className="text-gray-400 mt-1">
              {unreadCount} notification{unreadCount > 1 ? "s" : ""} non lue{unreadCount > 1 ? "s" : ""}
            </p>
          </div>
          <Button 
            variant="outline"
            className="border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10"
          >
            Tout marquer comme lu
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#121212] border-[#EF4444]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Alertes critiques</p>
                  <p className="text-2xl font-bold text-[#EF4444] mt-1">
                    {notifications.filter(n => n.severity === "high" && !n.read).length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-[#EF4444]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#F59E0B]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Avertissements</p>
                  <p className="text-2xl font-bold text-[#F59E0B] mt-1">
                    {notifications.filter(n => n.severity === "medium" && !n.read).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#10B981]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Informations</p>
                  <p className="text-2xl font-bold text-[#10B981] mt-1">
                    {notifications.filter(n => n.severity === "low" && !n.read).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#D4AF37]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-white mt-1">{notifications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="bg-[#121212] border border-[#D4AF37]/20">
            <TabsTrigger value="all">
              Toutes ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Non lues ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="alerts">
              Alertes ({notifications.filter(n => n.severity === "high").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="space-y-3">
              {notifications.map((notification) => {
                const IconComponent = notification.icon;
                return (
                  <Card 
                    key={notification.id}
                    className={`bg-[#121212] border-[#D4AF37]/20 border-l-4 ${getSeverityColor(notification.severity, notification.read)} ${
                      !notification.read ? "shadow-[0_0_10px_rgba(212,175,55,0.2)]" : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${
                          notification.read ? "bg-gray-800" : "bg-[#1A1A1A]"
                        }`}>
                          <IconComponent className={`w-5 h-5 ${getIconColor(notification.severity)}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className={`font-semibold ${notification.read ? "text-gray-400" : "text-white"}`}>
                                {notification.title}
                              </h3>
                              <p className={`text-sm mt-1 ${notification.read ? "text-gray-600" : "text-gray-400"}`}>
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <Badge variant="outline" className="border-[#D4AF37]/40 text-gray-500 text-xs">
                                  {notification.terrarium}
                                </Badge>
                                <span className="text-xs text-gray-600">{notification.timestamp}</span>
                              </div>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-[#D4AF37] mt-2" />
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:text-[#EF4444]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="unread">
            <div className="space-y-3">
              {notifications
                .filter(n => !n.read)
                .map((notification) => {
                  const IconComponent = notification.icon;
                  return (
                    <Card 
                      key={notification.id}
                      className={`bg-[#121212] border-[#D4AF37]/20 border-l-4 ${getSeverityColor(notification.severity, notification.read)} shadow-[0_0_10px_rgba(212,175,55,0.2)]`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-lg bg-[#1A1A1A]">
                            <IconComponent className={`w-5 h-5 ${getIconColor(notification.severity)}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="font-semibold text-white">{notification.title}</h3>
                                <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                                <div className="flex items-center gap-3 mt-2">
                                  <Badge variant="outline" className="border-[#D4AF37]/40 text-gray-500 text-xs">
                                    {notification.terrarium}
                                  </Badge>
                                  <span className="text-xs text-gray-600">{notification.timestamp}</span>
                                </div>
                              </div>
                              <div className="w-2 h-2 rounded-full bg-[#D4AF37] mt-2" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>

          <TabsContent value="alerts">
            <div className="space-y-3">
              {notifications
                .filter(n => n.severity === "high")
                .map((notification) => {
                  const IconComponent = notification.icon;
                  return (
                    <Card 
                      key={notification.id}
                      className={`bg-[#121212] border-[#D4AF37]/20 border-l-4 border-l-[#EF4444]`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-lg bg-[#1A1A1A]">
                            <IconComponent className="w-5 h-5 text-[#EF4444]" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-white">{notification.title}</h3>
                            <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <Badge variant="outline" className="border-[#D4AF37]/40 text-gray-500 text-xs">
                                {notification.terrarium}
                              </Badge>
                              <span className="text-xs text-gray-600">{notification.timestamp}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
