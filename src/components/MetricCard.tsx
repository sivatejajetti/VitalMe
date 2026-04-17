import { motion } from "framer-motion";
import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: ReactNode;
  progress: number;
  color?: string;
  delay?: number;
}

const MetricCard = ({ title, value, unit, icon, progress, delay = 0 }: MetricCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="glass-card p-6 min-h-[160px] flex flex-col justify-between"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex flex-col">
        <span className="category-tag">{title}</span>
        <div className="flex items-baseline gap-1">
          <span className="metric-value">{value}</span>
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">{unit}</span>
        </div>
      </div>
      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
    </div>
    
    <div className="space-y-2">
      <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ delay: delay + 0.3, duration: 1, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-muted-foreground font-medium lowercase">Progress</span>
        <span className="text-[10px] text-primary font-bold">{Math.round(progress)}%</span>
      </div>
    </div>
  </motion.div>
);

export default MetricCard;
