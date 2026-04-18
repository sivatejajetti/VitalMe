import { motion } from "framer-motion";
import { Footprints, Moon, HeartPulse, Flame, RefreshCw, Sparkles, Dumbbell } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import MetricCard from "@/components/MetricCard";
import { useQuery } from "@tanstack/react-query";
import { getHealthData } from "@/services/api";
import { HealthData } from "@/types";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();

  const { data: healthData, isLoading, refetch } = useQuery<HealthData>({
    queryKey: ["healthData"],
    queryFn: getHealthData,
    refetchInterval: 60000, // Sync every minute
  });

  const handleSync = async () => {
    setSyncing(true);
    await refetch();
    setSyncing(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse font-medium">Syncing health signal...</p>
      </div>
    );
  }

  if (!healthData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6 p-8">
        <div className="w-20 h-20 rounded-3xl bg-destructive/10 flex items-center justify-center">
            <HeartPulse className="w-10 h-10 text-destructive animate-pulse" />
        </div>
        <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight italic">Biometric Desync</h2>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
              We've successfully authenticated your session, but we're having trouble reaching your Google Fit stream.
            </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
            <button 
              onClick={() => handleSync()}
              className="w-full py-3 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
            >
              Force Signal Sync
            </button>
            <button 
              onClick={() => navigate("/login")}
              className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] hover:text-primary transition-colors"
            >
              Re-Verify Identity
            </button>
        </div>
      </div>
    );
  }

  const metrics = [
    { title: "Steps", value: (healthData?.steps || 0).toLocaleString(), unit: "steps", icon: <Footprints className="w-5 h-5" />, progress: Math.min(((healthData?.steps || 0) / 10000) * 100, 100) },
    { title: "Sleep", value: healthData?.sleep || 0, unit: "hrs", icon: <Moon className="w-5 h-5" />, progress: Math.min(((healthData?.sleep || 0) / 8) * 100, 100) },
    { title: "Heart Rate", value: healthData?.heart_rate || 0, unit: "bpm", icon: <HeartPulse className="w-5 h-5" />, progress: 100 },
    { title: "Calories", value: (healthData?.calories || 0).toLocaleString(), unit: "kcal", icon: <Flame className="w-5 h-5" />, progress: Math.min(((healthData?.calories || 0) / 2500) * 100, 100) },
  ];

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-6xl mx-auto pb-10 px-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none">Health Pulse 👋</h1>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] mt-1 italic">Real-time Biometric Stream</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSync}
          disabled={syncing}
          className="glass-card px-6 py-3 flex items-center gap-2 self-start sm:self-auto hover:bg-primary/5 transition-colors border border-primary/10"
        >
          <RefreshCw className={`w-4 h-4 text-primary ${syncing ? "animate-spin" : ""}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">{syncing ? "Linking..." : "Sync Pulse"}</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <MetricCard key={m.title} {...m} delay={i * 0.05} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-8 border border-white/5 bg-primary/[0.02]">
          <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-6">Activity Ledger</h3>
          <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground text-center space-y-2">
            <p className="text-xs font-bold uppercase italic opacity-20">Analyzing Movement Patterns...</p>
            <p className="text-[10px] uppercase tracking-widest font-black">Biomechanical Breakdown Incoming</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
