'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  getData,
  upsertData,
  DashboardSettings,
} from '@/lib/data-service';
import { useDebouncedCallback } from 'use-debounce';

const FOCUS_TIME_MINUTES = 25;

export default function PomodoroTimer() {
  const { session } = useAuth();
  const [settings, setSettings] = useState<DashboardSettings | null>(null);
  const [time, setTime] = useState(FOCUS_TIME_MINUTES * 60);
  const [isActive, setIsActive] = useState(false);

  const debouncedSave = useDebouncedCallback(
    (newTime: number) => {
      if (session && settings) {
        const newFocusTime = (settings.focus_time_today || 0) + newTime;
        upsertData('dashboard_settings', {
          ...settings,
          focus_time_today: newFocusTime,
        });
      }
    },
    1000 // Debounce for 1 second
  );

  useEffect(() => {
    if (session) {
      getData<DashboardSettings>('dashboard_settings', session.user.id).then(
        (data) => {
          if (data.length > 0) {
            setSettings(data[0]);
          } else {
            // Create initial settings if they don't exist
            const initialSettings = {
              user_id: session.user.id,
              focus_time_today: 0,
            };
            upsertData('dashboard_settings', initialSettings).then((newData) => {
              if (newData) {
                setSettings(newData[0]);
              }
            });
          }
        }
      );
    }
  }, [session]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
        debouncedSave(1);
      }, 1000);
    } else if (time === 0) {
      setIsActive(false);
      alert('Pomodoro session finished!');
      // Here you could add logic for a break timer
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, time, debouncedSave]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(FOCUS_TIME_MINUTES * 60);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pomodoro Timer</CardTitle>
        <CardDescription>
          Focus for {FOCUS_TIME_MINUTES} minutes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <div className="text-6xl font-bold">{formatTime(time)}</div>
          <div className="flex space-x-2">
            <Button onClick={toggleTimer}>{isActive ? 'Pause' : 'Start'}</Button>
            <Button variant="outline" onClick={resetTimer}>
              Reset
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Today's focus time: {Math.floor((settings?.focus_time_today || 0) / 60)} minutes
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
