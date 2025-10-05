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
  GymWorkout,
} from '@/lib/data-service';
import { Plus, Dumbbell } from 'lucide-react';

export default function GymWorkouts() {
  const { session } = useAuth();
  const [requiredWorkouts, setRequiredWorkouts] = useState<GymWorkout[]>([]);
  const [optionalWorkouts, setOptionalWorkouts] = useState<GymWorkout[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingOptionalIndex, setEditingOptionalIndex] = useState<number | null>(null);

  useEffect(() => {
    if (session) {
      loadWorkouts();
    }
  }, [session]);

  const loadWorkouts = async () => {
    if (!session) return;
    
    const data = await getData<GymWorkout>('gym_workouts', session.user.id);
    
    // Separate required and optional workouts
    const required = data.filter(w => w.is_required).slice(0, 9);
    const optional = data.filter(w => !w.is_required);
    
    // Ensure we have exactly 9 required workouts
    while (required.length < 9) {
      const newWorkout = {
        user_id: session.user.id,
        workout: '',
        is_required: true,
        is_completed: false,
      };
      const { data: result } = await insertData('gym_workouts', newWorkout);
      if (result && result[0]) {
        required.push(result[0] as any);
      }
    }
    
    setRequiredWorkouts(required.slice(0, 9));
    setOptionalWorkouts(optional);
  };

  const handleToggleRequired = async (index: number) => {
    if (!session) return;
    
    const workout = requiredWorkouts[index];
    await upsertData('gym_workouts', {
      id: workout.id,
      is_completed: !workout.is_completed
    });
    
    const updated = [...requiredWorkouts];
    updated[index] = { ...workout, is_completed: !workout.is_completed };
    setRequiredWorkouts(updated);
  };

  const handleToggleOptional = async (index: number) => {
    if (!session) return;
    
    const workout = optionalWorkouts[index];
    await upsertData('gym_workouts', {
      id: workout.id,
      is_completed: !workout.is_completed
    });
    
    const updated = [...optionalWorkouts];
    updated[index] = { ...workout, is_completed: !workout.is_completed };
    setOptionalWorkouts(updated);
  };

  const handleUpdateRequired = async (index: number, workout: string) => {
    if (!session) return;
    
    const workoutToUpdate = requiredWorkouts[index];
    await upsertData('gym_workouts', {
      id: workoutToUpdate.id,
      workout: workout.trim()
    });
    
    const updated = [...requiredWorkouts];
    updated[index] = { ...workoutToUpdate, workout: workout.trim() };
    setRequiredWorkouts(updated);
  };

  const handleUpdateOptional = async (index: number, workout: string) => {
    if (!session) return;
    
    const workoutToUpdate = optionalWorkouts[index];
    await upsertData('gym_workouts', {
      id: workoutToUpdate.id,
      workout: workout.trim()
    });
    
    const updated = [...optionalWorkouts];
    updated[index] = { ...workoutToUpdate, workout: workout.trim() };
    setOptionalWorkouts(updated);
  };

  const handleAddOptional = async () => {
    if (!session) return;
    
    const newWorkout = {
      user_id: session.user.id,
      workout: 'New optional workout',
      is_required: false,
      is_completed: false,
    };
    
    const { data: result } = await insertData('gym_workouts', newWorkout);
    if (result && result[0]) {
      setOptionalWorkouts([...optionalWorkouts, result[0] as any]);
    }
  };

  const requiredCompleted = requiredWorkouts.filter(w => w.is_completed).length;
  const allRequiredCompleted = requiredCompleted === 9;

  return (
    <div className="space-y-6">
      {/* Required Workouts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              <div>
                <CardTitle>Required Workouts</CardTitle>
                <CardDescription>
                  {requiredCompleted}/9 completed • {allRequiredCompleted ? '🔥 All done!' : 'Complete all for streak'}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {requiredWorkouts.map((workout, index) => (
              <div key={workout.id} className="flex items-center space-x-3">
                <Checkbox
                  checked={workout.is_completed}
                  onCheckedChange={() => handleToggleRequired(index)}
                  className="border-primary"
                />
                {editingIndex === index ? (
                  <Input
                    value={workout.workout}
                    onChange={(e) => handleUpdateRequired(index, e.target.value)}
                    onBlur={() => setEditingIndex(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setEditingIndex(null);
                      }
                    }}
                    placeholder={`Workout ${index + 1}`}
                    className="flex-1"
                    autoFocus
                  />
                ) : (
                  <div 
                    className={`flex-1 cursor-pointer p-2 rounded ${
                      workout.workout ? '' : 'text-muted-foreground italic'
                    } ${workout.is_completed ? 'line-through text-muted-foreground' : ''}`}
                    onClick={() => setEditingIndex(index)}
                  >
                    {workout.workout || `Workout ${index + 1}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optional Workouts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              <div>
                <CardTitle>Optional Workouts</CardTitle>
                <CardDescription>
                  Extra workouts that don't count towards streaks
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddOptional}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Optional
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {optionalWorkouts.length === 0 ? (
              <p className="text-muted-foreground text-sm">No optional workouts added yet.</p>
            ) : (
              optionalWorkouts.map((workout, index) => (
                <div key={workout.id} className="flex items-center space-x-3">
                  <Checkbox
                    checked={workout.is_completed}
                    onCheckedChange={() => handleToggleOptional(index)}
                    className="border-primary"
                  />
                  {editingOptionalIndex === index ? (
                    <Input
                      value={workout.workout}
                      onChange={(e) => handleUpdateOptional(index, e.target.value)}
                      onBlur={() => setEditingOptionalIndex(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setEditingOptionalIndex(null);
                        }
                      }}
                      placeholder="Optional workout"
                      className="flex-1"
                      autoFocus
                    />
                  ) : (
                    <div 
                      className={`flex-1 cursor-pointer p-2 rounded ${
                        workout.workout ? '' : 'text-muted-foreground italic'
                      } ${workout.is_completed ? 'line-through text-muted-foreground' : ''}`}
                      onClick={() => setEditingOptionalIndex(index)}
                    >
                      {workout.workout || 'Optional workout'}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
