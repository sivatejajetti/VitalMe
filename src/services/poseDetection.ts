import { Pose, Results } from "@mediapipe/pose";

export type Landmark = {
  x: number;
  y: number;
  z: number;
  visibility?: number;
};

export const calculateAngle = (p1: Landmark, p2: Landmark, p3: Landmark): number => {
  const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  return angle;
};

export const createPoseDetector = (onResults: (results: Results) => void) => {
  const pose = new Pose({
    locateFile: (file) => {
      // Use exact version from package.json for production stability
      return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`;
    },
  });

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  pose.onResults(onResults);

  return pose;
};

// Pushup Specific Logic
export enum PushupState {
  UP = "UP",
  DOWN = "DOWN",
}

export const detectPushupRep = (
  results: Results,
  currentState: PushupState
): { newState: PushupState; isRepCompleted: boolean; currentAngle: number } => {
  const landmarks = results.poseLandmarks;
  if (!landmarks || landmarks.length < 16) {
    return { newState: currentState, isRepCompleted: false, currentAngle: 0 };
  }

  // Use left side (11: shoulder, 13: elbow, 15: wrist)
  // In profile view, one side is usually more visible
  const shoulder = landmarks[11];
  const elbow = landmarks[13];
  const wrist = landmarks[15];

  // Visibility check
  if ((shoulder.visibility || 0) < 0.5 || (elbow.visibility || 0) < 0.5 || (wrist.visibility || 0) < 0.5) {
      // Fallback to right side
      const rShoulder = landmarks[12];
      const rElbow = landmarks[14];
      const rWrist = landmarks[16];
      if ((rShoulder.visibility || 0) > 0.5) {
          const angle = calculateAngle(rShoulder, rElbow, rWrist);
          return processState(angle, currentState);
      }
      return { newState: currentState, isRepCompleted: false, currentAngle: 0 };
  }

  const angle = calculateAngle(shoulder, elbow, wrist);
  return processState(angle, currentState);
};

const processState = (angle: number, currentState: PushupState) => {
  let newState = currentState;
  let isRepCompleted = false;

  // Logic: 
  // DOWN: Angle < 95
  // UP: Angle > 160
  if (angle < 95 && currentState === PushupState.UP) {
    newState = PushupState.DOWN;
  } else if (angle > 160 && currentState === PushupState.DOWN) {
    newState = PushupState.UP;
    isRepCompleted = true;
  }

  return { newState, isRepCompleted, currentAngle: angle };
};
