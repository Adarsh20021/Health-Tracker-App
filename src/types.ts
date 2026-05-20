export interface User {
  id: string;
  name: string;
  email: string;
}

export interface DailyLog {
  _id?: string;
  userId: string;
  date: string; // YYYY-MM-DD
  calories: number;
  water: number; // Liters
  steps: number;
  sleepHours: number;
}

export interface SummaryStats {
  totalCalories: number;
  totalWater: number;
  totalSteps: number;
  averageSleep: number;
}
