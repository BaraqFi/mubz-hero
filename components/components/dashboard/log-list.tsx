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
import { getData, insertData } from '@/lib/data-service';

interface Log {
  id: string;
  user_id: string;
  log: string;
  created_at: string;
}

interface LogListProps {
  title: string;
  description: string;
  tableName: 'thought_logs' | 'airdrop_logs';
}

export default function LogList({
  title,
  description,
  tableName,
}: LogListProps) {
  const { session } = useAuth();
  const [logs, setLogs] = useState<Log[]>([]);
  const [newLog, setNewLog] = useState('');

  useEffect(() => {
    if (session) {
      getData<Log>(tableName, session.user.id).then(setLogs);
    }
  }, [session, tableName]);

  const handleAddLog = async () => {
    if (session && newLog.trim() !== '') {
      const { data, error } = await insertData(tableName, {
        user_id: session.user.id,
        log: newLog.trim(),
      });
      if (data) {
        setLogs([...logs, data[0]]);
        setNewLog('');
      }
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex gap-2 sm:flex-row flex-col">
            <Input
              placeholder="Add a new log"
              value={newLog}
              onChange={(e) => setNewLog(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddLog()}
              className="flex-1"
            />
            <Button onClick={handleAddLog} className="sm:w-auto w-full">Add</Button>
          </div>
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center space-x-2">
                <p className="flex-1 text-sm">{log.log}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {new Date(log.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
