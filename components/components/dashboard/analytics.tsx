'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  getData,
  DailyTask,
  DailyAchievement,
  MonthlyGoal,
  MonthlyGoalTarget,
} from '@/lib/data-service';
import { BarChart3, TrendingUp, Target, Calendar } from 'lucide-react';

interface AnalyticsData {
  totalTasksCompleted: number;
  totalAchievements: number;
  currentStreak: number;
  longestStreak: number;
  monthlyGoalProgress: number;
  weeklyCompletionRate: number;
  dailyAverage: number;
}

export default function Analytics() {
  const { session } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalTasksCompleted: 0,
    totalAchievements: 0,
    currentStreak: 0,
    longestStreak: 0,
    monthlyGoalProgress: 0,
    weeklyCompletionRate: 0,
    dailyAverage: 0,
  });

  useEffect(() => {
    if (session) {
      loadAnalytics();
    }
  }, [session]);

  const loadAnalytics = async () => {
    if (!session) return;

    const [tasks, achievements, goals, targets] = await Promise.all([
      getData<DailyTask>('daily_tasks', session.user.id),
      getData<DailyAchievement>('daily_achievements', session.user.id),
      getData<MonthlyGoal>('monthly_goals', session.user.id),
      getData<MonthlyGoalTarget>('monthly_goal_targets', session.user.id),
    ]);

    // Calculate analytics
    const totalTasksCompleted = tasks.filter(t => t.is_completed).length;
    const totalAchievements = achievements.length; // All achievements are considered completed
    
    // Calculate streaks - using created_at date for now
    const taskHistory = tasks.reduce((acc, task) => {
      const date = new Date(task.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(task);
      return acc;
    }, {} as Record<string, DailyTask[]>);

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const dayTasks = taskHistory[dateStr] || [];
      const allCompleted = dayTasks.length >= 9 && dayTasks.every(task => task.is_completed);
      
      if (allCompleted) {
        tempStreak++;
        if (i === 0) {
          currentStreak = tempStreak;
        }
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Calculate monthly goal progress
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const currentMonthGoals = goals.filter(g => g.month === currentMonth && g.year === currentYear);
    const currentMonthTargets = targets.filter(t => 
      currentMonthGoals.some(g => g.id === t.goal_id)
    );
    const completedTargets = currentMonthTargets.filter(t => t.is_completed).length;
    const monthlyGoalProgress = currentMonthTargets.length > 0 
      ? Math.round((completedTargets / currentMonthTargets.length) * 100) 
      : 0;

    // Calculate weekly completion rate
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });
    
    const completedDays = last7Days.filter(date => {
      const dayTasks = taskHistory[date] || [];
      return dayTasks.length >= 9 && dayTasks.every(task => task.is_completed);
    }).length;
    
    const weeklyCompletionRate = Math.round((completedDays / 7) * 100);

    // Calculate daily average
    const allDates = Object.keys(taskHistory);
    const completedDates = allDates.filter(date => {
      const dayTasks = taskHistory[date] || [];
      return dayTasks.length >= 9 && dayTasks.every(task => task.is_completed);
    });
    
    const dailyAverage = allDates.length > 0 
      ? Math.round((completedDates.length / allDates.length) * 100) 
      : 0;

    setAnalytics({
      totalTasksCompleted,
      totalAchievements,
      currentStreak,
      longestStreak,
      monthlyGoalProgress,
      weeklyCompletionRate,
      dailyAverage,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          <CardTitle>Analytics</CardTitle>
        </div>
        <CardDescription>
          Track your progress and performance over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Current Streak */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Current Streak</span>
            </div>
            <div className="text-2xl font-bold">{analytics.currentStreak}</div>
            <div className="text-xs text-muted-foreground">days</div>
          </div>

          {/* Longest Streak */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Longest Streak</span>
            </div>
            <div className="text-2xl font-bold">{analytics.longestStreak}</div>
            <div className="text-xs text-muted-foreground">days</div>
          </div>

          {/* Monthly Goal Progress */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Monthly Goals</span>
            </div>
            <div className="text-2xl font-bold">{analytics.monthlyGoalProgress}%</div>
            <div className="text-xs text-muted-foreground">completed</div>
          </div>

          {/* Weekly Completion Rate */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Weekly Rate</span>
            </div>
            <div className="text-2xl font-bold">{analytics.weeklyCompletionRate}%</div>
            <div className="text-xs text-muted-foreground">completion</div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="mt-6 pt-6 border-t">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-lg font-semibold">{analytics.totalTasksCompleted}</div>
              <div className="text-sm text-muted-foreground">Total Tasks Completed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{analytics.totalAchievements}</div>
              <div className="text-sm text-muted-foreground">Total Achievements</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{analytics.dailyAverage}%</div>
              <div className="text-sm text-muted-foreground">Daily Average</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}