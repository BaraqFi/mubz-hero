'use client';

import { useState } from 'react';
import { BookOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/providers/auth-provider';
import { insertData, getData, type ThoughtLog } from '@/lib/data-service';

export default function ThoughtLogsFAB() {
  const { session } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState('');
  const [pastEntries, setPastEntries] = useState<ThoughtLog[]>([]);
  const [showPastEntries, setShowPastEntries] = useState(false);

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric'
  });

  const handleSaveEntry = async () => {
    if (session && currentEntry.trim() !== '') {
      const { data, error } = await insertData('thought_logs', {
        user_id: session.user.id,
        log: currentEntry.trim(),
      });
      
      if (data && !error) {
        setCurrentEntry('');
        // Refresh past entries
        if (session) {
          const entries = await getData<ThoughtLog>('thought_logs', session.user.id);
          setPastEntries(entries);
        }
      }
    }
  };

  const loadPastEntries = async () => {
    if (session && pastEntries.length === 0) {
      const entries = await getData<ThoughtLog>('thought_logs', session.user.id);
      setPastEntries(entries);
    }
    setShowPastEntries(!showPastEntries);
  };

  return (
    <>
      {/* Floating Action Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
        size="icon"
      >
        <BookOpen className="h-6 w-6" />
      </Button>

      {/* Side Panel Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsOpen(false)}>
          <div 
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Log Your Thoughts</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Date and View Past Entries */}
            <div className="flex items-center justify-between p-6">
              <span className="text-sm text-muted-foreground">
                {formattedDate} - New Entry
              </span>
              <Button
                variant="link"
                size="sm"
                onClick={loadPastEntries}
                className="text-primary p-0 h-auto"
              >
                View Past Entries ({pastEntries.length})
              </Button>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6">
              {showPastEntries ? (
                <div className="space-y-4">
                  <h3 className="font-medium">Past Entries</h3>
                  {pastEntries.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No past entries found.</p>
                  ) : (
                    <div className="space-y-3">
                      {pastEntries.map((entry) => (
                        <div key={entry.id} className="p-3 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground mb-2">
                            {new Date(entry.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-sm">{entry.log}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Textarea
                  placeholder="What did you learn today? How did you feel? What did you accomplish?"
                  value={currentEntry}
                  onChange={(e) => setCurrentEntry(e.target.value)}
                  className="min-h-[400px] resize-none border-0 focus-visible:ring-0 text-sm"
                />
              )}
            </div>

            {/* Save Button */}
            <div className="p-6 border-t">
              {!showPastEntries && (
                <Button
                  onClick={handleSaveEntry}
                  className="w-full bg-white text-black hover:bg-gray-100 border border-gray-300"
                  disabled={!currentEntry.trim()}
                >
                  Save Entry
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
