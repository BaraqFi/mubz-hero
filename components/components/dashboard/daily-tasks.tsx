'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  getData,
  insertData,
  updateById,
  DailyTask,
  getWhere,
  deleteWhereAll,
} from '@/lib/data-service';
import { CheckSquare } from 'lucide-react';

export default function DailyTasks() {
  const { session } = useAuth();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [streak, setStreak] = useState(0);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [templateTasks, setTemplateTasks] = useState<string[]>([]);
  const [applyToToday, setApplyToToday] = useState(true);

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
    
    // Query using the new task_date column
    const supabase = (await import('@/lib/supabase/client')).createClient();
    const { data: todayTasks, error } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('task_date', today);

    if (error) {
      console.error('Error loading tasks:', error);
      return;
    }

    if (!todayTasks || todayTasks.length === 0) {
      // Prefer user template if available, otherwise default tasks
      const userTemplate = await getWhere<{ id: string; user_id: string; sort_order: number; task: string }>(
        'user_daily_task_templates',
        { user_id: session.user.id }
      );
      const orderedTemplate = [...userTemplate].sort((a, b) => a.sort_order - b.sort_order);
      const sourceTasks = (orderedTemplate.length > 0 ? orderedTemplate.map(t => t.task) : DEFAULT_TASKS);

      const seed = sourceTasks.map((task) => ({
        user_id: session.user.id,
        task,
        is_completed: false,
        created_at: new Date().toISOString(),
        task_date: today,
      }));
      
      const { data: seeded, error: insertError } = await supabase
        .from('daily_tasks')
        .insert(seed)
        .select();
        
      if (insertError) {
        console.error('Error seeding tasks:', insertError);
        return;
      }
      
      if (seeded) {
        setTasks(seeded as DailyTask[]);
        return;
      }
    }
    
    // Ensure deterministic order by creation time
    const ordered = [...(todayTasks || [])].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    setTasks(ordered);
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

  const handleOpenEdit = async () => {
    if (!session) return;
    // Load template or fall back to defaults
    const userTemplate = await getWhere<{ id: string; user_id: string; sort_order: number; task: string }>(
      'user_daily_task_templates',
      { user_id: session.user.id }
    );
    const ordered = [...userTemplate].sort((a, b) => a.sort_order - b.sort_order);
    const source = (ordered.length > 0 ? ordered.map(t => t.task) : DEFAULT_TASKS);
    setTemplateTasks(source);
    setApplyToToday(true);
    setIsEditOpen(true);
  };

  const handleTemplateChange = (index: number, value: string) => {
    setTemplateTasks(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSaveTemplate = async () => {
    if (!session) return;
    const userId = session.user.id;

    // Persist template: replace all 9 rows
    await deleteWhereAll('user_daily_task_templates', { user_id: userId });
    const rows = templateTasks.map((task, idx) => ({ user_id: userId, sort_order: idx, task }));
    await insertData('user_daily_task_templates', rows);

    if (applyToToday) {
      // Update today's tasks' labels for incomplete ones, preserving completion state
      const today = new Date().toISOString().split('T')[0];
      const supabase = (await import('@/lib/supabase/client')).createClient();
      
      const { data: todayTasks, error } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('task_date', today);
        
      if (error) {
        console.error('Error loading today tasks:', error);
        return;
      }
      
      const ordered = [...(todayTasks || [])].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      const updates = ordered.map((t, idx) => ({ taskRow: t, newLabel: templateTasks[idx] ?? t.task }));
      
      for (const { taskRow, newLabel } of updates) {
        if (!taskRow.is_completed && newLabel && newLabel !== taskRow.task) {
          await updateById<DailyTask>('daily_tasks', taskRow.id, { task: newLabel } as Partial<DailyTask>);
        }
      }
      await loadTasks();
    }

    setIsEditOpen(false);
  };

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
          <div className="flex items-center gap-2">
            {allCompleted && (
              <div className="text-green-500 font-semibold text-sm">
                🔥 Streak Day!
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handleOpenEdit}>Edit</Button>
          </div>
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
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Daily Tasks</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {Array.from({ length: 9 }).map((_, idx) => (
              <div key={idx} className="grid grid-cols-12 items-center gap-2">
                <Label className="col-span-2 text-xs sm:text-sm">Task {idx + 1}</Label>
                <Input
                  className="col-span-10"
                  value={templateTasks[idx] ?? ''}
                  onChange={(e) => handleTemplateChange(idx, e.target.value)}
                />
              </div>
            ))}
            <div className="flex items-center gap-2 pt-2">
              <Checkbox
                checked={applyToToday}
                onCheckedChange={(checked) => setApplyToToday(Boolean(checked))}
                className="border-primary h-4 w-4"
              />
              <span className="text-sm">Apply changes to today</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTemplate}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}