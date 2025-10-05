'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getData, GymSettings } from '@/lib/data-service';

function calculateStreak(lastCompletedDate: string | null): number {
  if (!lastCompletedDate) {
    return 0;
  }

  const today = new Date();
  const lastDate = new Date(lastCompletedDate);

  // Reset hours, minutes, seconds, and milliseconds for accurate day comparison
  today.setHours(0, 0, 0, 0);
  lastDate.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - lastDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Last workout was today, so the streak is ongoing.
    // We need to know the previous streak to continue it.
    // For simplicity, we'll just show that they've worked out today.
    // A more complex implementation would store the streak count in the database.
    return 1; // Or fetch streak from db
  } else if (diffDays === 1) {
    // Last workout was yesterday, so the streak continues.
    return 1; // This should be incremented based on a stored streak.
  } else {
    // The streak is broken.
    return 0;
  }
}


export default function StreakTracker() {
  const { session } = useAuth();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (session) {
      getData<GymSettings>('gym_settings', session.user.id).then((data) => {
        if (data.length > 0) {
          setStreak(calculateStreak(data[0].last_completed_date));
        }
      });
    }
  }, [session]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workout Streak</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-center">
          {streak} {streak === 1 ? 'day' : 'days'}
        </div>
      </CardContent>
    </Card>
  );
}
