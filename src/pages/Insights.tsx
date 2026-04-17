import { motion } from "framer-motion";
import { Brain, TrendingDown, TrendingUp, AlertCircle, CheckCircle, Info } from "lucide-react";
const aiInsights: { type: "info" | "warning" | "success"; title: string; text: string }[] = [
  { type: "success", title: "Sleep Recovery", text: "Your deep sleep increased by 15% this week. Great recovery!" },
  { type: "info", title: "Cardio Trend", text: "Your resting heart rate is trending down. Your cardio is effective." },
  { type: "warning", title: "Hydration Needed", text: "High activity detected with low water tracking. Drink more water." },
];

const typeConfig = {
  warning: { icon: AlertCircle, borderClass: "border-l-4 border-l-warning" },
  success: { icon: CheckCircle, borderClass: "border-l-4 border-l-success" },
  info: { icon: Info, borderClass: "border-l-4 border-l-info" },
};

const Insights = () => (
  <div className="space-y-6 max-w-4xl mx-auto">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
      <Brain className="w-6 h-6 text-primary" />
      <h1 className="text-2xl font-bold text-foreground">AI Insights</h1>
    </motion.div>

    <div className="space-y-4">
      {aiInsights.map((insight, i) => {
        const { icon: Icon, borderClass } = typeConfig[insight.type];
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12 }}
            className={`glass-card-glow p-5 ${borderClass}`}
          >
            <div className="flex items-start gap-3">
              <Icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{insight.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{insight.text}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>

    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-5">
      <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" /> Recommendations
      </h3>
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li>• Add a 20-min evening walk to hit your step goal consistently</li>
        <li>• Keep your bedtime between 10–11 PM for optimal sleep quality</li>
        <li>• Consider adding a mid-morning snack to meet your calorie target</li>
        <li>• Your resting heart rate is great — keep up regular cardio</li>
      </ul>
    </motion.div>
  </div>
);

export default Insights;
