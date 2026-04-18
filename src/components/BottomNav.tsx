import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, CheckSquare, Target, User, Brain, MessageCircle, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const BottomNav = () => {
  const { pathname } = useLocation();
  
  const tabs = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Home" },
    { to: "/chat", icon: MessageCircle, label: "AI Coach" },
    { to: "/tasks", icon: CheckSquare, label: "Tasks" },
    { to: "/workout", icon: Brain, label: "Trainer" },
    { to: "/settings", icon: User, label: "Profile" },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-2 pointer-events-none">
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="glass-card flex items-center justify-around p-3 pointer-events-auto shadow-2xl shadow-primary/10 border border-white/20"
      >
        {tabs.map(({ to, icon: Icon, label }) => {
          const active = pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 relative
                ${active ? "text-primary" : "text-muted-foreground"}`}
            >
              {active && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-2xl -z-10"
                  transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                />
              )}
              <Icon className={`w-5 h-5 ${active ? "fill-primary/20" : ""}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            </NavLink>
          );
        })}
      </motion.div>
    </nav>
  );
};

export default BottomNav;
