'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  getData,
  type WorkoutHistory,
  type GymWorkout,
} from '@/lib/data-service';

interface AggregatedHistory {
  [month: string]: {
    [workoutName: string]: number;
  };
}

export default function WorkoutHistory() {
  const { session } = useAuth();
  const [history, setHistory] = useState<AggregatedHistory>({});

  useEffect(() => {
    if (session) {
      getData<GymWorkout>('gym_workouts', session.user.id).then((workouts) => {
        const aggregated: AggregatedHistory = {};

        // Group workouts by month based on when they were completed
        workouts.forEach((workout) => {
          if (workout.is_completed) {
            const month = new Date(workout.created_at).toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            });
            
            if (!aggregated[month]) {
              aggregated[month] = {};
            }
            if (!aggregated[month][workout.workout]) {
              aggregated[month][workout.workout] = 0;
            }
            aggregated[month][workout.workout] += 1;
          }
        });

        setHistory(aggregated);
      });
    }
  }, [session]);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Workout History</CardTitle>
      </CardHeader>
      <CardContent>
        {Object.entries(history).map(([month, workouts]) => (
          <div key={month} className="mb-4">
            <h3 className="font-bold text-lg mb-2">{month}</h3>
            <ul>
              {Object.entries(workouts).map(([workoutName, total]) => (
                <li key={workoutName}>
                  {workoutName}: {total} times
                </li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
