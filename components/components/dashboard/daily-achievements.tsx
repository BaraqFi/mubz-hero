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
import { Checkbox } from '@/components/ui/checkbox';
import {
  getData,
  upsertData,
  insertData,
  DailyAchievement,
} from '@/lib/data-service';
import { Target } from 'lucide-react';

export default function DailyAchievements() {
  const { session } = useAuth();
  const [achievements, setAchievements] = useState<DailyAchievement[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [completedAchievements, setCompletedAchievements] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (session) {
      loadAchievements();
    }
  }, [session]);

  const loadAchievements = async () => {
    if (!session) return;
    
    const data = await getData<DailyAchievement>('daily_achievements', session.user.id);
    
    // Ensure we have exactly 3 achievements
    while (data.length < 3) {
      const newAchievement = {
        user_id: session.user.id,
        achievement: '',
      };
      const { data: result } = await insertData('daily_achievements', newAchievement);
      if (result && result[0]) {
        data.push(result[0] as any);
      }
    }
    
    setAchievements(data.slice(0, 3));
  };

  const handleToggleCompletion = (achievementId: string) => {
    setCompletedAchievements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(achievementId)) {
        newSet.delete(achievementId);
      } else {
        newSet.add(achievementId);
      }
      return newSet;
    });
  };

  const handleUpdateAchievement = async (index: number, achievement: string) => {
    if (!session) return;
    
    const achievementToUpdate = achievements[index];
    if (achievementToUpdate) {
      await upsertData('daily_achievements', {
        id: achievementToUpdate.id,
        achievement: achievement.trim()
      });
      
      const updatedAchievements = [...achievements];
      updatedAchievements[index] = { ...achievementToUpdate, achievement: achievement.trim() };
      setAchievements(updatedAchievements);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          <CardTitle>Daily Achievements</CardTitle>
        </div>
        <CardDescription>
          3 things to achieve today
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 sm:space-y-3">
          {achievements.map((achievement, index) => (
            <div key={achievement.id} className="flex items-center gap-2 sm:gap-3">
              <Checkbox
                checked={completedAchievements.has(achievement.id)}
                onCheckedChange={() => handleToggleCompletion(achievement.id)}
                className="border-primary h-5 w-5"
              />
              {editingIndex === index ? (
                <Input
                  value={achievement.achievement}
                  onChange={(e) => handleUpdateAchievement(index, e.target.value)}
                  onBlur={() => setEditingIndex(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setEditingIndex(null);
                    }
                  }}
                  placeholder={`Achievement ${index + 1}`}
                  className="flex-1 text-sm"
                  autoFocus
                />
              ) : (
                <div 
                  className={`flex-1 cursor-pointer p-1.5 sm:p-2 rounded text-sm ${
                    achievement.achievement ? '' : 'text-muted-foreground italic'
                  } ${completedAchievements.has(achievement.id) ? 'line-through text-muted-foreground' : ''}`}
                  onClick={() => setEditingIndex(index)}
                >
                  {achievement.achievement || `Achievement ${index + 1}`}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

