export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      dashboard_settings: {
        Row: {
          id: string;
          user_id: string;
          hero_title: string | null;
          hero_description: string | null;
          focus_time_today: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          hero_title?: string | null;
          hero_description?: string | null;
          focus_time_today?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          hero_title?: string | null;
          hero_description?: string | null;
          focus_time_today?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      daily_tasks: {
        Row: {
          id: string;
          user_id: string;
          task: string;
          is_completed: boolean;
          created_at: string;
          task_date: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task: string;
          is_completed?: boolean;
          created_at?: string;
          task_date: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          task?: string;
          is_completed?: boolean;
          created_at?: string;
          task_date?: string;
        };
      };
      daily_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement?: string;
          created_at?: string;
        };
      };
      airdrop_logs: {
        Row: {
          id: string;
          user_id: string;
          log: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          log: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          log?: string;
          created_at?: string;
        };
      };
      thought_logs: {
        Row: {
          id: string;
          user_id: string;
          log: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          log: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          log?: string;
          created_at?: string;
        };
      };
      thread_days: {
        Row: {
          id: string;
          user_id: string;
          day_of_week: number;
          is_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          day_of_week: number;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          day_of_week?: number;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      monthly_goals: {
        Row: {
          id: string;
          user_id: string;
          goal: string;
          month: number;
          year: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          goal: string;
          month: number;
          year: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          goal?: string;
          month?: number;
          year?: number;
          created_at?: string;
        };
      };
      monthly_goal_targets: {
        Row: {
          id: string;
          goal_id: string;
          user_id: string;
          target: string;
          is_completed: boolean;
          progress: number;
          resource_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          goal_id: string;
          user_id: string;
          target: string;
          is_completed?: boolean;
          progress?: number;
          resource_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          goal_id?: string;
          user_id?: string;
          target?: string;
          is_completed?: boolean;
          progress?: number;
          resource_url?: string | null;
          created_at?: string;
        };
      };
      task_completion_history: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          tasks_completed: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          tasks_completed: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          tasks_completed?: number;
          created_at?: string;
        };
      };
      focus_time_history: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          minutes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          minutes: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          minutes?: number;
          created_at?: string;
        };
      };
      thread_history: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          threads_completed: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          threads_completed: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          threads_completed?: number;
          created_at?: string;
        };
      };
      gym_settings: {
        Row: {
          id: string;
          user_id: string;
          last_completed_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          last_completed_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          last_completed_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      gym_workouts: {
        Row: {
          id: string;
          user_id: string;
          workout: string;
          reps: string | null;
          is_required: boolean;
          is_completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workout: string;
          reps?: string | null;
          is_required?: boolean;
          is_completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          workout?: string;
          reps?: string | null;
          is_required?: boolean;
          is_completed?: boolean;
          created_at?: string;
        };
      };
      workout_history: {
        Row: {
          id: string;
          user_id: string;
          workout_id: string;
          date: string;
          reps_completed: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workout_id: string;
          date: string;
          reps_completed?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          workout_id?: string;
          date?: string;
          reps_completed?: number | null;
          created_at?: string;
        };
      };
      data_exports: {
        Row: {
          id: string;
          user_id: string;
          file_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          file_url?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
