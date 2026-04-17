import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card-glow p-8 md:p-12 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-3 mb-4"
        >
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Heart className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">VitalMe</h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground mb-8"
        >
          Your AI-powered health intelligence system
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.location.href = `${API_URL}/auth/google`}
          className="w-full py-3 px-6 rounded-lg bg-primary text-primary-foreground font-semibold text-sm
            hover:brightness-110 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Login with Google
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="mt-12 pt-8 border-t border-white/10"
        >
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-[10px] font-black uppercase tracking-[0.2em]">
              <a 
                href="/privacy"
                className="text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-8"
              >
                Privacy Policy
              </a>
              <div className="w-1 h-1 rounded-full bg-primary/20" />
              <a 
                href="/tos"
                className="text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-8"
              >
                Terms of Service
              </a>
              <div className="w-1 h-1 rounded-full bg-primary/20" />
              <a 
                href="mailto:lova0443@gmail.com"
                className="text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-8"
              >
                Support: lova0443@gmail.com
              </a>
            </div>
            
            <div className="flex flex-col items-center gap-1.5 opacity-60">
              <p className="text-[8px] text-muted-foreground uppercase tracking-[0.3em] font-black italic">Crafted for Excellence By</p>
              <p className="text-xs font-black text-foreground/80 lowercase tracking-tight">Teja Jetti</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
