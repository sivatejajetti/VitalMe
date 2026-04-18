import { Camera, ChevronLeft, Play, Square, Settings as SettingsIcon, Info, HeartPulse } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PoseTracker from "@/components/Workout/PoseTracker";
import { logActivity } from "@/services/api";
import { toast } from "sonner";

const Workout = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [reps, setReps] = useState(0);
  const [depth, setDepth] = useState(180); // Angle
  const [isFinishing, setIsFinishing] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const handleStart = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      setCameraStream(stream);
      setCountdown(5);
      setReps(0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Camera synchronization failed";
      toast.error("Camera access failed: " + message);
    }
  };

  const handleFinish = async () => {
    if (reps === 0) {
      setIsActive(false);
      return;
    }

    setIsFinishing(true);
    try {
      await logActivity("pushups", reps);
      toast.success(`Workout Saved! ${reps} Reps logged.`);
      setIsActive(false);
    } catch (err) {
      toast.error("Failed to sync workout results.");
    } finally {
      setIsFinishing(false);
    }
  };

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCountdown(null);
      setIsActive(true);
    }
  }, [countdown]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 flex items-center justify-between z-20">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-surface-high hover:bg-primary/10 transition-all text-muted-foreground"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold uppercase tracking-widest text-primary italic">AI Trainer</h1>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em]">Pushup Intelligence</p>
        </div>
        <button className="p-2 rounded-xl bg-surface-high hover:bg-primary/10 transition-all text-muted-foreground">
          <SettingsIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative mx-4 mb-24 rounded-[2rem] overflow-hidden bg-black shadow-2xl shadow-primary/5 border border-primary/10 group">
        {!isActive && !countdown && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm transition-all group-hover:bg-black/20">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6 animate-pulse">
              <Camera className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-black uppercase italic text-white mb-2 leading-none">Ready for Greatness?</h2>
            <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-8">Place phone 4-5 feet away on the floor</p>
            <button 
              onClick={handleStart}
              className="px-10 py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
              <Play className="w-5 h-5 fill-current" />
              Start Session
            </button>
          </div>
        )}

        <AnimatePresence>
          {countdown !== null && (
            <motion.div 
              initial={{ opacity: 0, scale: 1.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md"
            >
              <span className="text-[10rem] font-black italic text-primary drop-shadow-[0_0_40px_rgba(var(--primary),0.5)]">
                {countdown}
              </span>
              <p className="text-primary font-black uppercase tracking-[0.5em] mt-8 animate-pulse italic">Get in Position</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Camera Feed */}
        <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center overflow-hidden">
           {cameraStream && (
             <PoseTracker 
                onRepUpdate={(count) => setReps(count)}
                onDepthUpdate={(angle) => setDepth(angle)}
                isActive={isActive}
                stream={cameraStream}
             />
           )}
           <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full backdrop-blur-md z-10">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                <Info className="w-3 h-3" /> System Calibrated: Wide Profile View
              </p>
           </div>
        </div>

        {/* Depth Meter Overlay */}
        {isActive && (
          <div className="absolute left-8 top-1/2 -translate-y-1/2 h-48 w-2 bg-white/10 rounded-full overflow-hidden z-10">
             <motion.div 
               className="absolute bottom-0 w-full bg-primary shadow-[0_0_20px_rgba(var(--primary),0.5)]"
               animate={{ height: `${Math.max(0, Math.min(100, ((180 - depth) / 90) * 100))}%` }}
               transition={{ type: "spring", stiffness: 300, damping: 30 }}
             />
             <div className="absolute -right-8 top-0 h-full flex flex-col justify-between py-1 text-[8px] font-black text-white/40 uppercase">
                <span>Start</span>
                <span>Max</span>
             </div>
          </div>
        )}

        {/* Stats Overlay */}
        {isActive && (
           <div className="absolute top-8 right-8 z-20 flex flex-col gap-4">
              <div className="glass-card p-4 flex flex-col items-center min-w-[100px] border-primary/20 bg-black/40">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Reps</span>
                <span className="text-4xl font-black text-white italic leading-none">{reps}</span>
              </div>
              <button 
                onClick={handleFinish}
                disabled={isFinishing}
                className="w-full py-4 bg-destructive text-destructive-foreground rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-destructive/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isFinishing ? (
                   <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Square className="w-4 h-4 fill-current" />
                    Finish
                  </>
                )}
              </button>
           </div>
        )}
      </div>

      {/* Footer Instructions */}
      <div className="px-8 pb-8">
        <div className="glass-card p-4 flex items-center gap-4 border-white/5 bg-white/[0.02]">
           <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5 text-orange-500" />
           </div>
           <div>
              <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Pro Tip</p>
              <p className="text-[10px] text-muted-foreground uppercase leading-relaxed font-medium">Keep your chest parallel to the floor for perfect rep detection.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Workout;
