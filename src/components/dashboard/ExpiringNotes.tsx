import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { AlertTriangle, Clock } from 'lucide-react';
import { DailyNote } from '../../types/database';
import { logger } from '../../lib/logger';

const ExpiringNotes = () => {
  const { user } = useAuth();
  const [expiringNotes, setExpiringNotes] = useState<DailyNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getDaysRemaining = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    // Use 2025 as the current year for demo purposes
    now.setFullYear(2025);
    const diffTime = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, 30 - diffDays);
  };

  useEffect(() => {
    const fetchExpiringNotes = async () => {
      if (!user) return;
      setIsLoading(true);

      // Fetch all non-archived short-term notes
      const { data, error } = await supabase
        .from('short_term_notes')
        .select('*')
        .eq('user_id', user.id)
        .is('archived_at', null)
        .order('created_at', { ascending: true });

      if (error) {
        logger.error("Error fetching short-term notes", { error: error.message });
        setExpiringNotes([]);
      } else {
        // Filter for notes expiring in 5 days or less
        const filteredNotes = data.filter((note: { created_at: string, note_date?: string }) => {
          const daysLeft = getDaysRemaining(note.note_date || note.created_at);
          return daysLeft <= 5;
        });
        setExpiringNotes(filteredNotes);
      }
      setIsLoading(false);
    };

    fetchExpiringNotes();
  }, [user]);

  if (isLoading) {
    return (
      <div className="bg-surface p-6 rounded-lg animate-pulse h-chart-compact">
        <div className="h-5 bg-surface-muted rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-surface-muted rounded w-full mb-2"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface  border border-ink rounded-xl p-6 h-full">
      <div className="flex items-center mb-4">
        <AlertTriangle className="h-6 w-6 text-brand-primary-deep mr-3" />
        <h3 className="text-xl font-bold text-ink">Expiring Notes</h3>
      </div>
      {expiringNotes.length > 0 ? (
        <ul className="space-y-3">
          {expiringNotes.slice(0, 3).map(note => {
            const daysLeft = getDaysRemaining(note.note_date || note.created_at);
            return (
              <li key={note.id} className="bg-surface p-3 rounded-lg flex items-center justify-between transition-colors hover:bg-surface-muted">
                <p className="text-sm text-muted truncate pr-4">{note.title}</p>
                <div className="flex items-center text-xs flex-shrink-0">
                  <Clock className="h-4 w-4 mr-1.5 text-brand-primary-deep" />
                  <span className="font-semibold text-brand-primary-deep">
                    {daysLeft > 0 ? `${daysLeft}d left` : 'Today'}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center text-center h-full -mt-8">
          <Clock className="h-10 w-10 text-brand-secondary-deep mb-3" />
          <h3 className="text-lg font-bold text-ink">All Good!</h3>
          <p className="text-sm text-muted">No short-term notes are expiring soon.</p>
        </div>
      )}
    </div>
  );
};

export default ExpiringNotes;
