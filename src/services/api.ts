import axios from 'axios';
import { Task, UserProfile, HistoryItem, HealthScore, HealthData, ChatMessage } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial for session sessions
});

export const getAuthStatus = async () => {
  const { data } = await api.get('/auth/status');
  return data;
};

export const getHealthData = async (): Promise<HealthData> => {
  const { data } = await api.get('/api/health/all');
  return data;
};

export const getHealthScore = async (): Promise<HealthScore> => {
  const { data } = await api.get('/api/score');
  return data;
};

export const getWeeklyAnalytics = async (days: number = 7): Promise<HistoryItem[]> => {
  const { data } = await api.get(`/api/analytics/history?days=${days}`);
  return data;
};

export const getHistoryData = async (): Promise<HistoryItem[]> => {
  const { data } = await api.get('/api/history');
  return data;
};

export const getUserProfile = async (): Promise<UserProfile> => {
  const { data } = await api.get('/api/user/profile');
  return data;
};

export const updateUserProfile = async (profileData: Partial<UserProfile>) => {
  const { data } = await api.post('/api/user/profile', profileData);
  return data;
};

// Task management APIs
export const getTasks = async (): Promise<Task[]> => {
  const { data } = await api.get('/api/tasks');
  return data;
};

export const syncTasks = async (tasks: Task[]) => {
  const { data } = await api.post('/api/tasks/sync', { tasks });
  return data;
};

// Activity Logs (Pushups, Water, etc.)
export const logActivity = async (type: string, value: number) => {
  const { data } = await api.post('/api/logs', { type, value });
  return data;
};

export const sendChatMessage = async (message: string, healthData: HealthData | null, history: ChatMessage[]) => {
  const { data } = await api.post('/api/chat', { message, healthData, history });
  return data;
};

export const getTodayLogs = async () => {
  const { data } = await api.get('/api/logs/today');
  return data;
};

export const getTodayActivity = async (type: string): Promise<number> => {
  const { data } = await api.get(`/api/logs/today/${type}`);
  return data.value;
};

export const deleteTask = async (id: string) => {
  const { data } = await api.delete(`/api/tasks/${id}`);
  return data;
};

export default api;
