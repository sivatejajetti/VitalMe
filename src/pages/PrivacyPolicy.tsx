import { motion } from "framer-motion";
import { Shield, Lock, Eye, Server, ArrowLeft, Mail, Globe } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background py-12 px-6 pb-24 selection:bg-primary/20 selection:text-primary leading-relaxed">
      <div className="max-w-3xl mx-auto space-y-12">
        <button 
          onClick={() => window.history.back()} 
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Pulse
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center shadow-xl shadow-primary/5">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl font-black text-foreground uppercase tracking-tighter italic">Privacy Disclosure</h1>
          <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">VitalMe Health Intelligence — Edition 2024.1</p>
        </motion.div>

        <div className="space-y-12 text-muted-foreground">
          <section className="space-y-4">
            <h2 className="text-xs font-black text-foreground uppercase tracking-[0.3em] flex items-center gap-3">
              <Lock className="w-5 h-5 text-primary" /> 01. The Mission
            </h2>
            <p className="text-sm font-medium">
              VitalMe is a private health intelligence dashboard. Our mission is to provide you with elite-level biometric visualization. To achieve this, we process your health data with a "Privacy-First" architecture. 
            </p>
          </section>

          <section className="space-y-4 p-8 bg-primary/[0.03] border border-primary/10 rounded-3xl">
            <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3">
              <Globe className="w-5 h-5" /> Google Limited Use Policy
            </h2>
            <p className="text-sm font-medium italic">
              VitalMe's use and transfer to any other app of information received from Google APIs will adhere to the 
              <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-primary underline ml-1">Google API Services User Data Policy</a>, 
              including the Limited Use requirements. We do not use Google user data to serve advertisements or train AI models.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-black text-foreground uppercase tracking-[0.3em] flex items-center gap-3">
              <Eye className="w-5 h-5 text-primary" /> 02. Data Acquisition
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-secondary/50 border border-border">
                    <p className="text-[10px] font-black text-foreground uppercase mb-2">Google Fit Sync</p>
                    <p className="text-xs leading-relaxed">We access Steps, Sleep, Heart Rate, and Calories to generate your Health Pulse. This data is mirrored, never sold.</p>
                </div>
                <div className="p-4 rounded-2xl bg-secondary/50 border border-border">
                    <p className="text-[10px] font-black text-foreground uppercase mb-2">Personal Logs</p>
                    <p className="text-xs leading-relaxed">Manual logs (Water, Pushups) are stored in your encrypted Supabase vault, accessible only by your identity.</p>
                </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-black text-foreground uppercase tracking-[0.3em] flex items-center gap-3">
              <Server className="w-5 h-5 text-primary" /> 03. Infrastructure
            </h2>
            <p className="text-sm font-medium">
              VitalMe utilizes **Supabase (PostgreSQL)** for secure cloud storage and **Vercel** for frontend delivery. All data transfers are encrypted via SSL/TLS. We utilize the "Warp-Cache" system to minimize data retention of raw Google biometrics.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-black text-foreground uppercase tracking-[0.3em] flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary" /> 04. Data Sovereignty
            </h2>
            <p className="text-sm font-medium">
              You own your data. You may revoke access at any time via your Google Account Security settings. To request a full deletion of your VitalMe account and all cached summaries, please contact us at **lova0443@gmail.com**.
            </p>
          </section>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-12 border-t border-border/50 text-center">
            <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-[0.5em]">VitalMe — Pursue Excellence</p>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
