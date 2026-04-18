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
  height?: number;
  weight?: number;
  age?: number;
  gender?: string;
  goal?: string;
}

export interface HistoryItem {
  date: string;
  day: string;
  steps: number;
  pushups: number;
  water: number;
  workout: number;
  mood: number;
  sleep: number;
  calories?: number;
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

export interface HealthData {
  steps: number;
  calories: number;
  heart_rate: number;
  sleep: number;
  active_minutes: number;
}
