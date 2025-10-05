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

  useEffect(() => {
    if (session) {
      getData<ThreadDay>('thread_days', session.user.id).then((data) => {
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
        setThreadDays(allDays);
      });
    }
  }, [session]);

  const handleToggleDay = async (day: ThreadDay) => {
    if (session) {
      const updatedDay = { ...day, is_completed: !day.is_completed };
      await upsertData('thread_days', updatedDay);
      setThreadDays(
        threadDays.map((d) => (d.day_of_week === day.day_of_week ? updatedDay : d))
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Thread Tracker</CardTitle>
        <CardDescription>Track your weekly thread completions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {threadDays
            .sort((a, b) => a.day_of_week - b.day_of_week)
            .map((day) => (
              <div key={day.day_of_week} className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${day.day_of_week}`}
                  checked={day.is_completed}
                  onCheckedChange={() => handleToggleDay(day)}
                />
                <label htmlFor={`day-${day.day_of_week}`} className="flex-1">
                  {daysOfWeek[day.day_of_week]}
                </label>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
