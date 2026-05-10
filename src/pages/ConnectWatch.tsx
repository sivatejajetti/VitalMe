import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BleClient, ScanResult } from "@capacitor-community/bluetooth-le";
import { Watch, Bluetooth, RefreshCcw, CheckCircle2, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";

const HEART_RATE_SERVICE = "0000180d-0000-1000-8000-00805f9b34fb";
const HEART_RATE_MEASUREMENT_CHARACTERISTIC = "00002a37-0000-1000-8000-00805f9b34fb";

const ConnectWatch = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<ScanResult[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);
  const [livePulse, setLivePulse] = useState<number | null>(null);

  const startPulseStream = async (deviceId: string) => {
    try {
      await BleClient.startNotifications(
        deviceId,
        HEART_RATE_SERVICE,
        HEART_RATE_MEASUREMENT_CHARACTERISTIC,
        (value) => {
          const heartRate = value.getUint8(1);
          setLivePulse(heartRate);
          
          // Real-Time Backend Sync
          fetch(`${import.meta.env.VITE_API_URL || 'https://vitalme-backend.onrender.com'}/api/health/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'heart_rate',
              value: heartRate,
              timestamp: new Date().toISOString()
            })
          }).catch(err => console.error("Sync Error:", err));
        }
      );
      toast.success("Live Pulse Stream Active! ❤️");
    } catch (error: any) {
      console.error("Pulse Stream Error:", error);
    }
  };

  const startScan = async () => {
    try {
      setIsScanning(true);
      setDevices([]);
      
      await BleClient.initialize();
      
      await BleClient.requestLEScan(
        {},
        (result) => {
          setDevices((prev) => {
            if (prev.find(d => d.device.deviceId === result.device.deviceId)) return prev;
            return [...prev, result];
          });
        }
      );

      setTimeout(async () => {
        await BleClient.stopLEScan();
        setIsScanning(false);
        if (devices.length === 0) toast.info("No devices found nearby.");
      }, 10000);

    } catch (error: any) {
      setIsScanning(false);
      toast.error("Bluetooth Scan Failed: " + error.message);
    }
  };

  const connectToDevice = async (deviceId: string, name: string) => {
    try {
      toast.loading(`Connecting to ${name || 'Watch'}...`);
      await BleClient.connect(deviceId);
      setConnectedDevice(deviceId);
      await startPulseStream(deviceId);
      toast.dismiss();
      toast.success("Watch Connected Successfully! ✨");
    } catch (error: any) {
      toast.dismiss();
      toast.error("Connection Failed: " + error.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-32">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Watch className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-foreground uppercase italic">Watch Link</h1>
        <p className="text-muted-foreground text-sm">Direct hardware synchronization for real-time biometrics.</p>
      </div>

      {/* Radar Section */}
      <div className="relative h-64 flex items-center justify-center overflow-hidden rounded-[2.5rem] bg-surface-high/20 border border-white/10">
        <AnimatePresence>
          {isScanning && (
            <>
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 2, opacity: 0.1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute w-32 h-32 bg-primary rounded-full"
              />
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 2, opacity: 0.1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="absolute w-32 h-32 bg-primary rounded-full"
              />
            </>
          )}
        </AnimatePresence>
        
        <div className="z-10 text-center">
          <Bluetooth className={`w-12 h-12 mx-auto mb-4 ${isScanning ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
          <button 
            onClick={startScan}
            disabled={isScanning}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {isScanning ? "Scanning Pulse..." : "Start Scan"}
          </button>
        </div>
      </div>

      {/* Live Data Display */}
      <AnimatePresence>
        {livePulse && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card-glow p-6 text-center border-primary/20"
          >
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2">Live Heart Rate</p>
            <div className="flex items-center justify-center gap-3">
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              >
                <Heart className="w-8 h-8 text-danger fill-danger" />
              </motion.div>
              <span className="text-5xl font-black text-foreground tracking-tighter italic">{livePulse}</span>
              <span className="text-sm font-bold text-muted-foreground uppercase self-end mb-1">BPM</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Device List */}
      <div className="space-y-3">
        <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] px-2">Nearby Hardware</h2>
        <AnimatePresence mode="popLayout">
          {devices.length === 0 && !isScanning ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 text-center glass-card border-dashed">
              <AlertCircle className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground italic">No watches detected. Ensure Bluetooth is ON.</p>
            </motion.div>
          ) : (
            devices.map((result) => (
              <motion.div
                key={result.device.deviceId}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-4 flex items-center justify-between group hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-surface-high flex items-center justify-center">
                    <Watch className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{result.device.name || "Unknown Device"}</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">{result.device.deviceId}</p>
                  </div>
                </div>
                
                {connectedDevice === result.device.deviceId ? (
                  <CheckCircle2 className="w-6 h-6 text-success" />
                ) : (
                  <button 
                    onClick={() => connectToDevice(result.device.deviceId, result.device.name || "")}
                    className="px-4 py-2 bg-surface-high rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    Connect
                  </button>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ConnectWatch;
