import { MainLayout } from "../components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { 
  Plus, 
  Search, 
  MoreVertical,
  Shield,
  User,
  Mail
} from "lucide-react";
import { useState } from "react";

const users = [
  { 
    id: "1", 
    name: "Admin Principal", 
    email: "admin@terra.com", 
    role: "admin", 
    status: "active",
    lastLogin: "Aujourd'hui à 14:30"
  },
  { 
    id: "2", 
    name: "Marie Dupont", 
    email: "marie.dupont@terra.com", 
    role: "manager", 
    status: "active",
    lastLogin: "Aujourd'hui à 09:15"
  },
  { 
    id: "3", 
    name: "Thomas Martin", 
    email: "thomas.martin@terra.com", 
    role: "user", 
    status: "active",
    lastLogin: "Hier à 18:45"
  },
  { 
    id: "4", 
    name: "Sophie Bernard", 
    email: "sophie.bernard@terra.com", 
    role: "user", 
    status: "inactive",
    lastLogin: "Il y a 5 jours"
  },
];

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-[#D4AF37] text-black">Administrateur</Badge>;
      case "manager":
        return <Badge className="bg-[#10B981] text-black">Manager</Badge>;
      case "user":
        return <Badge variant="outline" className="border-gray-600 text-gray-400">Utilisateur</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "active" 
      ? <Badge className="bg-[#10B981] text-black">Actif</Badge>
      : <Badge variant="outline" className="border-gray-600 text-gray-400">Inactif</Badge>;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Utilisateurs</h1>
            <p className="text-gray-400 mt-1">Gérez les accès et les permissions</p>
          </div>
          <Button 
            className="bg-[#D4AF37] hover:bg-[#B8860B] text-black w-full lg:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Inviter un utilisateur
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#121212] border-[#D4AF37]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-white mt-1">{users.length}</p>
                </div>
                <User className="w-8 h-8 text-[#D4AF37]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#10B981]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Actifs</p>
                  <p className="text-2xl font-bold text-[#10B981] mt-1">
                    {users.filter(u => u.status === "active").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#D4AF37]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Admins</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {users.filter(u => u.role === "admin").length}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-[#D4AF37]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#D4AF37]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Managers</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {users.filter(u => u.role === "manager").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher un utilisateur..."
            className="pl-10 bg-[#1A1A1A] border-[#D4AF37]/20 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Users Table */}
        <Card className="bg-[#121212] border-[#D4AF37]/20">
          <CardHeader>
            <CardTitle className="text-white">Membres de l'équipe</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-[#D4AF37]/20">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Utilisateur</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Rôle</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Statut</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Dernière connexion</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr 
                      key={user.id}
                      className="border-b border-[#262626] hover:bg-[#1A1A1A] transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-[#D4AF37] text-black">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-sm text-gray-400 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-400">{user.lastLogin}</p>
                      </td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-white"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Permissions Info */}
        <Card className="bg-[#121212] border-[#D4AF37]/20">
          <CardHeader>
            <CardTitle className="text-white">Niveaux de permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-[#1A1A1A]">
              <Shield className="w-5 h-5 text-[#D4AF37] mt-1" />
              <div>
                <p className="text-white font-medium">Administrateur</p>
                <p className="text-sm text-gray-400">
                  Accès complet : gestion des utilisateurs, paramètres système, tous les terrariums
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-[#1A1A1A]">
              <Shield className="w-5 h-5 text-[#10B981] mt-1" />
              <div>
                <p className="text-white font-medium">Manager</p>
                <p className="text-sm text-gray-400">
                  Gestion des terrariums, inventaire, tâches, mais pas d'accès aux paramètres système
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-[#1A1A1A]">
              <User className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-white font-medium">Utilisateur</p>
                <p className="text-sm text-gray-400">
                  Consultation uniquement : visualisation des données sans modification
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
