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
import {
  getData,
  upsertData,
  ThreadDay,
} from '@/lib/data-service';

const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export default function WeeklyThreadTracker() {
  const { session } = useAuth();
  const [threadDays, setThreadDays] = useState<ThreadDay[]>([]);
  const todayIndex = new Date().getDay();

  const rotateFromToday = useMemo(() => {
    const sorted = [...threadDays].sort((a, b) => a.day_of_week - b.day_of_week);
    const before = sorted.slice(0, todayIndex);
    const after = sorted.slice(todayIndex);
    return [...after, ...before];
  }, [threadDays, todayIndex]);

  useEffect(() => {
    if (session) {
      getData<ThreadDay>('thread_days', session.user.id).then(async (data) => {
        // Ensure all days are present
        const allDays = daysOfWeek.map((day, index) => {
          const existingDay = data.find((d) => d.day_of_week === index);
          return (
            existingDay || {
              id: crypto.randomUUID(),
              user_id: session.user.id,
              day_of_week: index,
              is_completed: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          );
        });
        // Reset for new ISO week
        const now = new Date();
        const currentWeek = getISOWeek(now);
        const normalized = await Promise.all(
          allDays.map(async (d) => {
            const lastWeek = getISOWeek(new Date(d.updated_at));
            if (lastWeek !== currentWeek && d.is_completed) {
              const reset = { ...d, is_completed: false, updated_at: new Date().toISOString() } as ThreadDay;
              await upsertData('thread_days', reset);
              return reset;
            }
            return d;
          })
        );
        setThreadDays(normalized);
      });
    }
  }, [session]);

  const handleToggleDay = async (day: ThreadDay) => {
    if (session) {
      const updatedDay = { ...day, is_completed: !day.is_completed, updated_at: new Date().toISOString() } as ThreadDay;
      await upsertData('thread_days', updatedDay);
      setThreadDays(
        threadDays.map((d) => (d.day_of_week === day.day_of_week ? updatedDay : d))
      );
    }
  };

  function getISOWeek(date: Date) {
    const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = tmp.getUTCDay() || 7;
    tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    return Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Weekly Thread Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Small screens: horizontal list */}
        <div className="flex gap-3 overflow-x-auto sm:hidden -mx-2 px-2">
          {rotateFromToday.map((day) => {
            const isToday = day.day_of_week === todayIndex;
            return (
              <div key={day.day_of_week} className="relative flex flex-col items-center min-w-14">
                {isToday && <span className="absolute -top-1 h-1.5 w-1.5 rounded-full bg-primary" />}
                <span className="text-xs mb-1">{daysOfWeek[day.day_of_week].slice(0,3)}</span>
                <Checkbox
                  id={`day-${day.day_of_week}`}
                  checked={day.is_completed}
                  onCheckedChange={() => handleToggleDay(day)}
                  className={(isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded ' : '') + 'h-5 w-5'}
                />
              </div>
            );
          })}
        </div>

        {/* Large screens: vertical list */}
        <div className="hidden sm:flex sm:flex-col sm:gap-2">
          {rotateFromToday.map((day) => {
            const isToday = day.day_of_week === todayIndex;
            return (
              <div key={day.day_of_week} className="relative flex items-center gap-2">
                {isToday && <span className="absolute -left-2 h-1.5 w-1.5 rounded-full bg-primary" />}
                <Checkbox
                  id={`day-${day.day_of_week}`}
                  checked={day.is_completed}
                  onCheckedChange={() => handleToggleDay(day)}
                  className={isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded' : ''}
                />
                <label htmlFor={`day-${day.day_of_week}`} className="flex-1">
                  {daysOfWeek[day.day_of_week]}
                </label>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
