// Global Type Ledger for VitalMe

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  type: "habit" | "todo";
  streak?: number;
}

export interface UserProfile {
  name: string;
  display_name?: string;
  email: string;
  picture?: string;
  /** Height in centimeters (cm) */
  height?: number;
  /** Weight in kilograms (kg) */
  weight?: number;
  /** Age in years */
  age?: number;
  gender?: string;
  goal?: string;
}

export interface HistoryItem {
  /** ISO 8601 formatted date string (e.g., YYYY-MM-DD) */
  date: string;
  day: string;
  /** Total step count for the day */
  steps: number;
  /** Total pushup repetitions recorded */
  pushups: number;
  /** Water intake in milliliters (ml) */
  water: number;
  /** Total physical activity in minutes */
  workout: number;
  /** Mood index on a scale of 1-5 */
  mood: number;
  /** Sleep duration in hours (decimal allowed) */
  sleep: number;
  /** Energy expenditure in kilocalories (kcal) */
  calories?: number;
  /** Average heart rate in beats per minute (bpm) */
  heart_rate?: number;
}

export interface HealthScore {
  score: number;
  status: "Excellent" | "Good" | "Fair" | "Critical";
  breakdown: {
    activity: number;
    consistency: number;
    vitality: number;
  };
}

/** Real-time health metrics synchronized from Google Fit */
export interface HealthData {
  /** Total steps recorded (count) */
  steps: number;
  /** Energy expenditure in kilocalories (kcal) */
  calories: number;
  /** Instantaneous heart rate in beats per minute (bpm) */
  heart_rate: number;
  /** Sleep duration in hours */
  sleep: number;
  /** Physical activity duration in minutes */
  active_minutes: number;
}
