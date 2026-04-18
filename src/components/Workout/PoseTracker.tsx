import React, { useEffect, useRef, useState } from "react";
import type { Pose, Results, LandmarkList } from "@mediapipe/pose";

// Define the connection list type manually as an array of index pairs
export type ConnectorList = [number, number][];

import { detectPushupRep, PushupState } from "@/services/poseDetection";
import { AlertCircle } from "lucide-react";

// Use Global MediaPipe objects to bypass Vite production bundling errors
declare global {
  interface Window {
    Pose: {
      new (config: { locateFile: (file: string) => string }): Pose;
    };
    drawConnectors: (
      ctx: CanvasRenderingContext2D,
      landmarks: LandmarkList,
      connections: ConnectorList,
      style?: { color?: string; lineWidth?: number }
    ) => void;
    drawLandmarks: (
      ctx: CanvasRenderingContext2D,
      landmarks: LandmarkList,
      style?: { color?: string; lineWidth?: number; radius?: number }
    ) => void;
    POSE_CONNECTIONS: ConnectorList;
  }
}

interface PoseTrackerProps {
  onRepUpdate: (count: number) => void;
  onDepthUpdate: (angle: number) => void;
  isActive: boolean;
  stream: MediaStream;
  onCameraError?: (error: string) => void;
}

const PoseTracker: React.FC<PoseTrackerProps> = ({ 
  onRepUpdate, 
  onDepthUpdate, 
  isActive, 
  stream, 
  onCameraError 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<Pose | null>(null);
  const repCountRef = useRef(0);
  const stateRef = useRef(PushupState.UP);
  const isActiveRef = useRef(isActive);
  const onRepUpdateRef = useRef(onRepUpdate);
  const onDepthUpdateRef = useRef(onDepthUpdate);
  const [initError, setInitError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Sync refs to parent props
  useEffect(() => {
    isActiveRef.current = isActive;
    onRepUpdateRef.current = onRepUpdate;
    onDepthUpdateRef.current = onDepthUpdate;
  }, [isActive, onRepUpdate, onDepthUpdate]);

  // Audio Feedback
  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.2;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current || !stream) return;

    const canvasCtx = canvasRef.current.getContext("2d");
    if (!canvasCtx) return;

    const onResults = (results: Results) => {
      if (!canvasRef.current || !canvasCtx || !videoRef.current) return;
      
      setIsInitializing(false);

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // Mirror and Draw Video
      canvasCtx.translate(canvasRef.current.width, 0);
      canvasCtx.scale(-1, 1);
      canvasCtx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

      if (results.poseLandmarks) {
        // Use Global Drawing Utils with proper types
        if (window.drawConnectors && window.drawLandmarks && window.POSE_CONNECTIONS) {
          window.drawConnectors(canvasCtx, results.poseLandmarks, window.POSE_CONNECTIONS, {
            color: "#0ea5e9",
            lineWidth: 4,
          });
          window.drawLandmarks(canvasCtx, results.poseLandmarks, {
            color: "#ffffff",
            lineWidth: 2,
            radius: 3,
          });
        }

        if (isActiveRef.current) {
          const { newState, isRepCompleted, currentAngle } = detectPushupRep(results, stateRef.current);
          if (newState !== stateRef.current) {
            stateRef.current = newState;
          }
          if (isRepCompleted) {
            repCountRef.current += 1;
            onRepUpdateRef.current(repCountRef.current);
            speak(repCountRef.current.toString());
          }
          onDepthUpdateRef.current(currentAngle);
        }
      }
      canvasCtx.restore();
    };

    const initEngine = async () => {
      try {
        // Wait for Global Pose to be available
        let retryCount = 0;
        while (!window.Pose && retryCount < 10) {
           await new Promise(r => setTimeout(r, 500));
           retryCount++;
        }

        if (!window.Pose) {
           throw new Error("AI Engine (Global) failed to load. Check your connection.");
        }

        const pose = new window.Pose({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        pose.onResults(onResults);
        poseRef.current = pose;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
            requestAnimationFrame(renderLoop);
          } catch (e) {
            console.error("Playback Blocked:", e);
            setInitError("Tap to enable video pulse");
          }
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "AI Pulse Desync";
        setInitError(errorMessage);
        setIsInitializing(false);
      }
    };

    const renderLoop = async () => {
      if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
        if (isInitializing && canvasCtx && canvasRef.current) {
          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          canvasCtx.translate(canvasRef.current.width, 0);
          canvasCtx.scale(-1, 1);
          canvasCtx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
          canvasCtx.restore();
        }

        if (poseRef.current) {
          try {
            await poseRef.current.send({ image: videoRef.current });
          } catch (e) {
            console.error("AI frame skip:", e);
          }
        }
        requestAnimationFrame(renderLoop);
      }
    };

    initEngine();

    return () => {
      poseRef.current?.close();
    };
  }, [stream]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden">
      {initError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-black/90 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <p className="text-white font-black uppercase tracking-widest text-xs mb-8">{initError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-10 py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20"
          >
            Reset Engine
          </button>
        </div>
      )}
      
      {isInitializing && !initError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/40 backdrop-blur-sm pointer-events-none">
           <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
           <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] animate-pulse">Syncing AI Body Pulse...</p>
        </div>
      )}

      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover opacity-0 pointer-events-none"
        playsInline
        muted
        autoPlay
      />
      
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover relative z-10"
        width={1280}
        height={720}
      />
    </div>
  );
};

export default PoseTracker;
