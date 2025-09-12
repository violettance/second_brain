import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Fingerprint } from 'lucide-react';
import { logger } from '../../lib/logger';

interface NoteDNA {
  topTag: { name: string; count: number } | null;
  counts: {
    week: { short: number; long: number };
    month: { short: number; long: number };
    allTime: { short: number; long: number };
  };
}

const EmergingTopics = () => {
    const { user } = useAuth();
    const [dna, setDna] = useState<NoteDNA | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getNoteDNA = async () => {
            if (!user) return;
            setIsLoading(true);

            const now = new Date('2025-06-24T10:00:00Z');
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            
            const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ...
            const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday
            const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diff).toISOString();

            const [
                stTagsData, ltTagsData,
                stWeekCount, stMonthCount, stAllCount,
                ltWeekCount, ltMonthCount, ltAllCount
            ] = await Promise.all([
                supabase.from('short_term_notes').select('tags').eq('user_id', user.id).is('archived_at', null),
                supabase.from('long_term_notes').select('tags').eq('user_id', user.id),
                supabase.from('short_term_notes').select('id', { count: 'exact', head: true }).eq('user_id', user.id).is('archived_at', null).gte('created_at', startOfWeek),
                supabase.from('short_term_notes').select('id', { count: 'exact', head: true }).eq('user_id', user.id).is('archived_at', null).gte('created_at', startOfMonth),
                supabase.from('short_term_notes').select('id', { count: 'exact', head: true }).eq('user_id', user.id).is('archived_at', null),
                supabase.from('long_term_notes').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', startOfWeek),
                supabase.from('long_term_notes').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', startOfMonth),
                supabase.from('long_term_notes').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
            ]);

            if (stTagsData.error) {
                 logger.error("Error fetching note DNA", { error: stTagsData.error.message });
                 setIsLoading(false);
                 return;
            }

            const allTags = [...(stTagsData.data || []), ...(ltTagsData.data || [])]
                .flatMap((item: { tags: string[] }) => item.tags || []);
            
            const tagCounts = allTags.reduce((acc, tag) => {
                acc[tag] = (acc[tag] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const sortedTags = Object.entries(tagCounts).sort(([, a], [, b]) => (b as number) - (a as number));
            const topTag = sortedTags.length > 0 ? { name: sortedTags[0][0], count: sortedTags[0][1] } : null;
            
            setDna({
                topTag,
                counts: {
                    week: { short: stWeekCount.count || 0, long: ltWeekCount.count || 0 },
                    month: { short: stMonthCount.count || 0, long: ltMonthCount.count || 0 },
                    allTime: { short: stAllCount.count || 0, long: ltAllCount.count || 0 },
                }
            });

            setIsLoading(false);
        };
        
        getNoteDNA();
    }, [user]);
    
    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center text-slate-400">Analyzing your notes...</div>;
        }

        if (!dna) {
            return <p className="text-center text-slate-400">Start writing to see your note DNA.</p>;
        }
        
        return (
            <div className="space-y-3 text-slate-300">
                {dna.topTag ? (
                    <p className="text-base">
                        Your most frequent tag is <strong className="font-semibold text-indigo-400">"{dna.topTag.name}"</strong>, used <strong className="font-semibold text-indigo-400">{dna.topTag.count}</strong> times.
                    </p>
                ) : (
                    <p className="text-base text-slate-500">You haven't used any tags yet.</p>
                )}
                 <p className="text-base">
                    This month you created <strong className="text-cyan-400">{dna.counts.month.short} ST</strong> & <strong className="text-green-400">{dna.counts.month.long} LT</strong> notes; this week <strong className="text-cyan-400">{dna.counts.week.short} ST</strong> & <strong className="text-green-400">{dna.counts.week.long} LT</strong>; and <strong className="text-cyan-400">{dna.counts.allTime.short} ST</strong> & <strong className="text-green-400">{dna.counts.allTime.long} LT</strong> in total.
                </p>
            </div>
        );
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center mb-4">
                <Fingerprint className="h-6 w-6 text-indigo-400 mr-3" />
                <h3 className="text-xl font-bold text-white">Your Note DNA</h3>
            </div>
            {renderContent()}
        </div>
    );
};

export default EmergingTopics; 