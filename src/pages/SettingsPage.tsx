import { motion } from "framer-motion";
import { Settings as SettingsIcon, LogOut, Moon, Sun, User, Scale, Ruler, Calendar } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/services/api";
import { UserProfile } from "@/types";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["userProfile"],
    queryFn: getUserProfile,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Syncing personal bio-data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto pb-20">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Settings</h1>
      </motion.div>

      {/* Profile Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary to-primary-container relative">
          <div className="absolute -bottom-10 left-6">
            <div className="w-24 h-24 rounded-3xl bg-surface p-1 shadow-xl">
              {profile?.picture ? (
                <img src={profile.picture} alt="Avatar" className="w-full h-full rounded-[1.25rem] object-cover" />
              ) : (
                <div className="w-full h-full rounded-[1.25rem] bg-secondary flex items-center justify-center">
                  <User className="w-10 h-10 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="pt-14 pb-8 px-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-foreground">{profile?.name || "VitalMe User"}</h2>
            <button 
              onClick={() => window.location.href = "http://localhost:3001/auth/google"}
              className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
            >
              Re-Sync Identity
            </button>
          </div>
          <p className="text-sm text-muted-foreground font-medium mb-8">Verified Digital Identity</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-3xl bg-secondary/50 flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center text-primary">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Weight</p>
                <p className="text-lg font-bold text-foreground">{profile?.weight || "—"} <span className="text-xs font-normal">kg</span></p>
              </div>
            </div>
            
            <div className="p-4 rounded-3xl bg-secondary/50 flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center text-primary">
                <Ruler className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Height</p>
                <p className="text-lg font-bold text-foreground">{profile?.height || "—"} <span className="text-xs font-normal">cm</span></p>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-secondary/50 flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center text-primary">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Age</p>
                <p className="text-lg font-bold text-foreground">{profile?.age || "—"} <span className="text-xs font-normal">yrs</span></p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-8 space-y-6">
        <h3 className="category-tag">Preferences</h3>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Interface Theme</h3>
            <p className="text-xs text-muted-foreground">Switch between dark and light mode</p>
          </div>
          <button className="premium-button">Toggle System Theme</button>
        </div>

        <div className="pt-6 border-t border-primary/5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Sync Health History</h3>
            <p className="text-xs text-muted-foreground">Force background synchronization with Google</p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-success shadow-[0_0_10px_rgba(34,197,94,0.3)]" />
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/login")}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-destructive/10 text-destructive text-sm font-bold hover:bg-destructive/20 transition-all border border-destructive/10"
        >
          <LogOut className="w-4 h-4" />
          Logout Identity
        </motion.button>
      </motion.div>

      {/* Legal Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-4 px-4">
        <h3 className="category-tag">Legal & Security</h3>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => navigate("/privacy")}
            className="p-4 rounded-2xl bg-secondary/30 border border-border/50 text-left hover:bg-secondary/50 transition-all"
          >
            <p className="text-xs font-bold text-foreground">Privacy Policy</p>
            <p className="text-[10px] text-muted-foreground">Data Handling & API Usage</p>
          </button>
          <button 
            onClick={() => navigate("/tos")}
            className="p-4 rounded-2xl bg-secondary/30 border border-border/50 text-left hover:bg-secondary/50 transition-all"
          >
            <p className="text-xs font-bold text-foreground">Terms of Service</p>
            <p className="text-[10px] text-muted-foreground">Usage Rules & Disclaimers</p>
          </button>
        </div>
        <div className="text-center pt-8 opacity-40">
           <p className="text-[10px] font-black uppercase tracking-[0.3em]">VitalMe Health Intelligence v1.0</p>
           <p className="text-[8px] mt-1 uppercase font-bold">Encrypted via RSA-4096 Cloud Standards</p>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
