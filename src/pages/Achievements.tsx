import { motion } from "framer-motion";
import { Trophy, Lock, Loader2, Sparkles, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const Achievements = () => {
  const { data: achievements, isLoading } = useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/achievements`, { 
        withCredentials: true 
      });
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse font-medium">Analyzing your legendary history...</p>
      </div>
    );
  }

  const data = Array.isArray(achievements) ? achievements : [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Hall of Fame</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest italic">Elite Collection (Last 30 Days)</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`glass-card p-6 flex flex-col items-center text-center relative overflow-hidden transition-all duration-500 ${
              a.achieved ? "glass-card-glow ring-2 ring-primary/20" : "opacity-30 grayscale"
            }`}
          >
            {/* Collected Badge */}
            {a.collected > 0 && (
              <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                <Award className="w-3 h-3" /> x {a.collected}
              </div>
            )}

            {/* Icon Circle */}
            <div className={`w-20 h-20 rounded-3xl mb-4 flex items-center justify-center text-5xl transition-transform duration-500 ${
              a.achieved ? "scale-110 rotate-3 shadow-2xl bg-primary/10" : "bg-secondary"
            }`}>
              {a.icon}
            </div>

            <div className="space-y-2 mb-6">
              <h3 className="font-black text-lg text-foreground uppercase tracking-tight italic">{a.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed px-4">{a.description}</p>
            </div>

            {/* Achievement Bar */}
            <div className="w-full h-1.5 rounded-full bg-secondary mb-4 overflow-hidden">
                <motion.div
                   initial={{ width: 0 }}
                   animate={{ width: `${a.progress}%` }}
                   className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                />
            </div>

            {/* Status Badge */}
            <div className={`w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${
              a.achieved ? "bg-primary text-primary-foreground shadow-lg" : "bg-secondary text-muted-foreground"
            }`}>
              {a.achieved ? `${a.collected} Times Conquered` : `Locked (Highest: ${a.progress}%)`}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Persistence Note */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
              <div className="h-px w-8 bg-border" />
              <p className="text-[10px] text-primary font-bold uppercase tracking-[0.3em]">The Elite Domain</p>
              <div className="h-px w-8 bg-border" />
          </div>
          <p className="text-[10px] text-muted-foreground max-w-xs mx-auto italic">Achievements are quantified results of your peak physical performance over the last 30 daily cycles.</p>
      </motion.div>
    </div>
  );
};

export default Achievements;
