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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  getData,
  upsertData,
  insertData,
  DailyTask,
} from '@/lib/data-service';
import { Plus, CheckSquare, Square } from 'lucide-react';

export default function DailyTasks() {
  const { session } = useAuth();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (session) {
      loadTasks();
      loadStreak();
    }
  }, [session]);

  const loadTasks = async () => {
    if (!session) return;
    
    const data = await getData<DailyTask>('daily_tasks', session.user.id);
    
    // Ensure we have exactly 9 tasks
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = data.filter(t => new Date(t.created_at).toISOString().split('T')[0] === today);
    
    // If we have less than 9, create empty ones
    while (todayTasks.length < 9) {
      const newTask = {
        user_id: session.user.id,
        task: '',
        is_completed: false,
      };
      const { data: result } = await insertData('daily_tasks', newTask);
      if (result && result[0]) {
        todayTasks.push(result[0] as any);
      }
    }
    
    // Limit to exactly 9 tasks
    setTasks(todayTasks.slice(0, 9));
  };

  const loadStreak = async () => {
    if (!session) return;
    
    // Calculate streak by checking consecutive days of completed tasks
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
    
    for (let i = 0; i < 365; i++) { // Check up to a year back
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

  const handleUpdateTask = async (index: number, task: string) => {
    if (!session) return;
    
    const taskToUpdate = tasks[index];
    if (taskToUpdate) {
      await upsertData('daily_tasks', {
        id: taskToUpdate.id,
        task: task.trim()
      });
      
      const updatedTasks = [...tasks];
      updatedTasks[index] = { ...taskToUpdate, task: task.trim() };
      setTasks(updatedTasks);
    }
  };

  const handleToggleCompletion = async (index: number) => {
    if (!session) return;
    
    const taskToUpdate = tasks[index];
    if (taskToUpdate) {
      await upsertData('daily_tasks', {
        id: taskToUpdate.id,
        is_completed: !taskToUpdate.is_completed
      });
      
      const updatedTasks = [...tasks];
      updatedTasks[index] = { ...taskToUpdate, is_completed: !taskToUpdate.is_completed };
      setTasks(updatedTasks);
      
      // Check if all tasks are completed to update streak
      const allCompleted = updatedTasks.every(task => task.is_completed);
      if (allCompleted) {
        // Record completion for today
        await recordDailyCompletion();
      }
    }
  };

  const handleAddTask = async () => {
    if (!session || tasks.length >= 9) return;
    
    const newTask = {
      user_id: session.user.id,
      task: 'New task',
      is_completed: false,
    };
    
    const { data: result } = await insertData('daily_tasks', newTask);
    if (result && result[0]) {
      setTasks([...tasks, result[0] as any]);
    }
  };

  const recordDailyCompletion = async () => {
    if (!session) return;
    
    // Record completion in task_completion_history
    const today = new Date().toISOString().split('T')[0];
    await insertData('task_completion_history', {
      user_id: session.user.id,
      date: today,
      tasks_completed: tasks.length
    });
    
    // Reload streak
    await loadStreak();
  };

  const completedCount = tasks.filter(t => t.is_completed).length;
  const allCompleted = completedCount === tasks.length && tasks.length >= 9;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            <div>
              <CardTitle>Daily Tasks</CardTitle>
              <CardDescription>
                {completedCount}/{tasks.length} completed • {streak} day streak
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
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {tasks.map((task, index) => (
            <div key={task.id} className="flex items-center space-x-3">
              <Checkbox
                checked={task.is_completed}
                onCheckedChange={() => handleToggleCompletion(index)}
                className="border-primary"
              />
              {editingIndex === index ? (
                <Input
                  value={task.task}
                  onChange={(e) => handleUpdateTask(index, e.target.value)}
                  onBlur={() => setEditingIndex(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setEditingIndex(null);
                    }
                  }}
                  placeholder={`Task ${index + 1}`}
                  className="flex-1"
                  autoFocus
                />
              ) : (
                <div 
                  className={`flex-1 cursor-pointer p-2 rounded ${
                    task.task ? '' : 'text-muted-foreground italic'
                  } ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}
                  onClick={() => setEditingIndex(index)}
                >
                  {task.task || `Task ${index + 1}`}
                </div>
              )}
            </div>
          ))}
          
          {/* Add Task Button - Only show if less than 9 tasks */}
          {tasks.length < 9 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddTask}
              className="w-full border-dashed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}