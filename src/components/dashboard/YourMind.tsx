import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { BrainCircuit } from 'lucide-react';

interface NoteCounts {
    week: { short: number; long: number };
    month: { short: number; long: number };
    allTime: { short: number; long: number };
}

const YourMind = () => {
    const { user } = useAuth();
    const [topTags, setTopTags] = useState<string[]>([]);
    const [noteCounts, setNoteCounts] = useState<NoteCounts | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setIsLoading(true);

            const [tagsResponse, distributionResponse] = await Promise.all([
                supabase.from('top_tags_view').select('tag').limit(3),
                supabase.from('analytics_memory_distribution').select('st_7, lt_7, st_30, lt_30, st_all, lt_all').single()
            ]);

            if (tagsResponse.error) {
                console.error('Error fetching top tags:', tagsResponse.error);
                setTopTags([]);
            } else if (tagsResponse.data) {
                setTopTags(tagsResponse.data.map((item: { tag: string }) => item.tag));
            }

            if (distributionResponse.error) {
                console.error('Error fetching memory distribution:', distributionResponse.error);
                setNoteCounts(null);
            } else if (distributionResponse.data) {
                const data = distributionResponse.data;
                setNoteCounts({
                    week: { short: data.st_7 ?? 0, long: data.lt_7 ?? 0 },
                    month: { short: data.st_30 ?? 0, long: data.lt_30 ?? 0 },
                    allTime: { short: data.st_all ?? 0, long: data.lt_all ?? 0 },
                });
            }

            setIsLoading(false);
        };

        fetchData();
    }, [user]);

    const renderContent = () => {
        if (isLoading) {
            return <p className="text-center text-slate-400">Analyzing your mind...</p>;
        }

        const tagElements = topTags.length > 0 ? topTags.map((tag, index) => (
            <React.Fragment key={tag}>
                <strong className="font-semibold text-indigo-400">"{tag}"</strong>
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