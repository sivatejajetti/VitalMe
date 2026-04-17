import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Target, Droplets, Dumbbell, SmilePlus, Flame, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { logActivity, getTodayLogs } from "@/services/api";
import { toast } from "sonner"; // Using our existing toast system

interface GoalItem {
  id: string; 
  label: string; 
  icon: React.ReactNode; 
  unit: string;
  value: number; 
  setValue: (v: number) => void; 
  streak: number; 
  max?: number;
  type: string;
}

const Goals = () => {
  const queryClient = useQueryClient();
  const [localValues, setLocalValues] = useState<Record<string, number>>({
    pushups: 0,
    water: 0,
    mood: 3,
    workout: 0
  });

  // Fetch all today's logs in one request
  const { data: todayLogs, isLoading: isFetching } = useQuery({ 
    queryKey: ['logs', 'today'], 
    queryFn: getTodayLogs,
    staleTime: 60000 // 1 minute cache
  });

  useEffect(() => {
    if (todayLogs) {
      setLocalValues({
        pushups: todayLogs.pushups || 0,
        water: todayLogs.water || 0,
        mood: todayLogs.mood || 3,
        workout: todayLogs.workout || 0
      });
    }
  }, [todayLogs]);

  const mutation = useMutation({
    mutationFn: ({ type, value }: { type: string, value: number }) => logActivity(type, value),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['logs'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyAnalytics'] });
      
      // Dynamic Toast Feedback
      const labels: Record<string, string> = {
        pushups: 'Reps',
        water: 'Glasses',
        mood: 'Mood Rating',
        workout: 'Minutes'
      };
      toast.success(`${labels[variables.type] || variables.type} saved successfully! ✨`);
    },
    onError: () => {
      toast.error("Cloud synchronization failed. Please check your connection.");
    }
  });

  const handleLog = (type: string) => {
    mutation.mutate({ type, value: localValues[type] });
  };

  const goals: GoalItem[] = [
    { id: "pushups", label: "Pushups", icon: <Dumbbell className="w-5 h-5" />, unit: "reps", value: localValues.pushups, type: 'pushups', setValue: (v) => setLocalValues(p => ({...p, pushups: v})), streak: 5 },
    { id: "water", label: "Water Intake", icon: <Droplets className="w-5 h-5" />, unit: "glasses", value: localValues.water, type: 'water', setValue: (v) => setLocalValues(p => ({...p, water: v})), streak: 3, max: 8 },
    { id: "mood", label: "Mood", icon: <SmilePlus className="w-5 h-5" />, unit: "/ 5 ⭐", value: localValues.mood, type: 'mood', setValue: (v) => setLocalValues(p => ({...p, mood: v})), streak: 7, max: 5 },
    { id: "workout", label: "Workout", icon: <Flame className="w-5 h-5" />, unit: "min", value: localValues.workout, type: 'workout', setValue: (v) => setLocalValues(p => ({...p, workout: v})), streak: 2, max: 60 },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
        <Target className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Daily Goals</h1>
      </motion.div>

      {isFetching ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground animate-pulse">Syncing your cloud vitals...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {goals.map((g, i) => (
            <motion.div key={g.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-primary">{g.icon}</span>
                  <h3 className="font-semibold text-foreground text-sm">{g.label}</h3>
                </div>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Cloud Optimized</span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={g.value}
                  onChange={(e) => g.setValue(g.max ? Math.max(0, Math.min(g.max, +e.target.value)) : Math.max(0, +e.target.value))}
                  className="w-20 bg-secondary border border-border rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary font-bold"
                />
                <span className="text-muted-foreground text-xs font-semibold">{g.unit}</span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleLog(g.type)}
                  disabled={mutation.isPending && mutation.variables?.type === g.type}
                  className="ml-auto px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:brightness-110 shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {mutation.isPending && mutation.variables?.type === g.type ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : "Save"}
                </motion.button>
              </div>

              {g.max && (
                <div className="space-y-2 pt-2">
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-primary/40" initial={{ width: 0 }} animate={{ width: `${(g.value / g.max) * 100}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{g.value} / {g.max} {g.unit}</p>
                </div>
              )}
              {!g.max && (
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{g.value} {g.unit} logged today</p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Goals;
