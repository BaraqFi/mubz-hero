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
export async function getData<T>(
  table: string,
  userId: string,
  date?: string
): Promise<T[]> {
  let query = supabase.from(table).select('*').eq('user_id', userId);

  if (date) {
    query = query.gte('created_at', `${date}T00:00:00Z`);
    query = query.lte('created_at', `${date}T23:59:59Z`);
  }

  const { data, error } = await query;

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

// Generic update by id
export async function updateById<T extends { id: string }>(
  table: string,
  id: string,
  updates: Partial<T>
): Promise<{ data: T[] | null; error: any }> {
  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq('id', id)
    .select();
  if (error) {
    console.error(`Error updating ${table} id=${id}:`, error);
  }
  return { data, error };
}

// Generic insert function
export async function insertData<T>(table: string, records: T | T[]) {
    const { data, error } = await supabase.from(table).insert(records);

    if (error) {
        console.error(`Error inserting to ${table}:`, error);
    }
    return { data, error };
}

// Generic delete by id
export async function deleteData(table: string, id: string) {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) {
    console.error(`Error deleting from ${table}:`, error);
    return { error };
  }
  return { error: null };
}

// Generic delete where helper
export async function deleteWhere(table: string, column: string, value: string | number) {
  const { error } = await supabase.from(table).delete().eq(column, value);
  if (error) {
    console.error(`Error deleting from ${table} where ${column}=${value}:`, error);
    return { error };
  }
  return { error: null };
}

// Generic delete with multiple filters
export async function deleteWhereAll(table: string, filters: Record<string, string | number | boolean>) {
  let query = supabase.from(table).delete();
  Object.entries(filters).forEach(([key, value]) => {
    // @ts-ignore - supabase query builder chaining
    query = query.eq(key, value);
  });
  const { error } = await query;
  if (error) {
    console.error(`Error deleting from ${table} with filters`, filters, error);
    return { error };
  }
  return { error: null };
}

// Generic select with filters
export async function getWhere<T>(table: string, filters: Record<string, string | number | boolean>) {
  let query = supabase.from(table).select('*');
  Object.entries(filters).forEach(([key, value]) => {
    // @ts-ignore - supabase query builder chaining
    query = query.eq(key, value);
  });
  const { data, error } = await query;
  if (error) {
    console.error(`Error fetching from ${table} with filters`, filters, error);
    return [] as T[];
  }
  return data as T[];
}
