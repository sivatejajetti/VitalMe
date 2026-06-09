import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getHealthScore } from "@/services/api";
import { HealthScore } from "@/types";

const getColor = (s: number) => (s >= 75 ? "text-success" : s >= 50 ? "text-warning" : "text-destructive");

const getStatusText = (s: number) => {
  if (s >= 90) return "Excellent";
  if (s >= 75) return "Good";
  if (s >= 50) return "Fair";
  return "Critical";
};

const Score = () => {
  const { data, isLoading, error } = useQuery<HealthScore>({
    queryKey: ["healthScore"],
    queryFn: getHealthScore,
    refetchInterval: 60000, // Refetch every minute
  });

  const circumference = 2 * Math.PI * 80;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Calculating your biometric health score...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-4">
        <p className="text-destructive font-semibold mb-2">Failed to retrieve health score</p>
        <p className="text-xs text-muted-foreground">Please ensure your Google Fit account is linked and active.</p>
      </div>
    );
  }

  const score = data.score;
  const offset = circumference - (score / 100) * circumference;

  const breakdown = [
    { label: "Steps", score: data.breakdown.steps, color: "hsl(152 100% 62%)" },
    { label: "Sleep", score: data.breakdown.sleep, color: "hsl(210 100% 60%)" },
    { label: "Heart Rate", score: data.breakdown.heartRate, color: "hsl(0 72% 51%)" },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
        <Heart className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Health Score</h1>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card-glow p-8 flex flex-col items-center">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
            <circle cx="90" cy="90" r="80" stroke="hsl(220 15% 18%)" strokeWidth="10" fill="none" />
            <motion.circle
              cx="90" cy="90" r="80" stroke="hsl(152 100% 62%)" strokeWidth="10" fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className={`text-4xl font-bold ${getColor(score)}`}
            >
              {score}
            </motion.span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-4">Your overall health score is <span className={`font-semibold ${getColor(score)}`}>{getStatusText(score)}</span></p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {breakdown.map((b, i) => (
          <motion.div key={b.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="glass-card p-5 text-center">
            <h3 className="text-xs text-muted-foreground font-medium mb-2">{b.label}</h3>
            <span className={`text-2xl font-bold ${getColor(b.score)}`}>{b.score}</span>
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden mt-3">
              <motion.div className="h-full rounded-full" style={{ background: b.color }} initial={{ width: 0 }} animate={{ width: `${b.score}%` }} transition={{ delay: 0.5, duration: 0.8 }} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Score;
