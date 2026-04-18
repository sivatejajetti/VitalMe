import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Plus, CheckCircle2, Circle, Trash2, Calendar, Zap, ListTodo, Cloud } from "lucide-react";
import { getTasks, syncTasks, deleteTask as apiDeleteTask } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Task } from "@/types";

const Tasks = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"habit" | "todo">("habit");
  const [inputValue, setInputValue] = useState("");

  // Cloud Fetch
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });

  // Cloud Sync Mutation
  const syncMutation = useMutation({
    mutationFn: (newTasks: Task[]) => syncTasks(newTasks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => toast.error("Cloud sync failed. Check your connection."),
  });

  const toggleTask = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    queryClient.setQueryData(["tasks"], updated);
    syncMutation.mutate(updated);
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      text: inputValue.trim(),
      completed: false,
      type: activeTab,
      streak: activeTab === "habit" ? 0 : undefined
    };
    const updated = [...tasks, newTask];
    queryClient.setQueryData(["tasks"], updated);
    syncMutation.mutate(updated);
    setInputValue("");
  };

  const deleteTask = async (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    queryClient.setQueryData(["tasks"], updated);
    try {
      await apiDeleteTask(id);
      syncMutation.mutate(updated);
    } catch (e) {
      toast.error("Could not delete task from cloud.");
    }
  };

  const filteredTasks = tasks.filter(t => t.type === activeTab);
  const completedCount = filteredTasks.filter(t => t.completed).length;
  const progress = filteredTasks.length > 0 ? (completedCount / filteredTasks.length) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      {/* Header & Progress */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Mission Control</h1>
            <p className="text-muted-foreground mt-1 text-sm">Optimize your daily performance and long-term goals.</p>
          </div>
          <div className="flex bg-surface-lowest/50 backdrop-blur-xl p-1 rounded-2xl border border-white/20 shadow-sm">
            {(["habit", "todo"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
                  ${activeTab === tab 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:text-primary"}`}
              >
                {tab === "habit" ? <Zap className="w-3.5 h-3.5" /> : <ListTodo className="w-3.5 h-3.5" />}
                {tab === "habit" ? "Daily Rituals" : "Focus List"}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 border-white/20">
          <div className="flex justify-between items-end mb-3">
            <span className="text-sm font-bold text-foreground">Mission Progress</span>
            <span className="text-xs font-black text-primary bg-primary/10 px-2 py-1 rounded-lg">{Math.round(progress)}% Completed</span>
          </div>
          <div className="h-3 bg-surface-high/50 rounded-full overflow-hidden border border-white/10 p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-primary to-primary-foreground rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={addTask} className="relative group">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={activeTab === "habit" ? "Add a new daily ritual..." : "What's on your focus list?"}
          className="w-full bg-surface-lowest/80 backdrop-blur-md border border-white/20 rounded-3xl px-6 py-5 pr-16 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xl group-hover:shadow-primary/5 transition-all text-sm"
        />
        <button 
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      {/* Task List */}
      <div className="space-y-3 relative min-h-[400px]">
        <AnimatePresence mode="popLayout" initial={false}>
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-muted-foreground"
            >
              <div className="w-16 h-16 rounded-3xl bg-surface-high/50 flex items-center justify-center mb-4">
                {activeTab === "habit" ? <Zap className="w-8 h-8 opacity-20" /> : <ListTodo className="w-8 h-8 opacity-20" />}
              </div>
              <p className="text-sm font-medium">No tasks found. Start by adding one above.</p>
            </motion.div>
          ) : (
            filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group flex items-center gap-4 p-5 rounded-3xl border transition-all duration-300
                  ${task.completed 
                    ? "bg-surface-high/30 border-transparent opacity-60" 
                    : "glass-card border-white/20 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 shadow-sm"}`}
              >
                <button 
                  onClick={() => toggleTask(task.id)}
                  className={`shrink-0 transition-all duration-300 ${task.completed ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                >
                  {task.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </button>
                
                <span className={`flex-1 text-sm font-semibold transition-all duration-300 ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {task.text}
                </span>

                {task.streak !== undefined && (
                  <div className="flex items-center gap-1 bg-warning/10 text-warning-foreground px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-tight">
                    <Zap className="w-3 h-3 fill-warning" />
                    {task.streak} Day {task.streak === 1 ? "Streak" : "Streaks"}
                  </div>
                )}

                <button 
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-danger hover:bg-danger/10 rounded-xl transition-all ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Tasks;
