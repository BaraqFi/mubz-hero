'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  getData,
  insertData,
  upsertData,
  MonthlyGoalTarget,
} from '@/lib/data-service';
import { X } from 'lucide-react';

interface TargetListProps {
  goalId: string;
}

export default function TargetList({ goalId }: TargetListProps) {
  const { session } = useAuth();
  const [targets, setTargets] = useState<MonthlyGoalTarget[]>([]);
  const [newTarget, setNewTarget] = useState('');

  useEffect(() => {
    if (session) {
      getData<MonthlyGoalTarget>('monthly_goal_targets', session.user.id).then(
        (data) => {
          const filteredTargets = data.filter(
            (target) => target.goal_id === goalId
          );
          setTargets(filteredTargets);
        }
      );
    }
  }, [session, goalId]);

  const handleAddTarget = async () => {
    if (session && newTarget.trim() !== '') {
      const { data, error } = await insertData('monthly_goal_targets', {
        user_id: session.user.id,
        goal_id: goalId,
        target: newTarget.trim(),
      });
      if (data) {
        setTargets([...targets, data[0]]);
        setNewTarget('');
      }
    }
  };

  const handleToggleTarget = async (target: MonthlyGoalTarget) => {
    if (session) {
      const updatedTarget = { ...target, is_completed: !target.is_completed };
      await upsertData('monthly_goal_targets', updatedTarget);
      setTargets(
        targets.map((t) => (t.id === target.id ? updatedTarget : t))
      );
    }
  };

  const handleDeleteTarget = async (targetId: string) => {
    if (session) {
      // Similar to other deletes, just filtering from UI for now
      setTargets(targets.filter((t) => t.id !== targetId));
    }
  };

  return (
    <div className="space-y-4 pl-4 border-l">
      <div className="flex space-x-2">
        <Input
          placeholder="Add a new target"
          value={newTarget}
          onChange={(e) => setNewTarget(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTarget()}
        />
        <Button onClick={handleAddTarget}>Add Target</Button>
      </div>
      <div className="space-y-2">
        {targets.map((target) => (
          <div key={target.id} className="flex items-center space-x-2">
            <Checkbox
              id={target.id}
              checked={target.is_completed}
              onCheckedChange={() => handleToggleTarget(target)}
            />
            <label
              htmlFor={target.id}
              className={`flex-1 ${
                target.is_completed ? 'line-through text-muted-foreground' : ''
              }`}
            >
              {target.target}
            </label>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteTarget(target.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
