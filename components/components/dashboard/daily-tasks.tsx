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
import { Checkbox } from '@/components/ui/checkbox';
import {
  getData,
  insertData,
  updateById,
  DailyTask,
} from '@/lib/data-service';
import { CheckSquare } from 'lucide-react';

export default function DailyTasks() {
  const { session } = useAuth();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [streak, setStreak] = useState(0);

  const DEFAULT_TASKS = [
    'Deep Focus Block (Solidity/JS)',
    'Airdrop Farming',
    'Content Creation (Threads)',
    'Twitter Reply-Guy',
    'Leisure (30m Games/Books)',
    'Debug / Practice',
    'Side Project',
    'Twitter 2nd Round + Farming Logs',
    'Reflection + Plan',
  ];

  useEffect(() => {
    if (session) {
      loadTasks();
      loadStreak();
    }
  }, [session]);

  const loadTasks = async () => {
    if (!session) return;

    const today = new Date().toISOString().split('T')[0];
    let todayTasks = await getData<DailyTask>('daily_tasks', session.user.id, today);

    if (todayTasks.length === 0) {
      const seed = DEFAULT_TASKS.map((task) => ({
        user_id: session.user.id,
        task,
        is_completed: false,
      }));
      const { data: seeded } = await insertData('daily_tasks', seed);
      if (seeded) {
        todayTasks = seeded as DailyTask[];
      }
    }
    
    setTasks(todayTasks);
  };

  const loadStreak = async () => {
    if (!session) return;
    
    const allTasks = await getData<DailyTask>('daily_tasks', session.user.id);
    const taskHistory = allTasks.reduce((acc, task) => {
      const date = new Date(task.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(task);
      return acc;
    }, {} as Record<string, DailyTask[]>);

    let currentStreak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const dayTasks = taskHistory[dateStr] || [];
      const allCompleted = dayTasks.length >= 9 && dayTasks.every(task => task.is_completed);
      
      if (allCompleted) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    setStreak(currentStreak);
  };

  const handleToggleCompletion = async (index: number) => {
    if (!session) return;
    
    const taskToUpdate = tasks[index];
    if (taskToUpdate) {
      await updateById<DailyTask>('daily_tasks', taskToUpdate.id, { is_completed: !taskToUpdate.is_completed });
      
      const updatedTasks = [...tasks];
      updatedTasks[index] = { ...taskToUpdate, is_completed: !taskToUpdate.is_completed };
      setTasks(updatedTasks);
      
      const allCompleted = updatedTasks.every(task => task.is_completed);
      if (allCompleted) {
        await recordDailyCompletion();
      }
    }
  };

  const recordDailyCompletion = async () => {
    if (!session) return;
    
    const today = new Date().toISOString().split('T')[0];
    await insertData('task_completion_history', {
      user_id: session.user.id,
      date: today,
      tasks_completed: tasks.length
    });
    
    await loadStreak();
  };

  const completedCount = tasks.filter(t => t.is_completed).length;
  const allCompleted = completedCount === tasks.length && tasks.length >= 9;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            <div>
              <CardTitle>Daily Tasks</CardTitle>
              <CardDescription>
                <span className="text-sm">{completedCount}/{tasks.length} completed • {streak} day streak</span>
              </CardDescription>
            </div>
          </div>
          {allCompleted && (
            <div className="text-green-500 font-semibold text-sm">
              🔥 Streak Day!
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 sm:space-y-3 max-h-72 sm:max-h-80 overflow-y-auto pr-1">
          {tasks.map((task, index) => (
            <div key={task.id} className="flex items-center gap-2 sm:gap-3">
              <Checkbox
                checked={task.is_completed}
                onCheckedChange={() => handleToggleCompletion(index)}
                className="border-primary h-5 w-5"
              />
              <div 
                className={`flex-1 p-1.5 sm:p-2 rounded text-sm ${
                  task.is_completed ? 'line-through text-muted-foreground' : ''
                }`}
              >
                {task.task}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}