import { MainLayout } from "../components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Badge } from "../components/ui/badge";
import { 
  Plus, 
  CheckCircle2, 
  Clock,
  Calendar
} from "lucide-react";
import { useState } from "react";

const tasks = [
  { id: "1", title: "Nourrir Python regius", terrarium: "Terrarium Python", priority: "high", dueDate: "2026-03-02", completed: false, type: "feeding" },
  { id: "2", title: "Nettoyer substrat Gecko", terrarium: "Terrarium Gecko", priority: "medium", dueDate: "2026-03-02", completed: false, type: "cleaning" },
  { id: "3", title: "Changer eau Pogona", terrarium: "Terrarium Dragon", priority: "high", dueDate: "2026-03-02", completed: false, type: "water" },
  { id: "4", title: "Contrôle température mensuel", terrarium: "Tous", priority: "medium", dueDate: "2026-03-05", completed: false, type: "maintenance" },
  { id: "5", title: "Commander grillons", terrarium: "Inventaire", priority: "high", dueDate: "2026-03-03", completed: false, type: "order" },
  { id: "6", title: "Vérifier éclairage UVB", terrarium: "Terrarium Gecko", priority: "low", dueDate: "2026-03-08", completed: false, type: "maintenance" },
  { id: "7", title: "Peser les animaux", terrarium: "Tous", priority: "medium", dueDate: "2026-03-10", completed: false, type: "health" },
];

export default function Tasks() {
  const [taskList, setTaskList] = useState(tasks);

  const toggleTask = (id: string) => {
    setTaskList(taskList.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-[#EF4444] text-white";
      case "medium":
        return "bg-[#F59E0B] text-black";
      case "low":
        return "bg-[#10B981] text-black";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Urgent";
      case "medium":
        return "Moyen";
      case "low":
        return "Faible";
      default:
        return priority;
    }
  };

  const completedTasks = taskList.filter(t => t.completed);
  const pendingTasks = taskList.filter(t => !t.completed);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Tâches & Entretien</h1>
            <p className="text-gray-400 mt-1">Gérez vos tâches quotidiennes</p>
          </div>
          <Button 
            className="bg-[#D4AF37] hover:bg-[#B8860B] text-black"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle tâche
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#121212] border-[#D4AF37]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-white mt-1">{taskList.length}</p>
                </div>
                <Clock className="w-8 h-8 text-[#D4AF37]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#F59E0B]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">En attente</p>
                  <p className="text-2xl font-bold text-[#F59E0B] mt-1">{pendingTasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#10B981]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Complétées</p>
                  <p className="text-2xl font-bold text-[#10B981] mt-1">{completedTasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#EF4444]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Urgentes</p>
                  <p className="text-2xl font-bold text-[#EF4444] mt-1">
                    {taskList.filter(t => t.priority === "high" && !t.completed).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Tasks */}
        <Card className="bg-[#121212] border-[#D4AF37]/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#D4AF37]" />
              Aujourd'hui - Lundi 2 mars 2026
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {taskList
              .filter(task => task.dueDate === "2026-03-02")
              .map((task) => (
                <div 
                  key={task.id}
                  className={`flex items-start gap-4 p-4 rounded-lg transition-all ${
                    task.completed 
                      ? "bg-[#1A1A1A] opacity-60" 
                      : "bg-[#1A1A1A] hover:bg-[#262626]"
                  }`}
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className={`font-medium ${task.completed ? "line-through text-gray-500" : "text-white"}`}>
                          {task.title}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">{task.terrarium}</p>
                      </div>
                      <Badge className={getPriorityColor(task.priority)}>
                        {getPriorityLabel(task.priority)}
                      </Badge>
                    </div>
                  </div>
                  {task.completed && (
                    <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                  )}
                </div>
              ))}
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="bg-[#121212] border-[#D4AF37]/20">
          <CardHeader>
            <CardTitle className="text-white">Tâches à venir</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {taskList
              .filter(task => task.dueDate !== "2026-03-02" && !task.completed)
              .map((task) => (
                <div 
                  key={task.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-[#1A1A1A] hover:bg-[#262626] transition-colors"
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <p className="font-medium text-white">{task.title}</p>
                        <p className="text-sm text-gray-400 mt-1">{task.terrarium}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-[#D4AF37]/40 text-gray-400">
                          {new Date(task.dueDate).toLocaleDateString("fr-FR", { 
                            day: "numeric", 
                            month: "short" 
                          })}
                        </Badge>
                        <Badge className={getPriorityColor(task.priority)}>
                          {getPriorityLabel(task.priority)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <Card className="bg-[#121212] border-[#D4AF37]/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                Tâches complétées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {completedTasks.map((task) => (
                <div 
                  key={task.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-[#1A1A1A] opacity-60"
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-500 line-through">{task.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{task.terrarium}</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
