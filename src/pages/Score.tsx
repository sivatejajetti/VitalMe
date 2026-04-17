import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const score = 78;
const breakdown = [
  { label: "Steps", score: 84, color: "hsl(152 100% 62%)" },
  { label: "Sleep", score: 72, color: "hsl(210 100% 60%)" },
  { label: "Heart Rate", score: 90, color: "hsl(0 72% 51%)" },
];

const getColor = (s: number) => (s >= 75 ? "text-success" : s >= 50 ? "text-warning" : "text-destructive");

const Score = () => {
  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (score / 100) * circumference;

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
        <p className="text-sm text-muted-foreground mt-4">Your overall health score is <span className={`font-semibold ${getColor(score)}`}>Good</span></p>
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
