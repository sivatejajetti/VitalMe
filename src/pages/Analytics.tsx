import { motion } from "framer-motion";
import { useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getWeeklyAnalytics } from "@/services/api";
import { TrendingUp, TrendingDown, Target, Brain, Droplets } from "lucide-react";
import { HistoryItem } from "@/types";

const tooltipStyle = { background: "hsl(220 25% 10%)", border: "1px solid hsl(220 15% 20%)", borderRadius: 12, color: "hsl(160 100% 95%)", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)" };

const Analytics = () => {
  const [range, setRange] = useState<number>(7);
  const { data: weeklyData, isLoading } = useQuery<HistoryItem[]>({
    queryKey: ["weeklyAnalytics", range],
    queryFn: () => getWeeklyAnalytics(range),
    staleTime: 600000, // 10 minutes (App will remember charts instantly)
    gcTime: 1200000, // Keep in garbage collection for 20 mins
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse font-medium tracking-tight">Synthesizing Cloud Intelligence...</p>
      </div>
    );
  }

  const data = Array.isArray(weeklyData) ? weeklyData : [];
  const totalPushups = data.reduce((s, d) => s + (d.pushups || 0), 0);
  const totalWater = data.reduce((s, d) => s + (d.water || 0), 0);
  const avgMood = (data.reduce((s, d) => s + (d.mood || 0), 0) / (data.length || 1)).toFixed(1);

  const bestDay = data.length > 0 ? [...data].sort((a, b) => b.steps - a.steps)[0] : { day: "N/A", steps: 0 };
  const worstDay = data.length > 0 ? [...data].sort((a, b) => a.steps - b.steps)[0] : { day: "N/A", steps: 0 };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 px-4">
      {/* Header with Range Toggle */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Intelligence Report</h1>
          <p className="text-sm text-muted-foreground">Detailed health visualizations for the last {range} days.</p>
        </div>
        <div className="flex bg-secondary/50 p-1 rounded-xl border border-border self-start">
          {[7, 30].map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${range === r ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"}`}>
              {r}D
            </button>
          ))}
        </div>
      </motion.div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card-glow p-6 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-xs text-primary font-bold uppercase tracking-widest flex items-center gap-2 italic">
               Peak Performance <TrendingUp className="w-3 h-3" />
            </span>
            <p className="text-lg font-bold text-foreground">{bestDay.day} Achievement</p>
            <p className="text-3xl font-black text-foreground">{bestDay.steps.toLocaleString()} <span className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">Steps</span></p>
          </div>
          <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-primary opacity-50" />
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 flex items-center justify-between group border-l-4 border-destructive">
          <div className="space-y-1">
            <span className="text-xs text-destructive font-bold uppercase tracking-widest flex items-center gap-2 italic">
               Recovery Zone <TrendingDown className="w-3 h-3" />
            </span>
            <p className="text-lg font-bold text-foreground">{worstDay.day} Low</p>
            <p className="text-3xl font-black text-foreground">{worstDay.steps.toLocaleString()} <span className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">Steps</span></p>
          </div>
          <div className="w-16 h-16 rounded-3xl bg-destructive/10 flex items-center justify-center">
            <TrendingDown className="w-8 h-8 text-destructive opacity-50" />
          </div>
        </motion.div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Step Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border-t-4 border-primary">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Movement Velocity</h3>
            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Verified</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "hsl(220 10% 55%)", fontSize: 10, fontWeight: 700 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(220 10% 55%)", fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="steps" stroke="hsl(152 100% 62%)" strokeWidth={4} dot={{ r: 4, fill: "hsl(152 100% 62%)", strokeWidth: 2, stroke: "black" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Manual Pushup Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border-t-4 border-purple-500">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
               Pushup Dominance <Target className="w-4 h-4 text-purple-500" />
            </h3>
            <span className="text-xl font-black text-purple-500">{totalPushups} <span className="text-[10px] font-medium text-muted-foreground uppercase">Reps</span></span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "hsl(220 10% 55%)", fontSize: 10, fontWeight: 700 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="pushups" fill="hsl(280 100% 65%)" radius={[6, 6, 0, 0]} barSize={range === 7 ? 40 : 12} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Workout Minutes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border-t-4 border-orange-500">
           <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-8">Active Minutes</h3>
           <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "hsl(220 10% 55%)", fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="workout" fill="hsl(20 100% 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Mood/Mindset Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border-t-4 border-pink-500">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
               Mental State <Brain className="w-4 h-4 text-pink-500" />
            </h3>
            <span className="text-xl font-black text-pink-500">{avgMood} <span className="text-[10px] font-medium text-muted-foreground uppercase">Avg</span></span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "hsl(220 10% 55%)", fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="stepAfter" dataKey="mood" stroke="hsl(330 100% 65%)" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Summary Footer */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 rounded-3xl bg-secondary/30 border border-border flex flex-col items-center text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Droplets className="w-6 h-6 text-primary" />
        </div>
        <div className="space-y-1">
            <h4 className="text-lg font-bold text-foreground">Hydration Insight</h4>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                You've consumed a total of <strong>{totalWater} glasses</strong> of water in the last {range} days. 
                {totalWater / range > 6 ? " Your hydration levels are excellent—keep it up!" : " You're below the ideal 8-glasses/day target. Aim for higher intake tomorrow."}
            </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
