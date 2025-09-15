import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { logger } from '../../lib/logger';
import { useAuth } from '../../contexts/AuthContext';
import { BrainCircuit } from 'lucide-react';

interface NoteCounts {
    week: { short: number; long: number };
    month: { short: number; long: number };
    allTime: { short: number; long: number };
}

const YourMind = () => {
    const { user } = useAuth();
    const [topTags, setTopTags] = useState<{ tag: string; usage_count: number }[]>([]);
    const [noteCounts, setNoteCounts] = useState<NoteCounts | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setIsLoading(true);

            try {
                const [tagsResponse, distributionResponse] = await Promise.all([
                    supabase.from('v2_top_tags_view').select('tag, usage_count').eq('user_id', user.id).limit(3),
                    supabase.from('v2_analytics_memory_distribution_bars').select('st_7, lt_7, st_30, lt_30, st_all, lt_all').eq('user_id', user.id).maybeSingle()
                ]);

            if (tagsResponse.error) {
                logger.error('Failed to fetch top tags', { error: tagsResponse.error });
                setTopTags([]);
            } else if (tagsResponse.data) {
                setTopTags(tagsResponse.data.map((item: { tag: string; usage_count: number }) => ({ tag: item.tag, usage_count: item.usage_count })));
            }

            if (distributionResponse.error) {
                logger.error('Failed to fetch memory distribution', { 
                    error: distributionResponse.error,
                    userId: user.id,
                    table: 'v2_analytics_memory_distribution_bars'
                });
                setNoteCounts(null);
            } else if (distributionResponse.data) {
                const data = distributionResponse.data;
                setNoteCounts({
                    week: { short: data.st_7 ?? 0, long: data.lt_7 ?? 0 },
                    month: { short: data.st_30 ?? 0, long: data.lt_30 ?? 0 },
                    allTime: { short: data.st_all ?? 0, long: data.lt_all ?? 0 },
                });
            }
            } catch (error) {
                logger.error('Failed to fetch dashboard data', { 
                    error, 
                    userId: user.id,
                    component: 'YourMind'
                });
                // Set fallback values
                setTopTags([]);
                setNoteCounts(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const renderContent = () => {
        if (isLoading) {
            return <p className="text-center text-slate-400">Analyzing your mind...</p>;
        }

        const tagElements = topTags.length > 0 ? topTags.map((tagObj, index) => (
            <React.Fragment key={tagObj.tag}>
                <strong className="font-semibold text-indigo-400">"{tagObj.tag}"</strong>
                {index < topTags.length - 2 ? ', ' : (index === topTags.length - 2 ? ' and ' : '')}
            </React.Fragment>
        )) : null;

        return (
            <div className="space-y-3 text-slate-300">
                {tagElements ? (
                    <p className="text-base">
                        You have thought most about {tagElements}.
                    </p>
                ) : (
                    <p className="text-slate-500">You haven't thought about anything specific yet. Start tagging your notes!</p>
                )}
                
                {noteCounts && (
                     <p className="text-base">
                        Over the last 7 days, you've written <strong className="text-orange-300">{noteCounts.week.short}</strong> short-term and <strong className="text-green-300">{noteCounts.week.long}</strong> long-term notes. This month, it's <strong className="text-orange-300">{noteCounts.month.short}</strong> short-term and <strong className="text-green-300">{noteCounts.month.long}</strong> long-term. In total, you have <strong className="text-orange-300">{noteCounts.allTime.short}</strong> short-term and <strong className="text-green-300">{noteCounts.allTime.long}</strong> long-term notes.
                     </p>
                )}
            </div>
        );
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mt-6">
            <div className="flex items-center mb-4">
                <BrainCircuit className="h-6 w-6 text-indigo-400 mr-3" />
                <h3 className="text-xl font-bold text-white">Your Mind</h3>
            </div>
            {renderContent()}
        </div>
    );
};

export default YourMind; 