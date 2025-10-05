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
  insertData,
  upsertData,
  GymWorkout,
} from '@/lib/data-service';
import { X } from 'lucide-react';

export default function WorkoutsList() {
  const { session } = useAuth();
  const [workouts, setWorkouts] = useState<GymWorkout[]>([]);
  const [newWorkout, setNewWorkout] = useState('');
  const [newReps, setNewReps] = useState('');

  useEffect(() => {
    if (session) {
      getData<GymWorkout>('gym_workouts', session.user.id).then(setWorkouts);
    }
  }, [session]);

  const handleAddWorkout = async () => {
    if (session && newWorkout.trim() !== '') {
      const { data, error } = await insertData('gym_workouts', {
        user_id: session.user.id,
        workout: newWorkout.trim(),
        reps: newReps.trim(),
      });
      if (data) {
        setWorkouts([...workouts, data[0]]);
        setNewWorkout('');
        setNewReps('');
      }
    }
  };

  const handleToggleWorkout = async (workout: GymWorkout) => {
    if (session) {
      const updatedWorkout = { ...workout, is_completed: !workout.is_completed };
      await upsertData('gym_workouts', updatedWorkout);
      setWorkouts(
        workouts.map((w) => (w.id === workout.id ? updatedWorkout : w))
      );
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (session) {
      // UI delete only for now
      setWorkouts(workouts.filter((w) => w.id !== workoutId));
    }
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Workouts</CardTitle>
        <CardDescription>Manage your workouts.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="New workout"
              value={newWorkout}
              onChange={(e) => setNewWorkout(e.target.value)}
            />
            <Input
              placeholder="Reps"
              value={newReps}
              onChange={(e) => setNewReps(e.target.value)}
            />
            <Button onClick={handleAddWorkout}>Add</Button>
          </div>
          <div className="space-y-2">
            {workouts.map((workout) => (
              <div key={workout.id} className="flex items-center space-x-2">
                <Checkbox
                  id={workout.id}
                  checked={workout.is_completed}
                  onCheckedChange={() => handleToggleWorkout(workout)}
                />
                <label
                  htmlFor={workout.id}
                  className={`flex-1 ${
                    workout.is_completed
                      ? 'line-through text-muted-foreground'
                      : ''
                  }`}
                >
                  {workout.workout} ({workout.reps})
                </label>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteWorkout(workout.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
