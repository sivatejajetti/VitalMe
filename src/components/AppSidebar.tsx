import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, BarChart3, Brain, Target,
  MessageCircle, Trophy, Calendar, Heart, Settings, X,
  CheckSquare, UserRound
} from "lucide-react";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/chat", label: "AI Coach", icon: MessageCircle },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/achievements", label: "Achievements", icon: Trophy },
  { to: "/score", label: "Health Score", icon: Heart },
  { to: "/workout", label: "AI Trainer", icon: Brain },
  { to: "/profile", label: "My Profile", icon: UserRound },
  { to: "/settings", label: "Settings", icon: Settings },
];

interface Props { open: boolean; onClose: () => void }

const AppSidebar = ({ open, onClose }: Props) => {
  const { pathname } = useLocation();

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-background/60 z-40 lg:hidden" onClick={onClose} />
      )}
      <motion.aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-background/80 backdrop-blur-3xl flex flex-col
          lg:translate-x-0 lg:static lg:z-auto transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]
          ${open ? "translate-x-0 shadow-[20px_0_40px_rgba(0,0,0,0.05)]" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-foreground">VitalMe</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 rounded-xl hover:bg-surface-high transition-colors text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto scrollbar-none">
          {links.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300
                  ${active
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                  }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${active ? "text-primary-foreground" : ""}`} />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>
        
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-3xl bg-primary/5 border border-primary/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Health Score</p>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-foreground">78</span>
              <span className="text-xs text-success font-medium">+2% since last week</span>
            </div>
          </div>

          <div className="px-2 text-center">
            <p className="text-[10px] text-muted-foreground/60 font-medium tracking-tight">
              Crafted with Excellence by
            </p>
            <p className="text-xs font-bold text-foreground mt-0.5">Teja Jetti</p>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default AppSidebar;
