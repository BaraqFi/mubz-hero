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
import {
  getData,
  upsertData,
  DashboardSettings,
} from '@/lib/data-service';

export default function HeroSection() {
  const { session } = useAuth();
  const [settings, setSettings] = useState<DashboardSettings | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (session) {
      getData<DashboardSettings>('dashboard_settings', session.user.id).then(
        (data) => {
          if (data.length > 0) {
            setSettings(data[0]);
            setTitle(data[0].hero_title || '');
            setDescription(data[0].hero_description || '');
          }
        }
      );
    }
  }, [session]);

  const handleSave = async () => {
    if (session) {
      const newSettings = {
        id: settings?.id,
        user_id: session.user.id,
        hero_title: title,
        hero_description: description,
      };
      await upsertData('dashboard_settings', newSettings);
      alert('Saved!');
    }
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Hero Section</CardTitle>
        <CardDescription>Customize your dashboard's hero section.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="Hero Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Hero Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button onClick={handleSave}>Save</Button>
        </div>
      </CardContent>
    </Card>
  );
}
