import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Footprints, Moon, HeartPulse, Flame, X, Dumbbell, Droplets, Smile, Timer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getHistoryData } from "@/services/api";
import { HistoryItem } from "@/types";
import { useState } from "react";

const History = () => {
  const { data: historyData, isLoading } = useQuery<HistoryItem[]>({
    queryKey: ["historyData"],
    queryFn: getHistoryData,
  });

  const [selected, setSelected] = useState<HistoryItem | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Reconstructing your health timeline...</p>
      </div>
    );
  }

  const data = Array.isArray(historyData) ? historyData : [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Health Ledger</h1>
        </div>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary px-3 py-1 rounded-full">Last 14 Days</span>
      </motion.div>

      <div className="space-y-3">
        {data.map((d: HistoryItem, i: number) => (
          <motion.button
            key={d.date}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => setSelected(d)}
            className="w-full glass-card p-5 flex items-center justify-between hover:glow-border transition-all text-left group"
          >
            <div className="space-y-1">
                <span className="text-xs font-bold text-primary uppercase tracking-tighter">{d.day}</span>
                <p className="text-sm font-bold text-foreground">{new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Movement</span>
                <span className="text-sm font-bold text-foreground flex items-center gap-1">
                    <Footprints className="w-3 h-3 text-success" /> {(d.steps || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Strength</span>
                <span className="text-sm font-bold text-foreground flex items-center gap-1">
                    <Dumbbell className="w-3 h-3 text-purple-500" /> {d.pushups || 0}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md p-4" onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="glass-card-glow p-8 max-w-md w-full relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                  <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground bg-secondary/50 p-2 rounded-full"><X className="w-4 h-4" /></button>
              </div>
              
              <div className="mb-8">
                <p className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-1">{selected.day} Analysis</p>
                <h2 className="text-2xl font-black text-foreground">{new Date(selected.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Footprints className="w-4 h-4 text-emerald-500" />, label: "Steps", val: (selected.steps || 0).toLocaleString(), unit: "steps" },
                  { icon: <Dumbbell className="w-4 h-4 text-purple-500" />, label: "Pushups", val: selected.pushups || 0, unit: "reps" },
                  { icon: <Droplets className="w-4 h-4 text-blue-500" />, label: "Hydration", val: selected.water || 0, unit: "glasses" },
                  { icon: <Timer className="w-4 h-4 text-orange-500" />, label: "Workout", val: selected.workout || 0, unit: "min" },
                  { icon: <Smile className="w-4 h-4 text-pink-500" />, label: "Vitality", val: selected.mood || 0, unit: "/ 5" },
                  { icon: <Moon className="w-4 h-4 text-indigo-500" />, label: "Sleep", val: selected.sleep || 0, unit: "hrs" },
                ].map((r) => (
                  <div key={r.label} className="bg-secondary/30 p-4 rounded-2xl border border-border/50 space-y-1">
                    <div className="flex items-center gap-2 opacity-60">
                        {r.icon}
                        <span className="text-[10px] font-bold uppercase tracking-wider">{r.label}</span>
                    </div>
                    <p className="text-lg font-black text-foreground">{r.val} <span className="text-[10px] font-medium text-muted-foreground">{r.unit}</span></p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-border/50 text-center">
                  <p className="text-[10px] text-muted-foreground font-medium italic">Data securely synchronized via VitalMe Cloud Intelligence</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default History;
