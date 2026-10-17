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
      <div className="bg-surface  border border-ink rounded-xl p-6 h-full flex items-center justify-center">
        <p className="text-muted">Loading Activity Data...</p>
      </div>
    );
  }

  const today = new Date();
  const fromDate = new Date(today.getFullYear(), 0, 1);

  return (
    <div className="bg-surface border border-ink rounded-xl p-6 h-chart-medium flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold text-ink mb-1">Activity Heatmap</h2>
          <p className="text-muted text-sm">Your contribution history for 2025.</p>
        </div>
      </div>
      <div className="flex-1">
        {data.length > 0 ? (
          <ResponsiveCalendar
            data={data}
            from="2025-01-01"
            to="2025-12-31"
            emptyColor="var(--color-surface-muted)" // slate-800
            colors={['var(--color-brand-purple-soft)', 'var(--color-brand-purple)', 'var(--color-brand-purple)', 'var(--color-brand-purple)']} // purple-100 to purple-700
            margin={{ top: 20, right: 20, bottom: 0, left: 0 }}
            yearSpacing={0}
            monthBorderColor="var(--color-neutral-strong)" // slate-600
            dayBorderWidth={2}
            dayBorderColor="var(--color-brand-dark)" // slate-800
            theme={{
              tooltip: {
                container: {
                  background: 'var(--color-canvas)', // slate-900
                  color: 'var(--color-surface-subtle)', // slate-100
                  border: 'var(--border-width-thin) solid var(--color-brand-dark)'
                },
              },
              labels: {
                  text: {
                      fill: 'var(--color-neutral-muted)' // slate-400
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
                itemTextColor: 'var(--color-neutral-muted)'
              },
            ]}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-muted">No activity recorded for 2025.</p>
          </div>
        )}
      </div>
    </div>
  );
};
