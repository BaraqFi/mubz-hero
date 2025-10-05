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
} from '@/lib/data-service';
import { Calendar } from 'lucide-react';

interface DayData {
  date: string;
  completed: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
}

export default function StreakCalendar() {
  const { session } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [completedDays, setCompletedDays] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (session) {
      loadCompletedDays();
    }
  }, [session]);

  const loadCompletedDays = async () => {
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

    const completed = new Set<string>();
    let currentStreak = 0;
    // Use UTC+1 timezone (Europe/London or similar)
    const today = new Date();
    const utcPlus1 = new Date(today.getTime() + (1 * 60 * 60 * 1000));
    
    // Check each day for completion
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(utcPlus1);
      checkDate.setDate(utcPlus1.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const dayTasks = taskHistory[dateStr] || [];
      const allCompleted = dayTasks.length >= 9 && dayTasks.every(task => task.is_completed);
      
      if (allCompleted) {
        completed.add(dateStr);
        if (i === 0 || currentStreak > 0) {
          currentStreak++;
        }
      } else if (i === 0) {
        // If today is not completed, streak is 0
        currentStreak = 0;
      }
    }
    
    setCompletedDays(completed);
    setStreak(currentStreak);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: DayData[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({
        date: prevDate.toISOString().split('T')[0],
        completed: false,
        isToday: false,
        isCurrentMonth: false,
      });
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = new Date(year, month, day).toISOString().split('T')[0];
      // Use UTC+1 for today comparison
      const todayUtcPlus1 = new Date();
      const todayUtcPlus1Str = new Date(todayUtcPlus1.getTime() + (1 * 60 * 60 * 1000)).toISOString().split('T')[0];
      const isToday = dateStr === todayUtcPlus1Str;
      const completed = completedDays.has(dateStr);
      
      days.push({
        date: dateStr,
        completed,
        isToday,
        isCurrentMonth: true,
      });
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <div>
              <CardTitle>Streak Calendar</CardTitle>
        <CardDescription>
          {streak} day streak
        </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1 hover:bg-muted rounded"
            >
              ←
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-1 hover:bg-muted rounded"
            >
              →
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Month Header */}
          <div className="text-center font-semibold">{monthName}</div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {days.map((day, index) => (
              <div
                key={index}
                className={`
                  aspect-square flex items-center justify-center text-sm rounded
                  ${!day.isCurrentMonth ? 'text-muted-foreground/50' : ''}
                  ${day.isToday ? 'bg-primary text-primary-foreground font-semibold' : ''}
                  ${day.completed && day.isCurrentMonth && !day.isToday ? 'bg-green-500 text-white' : ''}
                  ${!day.completed && day.isCurrentMonth && !day.isToday ? 'hover:bg-muted' : ''}
                `}
              >
                {new Date(day.date).getDate()}
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-primary rounded"></div>
              <span>Today</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
