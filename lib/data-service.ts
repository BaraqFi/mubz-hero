import { createClient } from './supabase/client';
import { Database } from '@/types/supabase';

export type DailyTask = Database['public']['Tables']['daily_tasks']['Row'];
export type DailyAchievement = Database['public']['Tables']['daily_achievements']['Row'];
export type AirdropLog = Database['public']['Tables']['airdrop_logs']['Row'];
export type ThoughtLog = Database['public']['Tables']['thought_logs']['Row'];
export type ThreadDay = Database['public']['Tables']['thread_days']['Row'];
export type MonthlyGoal = Database['public']['Tables']['monthly_goals']['Row'];
export type MonthlyGoalTarget = Database['public']['Tables']['monthly_goal_targets']['Row'];
export type TaskCompletionHistory = Database['public']['Tables']['task_completion_history']['Row'];
export type FocusTimeHistory = Database['public']['Tables']['focus_time_history']['Row'];
export type ThreadHistory = Database['public']['Tables']['thread_history']['Row'];
export type GymSettings = Database['public']['Tables']['gym_settings']['Row'];
export type GymWorkout = Database['public']['Tables']['gym_workouts']['Row'];
export type WorkoutHistory = Database['public']['Tables']['workout_history']['Row'];
export type DataExport = Database['public']['Tables']['data_exports']['Row'];
export type DashboardSettings = Database['public']['Tables']['dashboard_settings']['Row'];


const supabase = createClient();

// Generic get function
export async function getData<T>(table: string, userId: string): Promise<T[]> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error(`Error fetching from ${table}:`, error);
    return [];
  }
  return data as T[];
}

// Generic upsert function
export async function upsertData<T>(table: string, records: T | T[]) {
  const { data, error } = await supabase.from(table).upsert(records);

  if (error) {
    console.error(`Error upserting to ${table}:`, error);
  }
  return data;
}

// Generic insert function
export async function insertData<T>(table: string, records: T | T[]) {
    const { data, error } = await supabase.from(table).insert(records);

    if (error) {
        console.error(`Error inserting to ${table}:`, error);
    }
    return { data, error };
}
