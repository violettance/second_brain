import { ResponsiveCalendar } from '@nivo/calendar';
import { supabase } from '../../../lib/supabase';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { logger } from '../../../lib/logger';

type HeatmapData = {
  day: string;
  value: number;
};

export const ActivityHeatmap = () => {
  const { user } = useAuth();
  const [data, setData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      const { data: rawData, error } = await supabase
        .from('v2_daily_note_counts')
        .select('note_date, total_count')
        .eq('user_id', user.id)
        .gte('note_date', '2025-01-01')
        .lte('note_date', '2025-12-31');
      
      if (error) {
        logger.error('Error fetching heatmap data', { error: error.message });
        setData([]);
      } else {
        // The query returns { note_date: 'YYYY-MM-DD', total_count: number }
        // Nivo needs { day: 'YYYY-MM-DD', value: number }
        const formattedData = rawData
          .map((d: { note_date: string; total_count: number }) => ({
            day: d.note_date,
            value: d.total_count,
          }))
          .filter((d: { value: number }) => d.value > 0); // Filter out days with 0 contributions
        setData(formattedData);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 h-full flex items-center justify-center">
        <p className="text-slate-400">Loading Activity Data...</p>
      </div>
    );
  }

  const today = new Date();
  const fromDate = new Date(today.getFullYear(), 0, 1);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 h-[280px] flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Activity Heatmap</h2>
          <p className="text-slate-400 text-sm">Your contribution history for 2025.</p>
        </div>
      </div>
      <div className="flex-1">
        {data.length > 0 ? (
          <ResponsiveCalendar
            data={data}
            from="2025-01-01"
            to="2025-12-31"
            emptyColor="#2d3748" // slate-800
            colors={['#f3e8ff', '#d8b4fe', '#a855f7', '#7e22ce']} // purple-100 to purple-700
            margin={{ top: 20, right: 20, bottom: 0, left: 0 }}
            yearSpacing={0}
            monthBorderColor="#475569" // slate-600
            dayBorderWidth={2}
            dayBorderColor="#1e293b" // slate-800
            theme={{
              tooltip: {
                container: {
                  background: '#0f172a', // slate-900
                  color: '#f1f5f9', // slate-100
                  border: '1px solid #334155' // slate-700
                },
              },
              labels: {
                  text: {
                      fill: '#94a3b8' // slate-400
                  }
              }
            }}
            legends={[
              {
                anchor: 'bottom-right',
                direction: 'row',
                translateY: 20,
                itemCount: 4,
                itemWidth: 42,
                itemHeight: 36,
                itemsSpacing: 14,
                itemDirection: 'right-to-left',
                symbolSize: 20,
                itemTextColor: '#94a3b8'
              },
            ]}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-slate-500">No activity recorded for 2025.</p>
          </div>
        )}
      </div>
    </div>
  );
};
