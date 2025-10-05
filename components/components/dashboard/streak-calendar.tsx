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
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (session) {
      loadCompletedDays();
    }
  }, [session]);

  const loadCompletedDays = async () => {
    if (!session) return;
    
    const allTasks = await getData<DailyTask>('daily_tasks', session.user.id);
    const taskHistory = allTasks.reduce((acc, task) => {
      const date = new Date(task.created_at).toLocaleDateString('en-CA');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(task);
      return acc;
    }, {} as Record<string, DailyTask[]>);

    const completed = new Set<string>();
    let currentStreak = 0;
    // Use device local time consistently
    const today = new Date();
    
    // Check each day for completion
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toLocaleDateString('en-CA');
      
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
        date: prevDate.toLocaleDateString('en-CA'),
        completed: false,
        isToday: false,
        isCurrentMonth: false,
      });
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = new Date(year, month, day).toLocaleDateString('en-CA');
      const todayLocalStr = new Date().toLocaleDateString('en-CA');
      const isToday = dateStr === todayLocalStr;
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
  const monthName = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(currentDate);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <div>
              <CardTitle>Streak Calendar</CardTitle>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
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
      {!collapsed && (
      <CardContent>
        <div className="space-y-3">
          {/* Month Header */}
          <div className="text-center font-semibold text-sm sm:text-base">{monthName} • {streak} day streak</div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-[10px] sm:text-xs font-medium text-muted-foreground p-1 sm:p-2">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {days.map((day, index) => (
              <div
                key={index}
                className={`
                  aspect-square flex items-center justify-center text-xs sm:text-sm rounded
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
          <div className="flex items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-primary rounded"></div>
              <span>Today</span>
            </div>
          </div>
        </div>
      </CardContent>
      )}
    </Card>
  );
}
