import { motion } from "framer-motion";
import { Scale, AlertTriangle, UserCheck, FileText, ArrowLeft, ShieldCheck } from "lucide-react";

const TermsOfService = () => {
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
            <Scale className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl font-black text-foreground uppercase tracking-tighter italic">Terms of Service</h1>
          <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">VitalMe Health Intelligence — Edition 2024.1</p>
        </motion.div>

        <div className="space-y-12 text-muted-foreground">
          <section className="space-y-6">
            <h2 className="text-xs font-black text-foreground uppercase tracking-[0.3em] flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive" /> Emergency Disclosure
            </h2>
            <div className="p-8 bg-destructive/[0.03] border border-destructive/10 rounded-3xl space-y-4">
              <p className="text-sm font-black text-foreground uppercase italic tracking-tight">VitalMe is NOT a Medical Application</p>
              <p className="text-xs font-medium leading-relaxed">
                VitalMe provides information and visualizations derived from your third-party health providers (Google Fit). All metrics, health scores, and analytics are for informational and entertainment purposes only. They do not constitute medical advice. Never ignore professional medical advice because of something you have read on this dashboard. **In case of a medical emergency, call your local emergency services immediately.**
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-black text-foreground uppercase tracking-[0.3em] flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-primary" /> 01. User Authentication
            </h2>
            <p className="text-sm font-medium">
              By using VitalMe, you authenticate via Google OAuth. You are responsible for maintaining the security of your Google account credentials. VitalMe never sees or stores your Google password. 
            </p>
          </section>

          <section className="space-y-4 p-8 bg-primary/[0.03] border border-primary/10 rounded-3xl text-sm font-medium">
            <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3">
              <ShieldCheck className="w-5 h-5" /> Google API Disclosure
            </h2>
            <p className="italic">
              Users agree that VitalMe’s use of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements. Users may revoke access to their data via the Google Security Settings page at any time.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-black text-foreground uppercase tracking-[0.3em] flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" /> 02. Service Eligibility
            </h2>
            <p className="text-sm font-medium">
              You must be at least 18 years of age to use VitalMe. We provide the platform on an "As-Is" basis. While we strive for excellence in data accuracy and 99.9% uptime, we are not liable for any data discrepancies reflected from Google Fit or manual user errors.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-black text-foreground uppercase tracking-[0.3em] flex items-center gap-3">
              <Scale className="w-5 h-5 text-primary" /> 03. Global Governing Law
            </h2>
            <p className="text-sm font-medium">
              These terms shall be governed by the laws of India (your region). Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts located in your primary place of residence.
            </p>
          </section>
          <section className="space-y-4">
            <h2 className="text-xs font-black text-foreground uppercase tracking-[0.3em] flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" /> 04. Support Inquiry
            </h2>
            <p className="text-sm font-medium">
              For any questions regarding these terms or to report an issue with the Service, please contact us at **lova0443@gmail.com**.
            </p>
          </section>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-12 border-t border-border/50 text-center">
            <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-[0.5em]">VitalMe — Pursue Excellence Responsibly</p>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;
