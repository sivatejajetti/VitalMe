import { Menu, Bell, User } from "lucide-react";
import { ModeToggle } from "./mode-toggle";

interface Props { onMenuClick: () => void }

const TopNavbar = ({ onMenuClick }: Props) => (
  <header className="h-16 bg-background/60 backdrop-blur-2xl flex items-center justify-between px-6 sticky top-0 z-30 transition-all">
    <div className="flex items-center gap-4">
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl bg-surface-high hover:bg-primary/10 hover:text-primary transition-all text-muted-foreground">
        <Menu className="w-5 h-5" />
      </button>
      <div className="hidden lg:block">
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Intelligence Center</p>
        <p className="text-xs font-bold text-foreground">Operational Excellence</p>
      </div>
    </div>
    
    <div className="flex items-center gap-4">
      <ModeToggle />
      <button className="w-10 h-10 rounded-2xl bg-surface-high flex items-center justify-center relative text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all group">
        <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full ring-2 ring-background ring-offset-0" />
      </button>
      <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
        <User className="w-5 h-5 text-primary-foreground" />
      </div>
    </div>
  </header>
);

export default TopNavbar;
