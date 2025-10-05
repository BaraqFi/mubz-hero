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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  getData,
  upsertData,
  insertData,
  MonthlyGoal,
  MonthlyGoalTarget,
} from '@/lib/data-service';
import { Plus, Edit, Save, Calendar } from 'lucide-react';

interface GoalWithTargets extends MonthlyGoal {
  targets: MonthlyGoalTarget[];
}

export default function MonthlyGoals() {
  const { session } = useAuth();
  const [goals, setGoals] = useState<GoalWithTargets[]>([]);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [showNewGoalForm, setShowNewGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    primary_focus: '',
    key_resources: '',
    targets: ['', '', ''] // Start with 3 empty targets
  });

  useEffect(() => {
    if (session) {
      loadGoals();
    }
  }, [session]);

  const loadGoals = async () => {
    if (!session) return;
    
    const [goalsData, targetsData] = await Promise.all([
      getData<MonthlyGoal>('monthly_goals', session.user.id),
      getData<MonthlyGoalTarget>('monthly_goal_targets', session.user.id),
    ]);

    const goalsWithTargets: GoalWithTargets[] = goalsData.map(goal => ({
      ...goal,
      targets: targetsData.filter(target => target.goal_id === goal.id)
    }));

    setGoals(goalsWithTargets);
  };

  const handleAddGoal = async () => {
    if (session && newGoal.primary_focus.trim() !== '') {
      // Create the goal
      const goalData = {
        user_id: session.user.id,
        goal: newGoal.primary_focus.trim(),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      };
      
      const { data: goalResult } = await insertData('monthly_goals', goalData);
      
      if (goalResult && goalResult[0]) {
        const goalId = (goalResult[0] as any).id;
        
        // Create targets
        const targetsToCreate = newGoal.targets
          .filter(target => target.trim() !== '')
          .map(target => ({
            goal_id: goalId,
            user_id: session.user.id,
            target: target.trim(),
            is_completed: false,
          }));
        
        if (targetsToCreate.length > 0) {
          await insertData('monthly_goal_targets', targetsToCreate);
        }
        
        // Reset form
        setNewGoal({
          primary_focus: '',
          key_resources: '',
          targets: ['', '', '']
        });
        setShowNewGoalForm(false);
        
        // Reload goals
        await loadGoals();
      }
    }
  };

  const handleToggleTarget = async (targetId: string, completed: boolean) => {
    await upsertData('monthly_goal_targets', {
      id: targetId,
      is_completed: !completed,
    });
    await loadGoals();
  };

  const handleUpdateGoal = async (goalId: string, updates: Partial<MonthlyGoal>) => {
    await upsertData('monthly_goals', {
      id: goalId,
      ...updates
    });
    await loadGoals();
    setEditingGoal(null);
  };

  const handleAddTarget = async (goalId: string) => {
    const newTarget = {
      goal_id: goalId,
      user_id: session?.user.id || '',
      target: 'New target',
      is_completed: false,
    };
    await insertData('monthly_goal_targets', newTarget);
    await loadGoals();
  };

  const handleUpdateTarget = async (targetId: string, target: string) => {
    await upsertData('monthly_goal_targets', {
      id: targetId,
      target: target.trim()
    });
    await loadGoals();
  };

  const getProgress = (targets: MonthlyGoalTarget[]) => {
    if (targets.length === 0) return 0;
    const completed = targets.filter(t => t.is_completed).length;
    return Math.round((completed / targets.length) * 100);
  };

  return (
    <Card className="relative z-10">
      <CardHeader className="sticky top-0 bg-background z-20 border-b">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
            <CardTitle>Monthly Goals</CardTitle>
        </div>
        <CardDescription>
          Track your goals and stay focused on your primary objectives for the month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Add New Goal Button */}
          <div className="flex justify-end">
            <Button 
              onClick={() => setShowNewGoalForm(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </div>

          {/* New Goal Form */}
          {showNewGoalForm ? (
            <Card className="border-2 border-dashed">
              <CardHeader>
                <CardTitle className="text-lg">Month {goals.length + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Primary Focus */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Primary Focus</label>
                  <Input
                    placeholder="Ruthless time audit & routine"
                    value={newGoal.primary_focus}
                    onChange={(e) => setNewGoal({...newGoal, primary_focus: e.target.value})}
                  />
                </div>

                {/* Concrete Targets */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Concrete Targets</label>
                  <div className="space-y-2">
                    {newGoal.targets.map((target, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-primary rounded-sm" />
                        <Input
                          placeholder="30-min daily planning session"
                          value={target}
                          onChange={(e) => {
                            const newTargets = [...newGoal.targets];
                            newTargets[index] = e.target.value;
                            setNewGoal({...newGoal, targets: newTargets});
                          }}
                        />
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNewGoal({...newGoal, targets: [...newGoal.targets, '']})}
                      className="w-full border-dashed"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Target
                    </Button>
                  </div>
                </div>

                {/* Key Resources & Tactics */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Key Resources & Tactics</label>
                  <Textarea
                    placeholder="Tool: Google Calendar + Pomodoro 50/10&#10;Rule: No games/books until targets hit"
                    value={newGoal.key_resources}
                    onChange={(e) => setNewGoal({...newGoal, key_resources: e.target.value})}
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button onClick={handleAddGoal} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Save Goal
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setNewGoal({
                        primary_focus: '',
                        key_resources: '',
                        targets: ['', '', '']
                      });
                      setShowNewGoalForm(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Existing Goals */}
          {goals.map((goal, index) => {
            const progress = getProgress(goal.targets);
            const isEditing = editingGoal === goal.id;

            return (
              <Card key={goal.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-muted rounded flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <CardTitle className="text-lg">Month {index + 1}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingGoal(isEditing ? null : goal.id)}
                    >
                      {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Primary Focus */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Primary Focus</label>
                    {isEditing ? (
                      <Input
                        value={goal.goal || ''}
                        onChange={(e) => handleUpdateGoal(goal.id, { goal: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm">{goal.goal || 'No focus set'}</p>
                    )}
                  </div>

                  {/* Concrete Targets */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Concrete Targets</label>
                    <div className="space-y-2">
                      {goal.targets.map((target) => (
                        <div key={target.id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={target.is_completed}
                            onCheckedChange={() => handleToggleTarget(target.id, target.is_completed)}
                            className="border-primary"
                          />
                          {isEditing ? (
                            <Input
                              value={target.target}
                              onChange={(e) => handleUpdateTarget(target.id, e.target.value)}
                              className="flex-1"
                            />
                          ) : (
                            <span className={`text-sm flex-1 ${target.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                              {target.target}
                            </span>
                          )}
                        </div>
                      ))}
                      {isEditing && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddTarget(goal.id)}
                          className="w-full border-dashed"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Target
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Key Resources & Tactics */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Key Resources & Tactics</label>
                    <div className="text-sm text-muted-foreground">
                      Key resources and tactics can be added here
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{progress}%</span>
                      <span>{goal.targets.filter(t => t.is_completed).length}/{goal.targets.length} targets completed</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}