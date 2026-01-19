export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export interface Student {
  id?: string;
  name: string;
  class_name: string;
  total_score: number;
  completed: boolean;
}

export interface GameRecord {
  student_id: string;
  level_number: number;
  is_correct: boolean;
  attempts: number;
  time_spent: number; // seconds
  hints_used: number;
  score: number;
}

export interface WrongAnswer {
  student_id: string;
  level_number: number;
  target_value: HSL;
  student_answer: HSL;
}

export interface Artwork {
  id?: string;
  student_id: string;
  student_name?: string; // Joined view
  class_name?: string;   // Joined view
  image_data: string;
  color_settings: Record<string, HSL>;
  created_at?: string;
}

export enum GameStage {
  WELCOME = 'WELCOME',
  STORY_INTRO = 'STORY_INTRO',
  LEVEL_1 = 'LEVEL_1', // Hue
  LEVEL_2 = 'LEVEL_2', // Value
  LEVEL_3 = 'LEVEL_3', // Saturation
  LEVEL_4 = 'LEVEL_4', // Combined
  LEVEL_5 = 'LEVEL_5', // Creative
  GAME_OVER = 'GAME_OVER',
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD'
}
