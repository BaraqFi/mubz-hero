'use client';

import { useEffect, useState } from 'react';
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
  // Lock body scroll when panel is open
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalStyle;
    }
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);

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
    if (session) {
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
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" 
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Log Your Thoughts</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Date and View Past Entries */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">
                  {formattedDate} - {showPastEntries ? 'Past Entries' : 'New Entry'}
                </span>
                <Button
                  variant="link"
                  size="sm"
                  onClick={loadPastEntries}
                  className="text-primary p-0 h-auto"
                >
                  {showPastEntries ? 'New Entry' : `View Past (${pastEntries.length})`}
                </Button>
              </div>

              {showPastEntries ? (
                <div className="space-y-4">
                  {pastEntries.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">No past entries found.</p>
                  ) : (
                    <div className="space-y-3">
                      {pastEntries.map((entry) => (
                        <div key={entry.id} className="p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1.5">
                            {new Date(entry.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                          <p className="text-sm whitespace-pre-wrap">{entry.log}</p>
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
                  className="h-full w-full resize-none border-0 focus-visible:ring-0 text-base p-0"
                />
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t">
              {!showPastEntries && (
                <Button
                  onClick={handleSaveEntry}
                  className="w-full"
                  disabled={!currentEntry.trim()}
                >
                  Save Entry
                </Button>
              )}
               {showPastEntries && (
                <Button
                  onClick={() => setShowPastEntries(false)}
                  className="w-full"
                >
                  Back to New Entry
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
