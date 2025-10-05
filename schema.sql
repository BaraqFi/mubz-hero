-- Create dashboard_settings table
CREATE TABLE dashboard_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  hero_title TEXT,
  hero_description TEXT,
  focus_time_today INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE dashboard_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can manage their own dashboard settings" ON dashboard_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create daily_tasks table
CREATE TABLE daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can manage their own daily tasks" ON daily_tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create daily_achievements table
CREATE TABLE daily_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE daily_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can manage their own daily achievements" ON daily_achievements FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create airdrop_logs table
CREATE TABLE airdrop_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE airdrop_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can manage their own airdrop logs" ON airdrop_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create thought_logs table
CREATE TABLE thought_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE thought_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can manage their own thought logs" ON thought_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create thread_days table
CREATE TABLE thread_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_of_week INT NOT NULL, -- 0 for Sunday, 6 for Saturday
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, day_of_week)
);
ALTER TABLE thread_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can manage their own thread days" ON thread_days FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create monthly_goals table
CREATE TABLE monthly_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal TEXT NOT NULL,
  month INT NOT NULL, -- 1 for January, 12 for December
  year INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE monthly_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can manage their own monthly goals" ON monthly_goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create monthly_goal_targets table
CREATE TABLE monthly_goal_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES monthly_goals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  progress INT DEFAULT 0,
  resource_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE monthly_goal_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can manage their own monthly goal targets" ON monthly_goal_targets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create task_completion_history table
CREATE TABLE task_completion_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  tasks_completed INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE task_completion_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can manage their own task completion history" ON task_completion_history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create focus_time_history table
CREATE TABLE focus_time_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  minutes INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE focus_time_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can manage their own focus time history" ON focus_time_history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create thread_history table
CREATE TABLE thread_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  threads_completed INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE thread_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can manage their own thread history" ON thread_history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create gym_settings table
CREATE TABLE gym_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  last_completed_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE gym_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can manage their own gym settings" ON gym_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create gym_workouts table
CREATE TABLE gym_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workout TEXT NOT NULL,
  reps TEXT,
  is_required BOOLEAN DEFAULT true,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE gym_workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can manage their own gym workouts" ON gym_workouts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create workout_history table
CREATE TABLE workout_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workout_id UUID REFERENCES gym_workouts(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  reps_completed INT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE workout_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can manage their own workout history" ON workout_history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create data_exports table
CREATE TABLE data_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE data_exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can manage their own data exports" ON data_exports FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
