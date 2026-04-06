import { ParsedGame } from '@/lib/types';
import { getTimeControlBreakdown } from '@/lib/analysis';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['hsl(0 72% 51%)', 'hsl(43 96% 56%)', 'hsl(152 69% 45%)', 'hsl(199 89% 48%)', 'hsl(280 65% 60%)', 'hsl(215 20% 55%)'];

interface TimeControlChartProps {
  games: ParsedGame[];
}

export function TimeControlChart({ games }: TimeControlChartProps) {
  const data = getTimeControlBreakdown(games);

  return (
    <div className="stat-card">
      <h3 className="section-title mb-4">Time Controls</h3>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={120} height={120}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" stroke="none">
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: 'hsl(222 41% 10%)', border: '1px solid hsl(222 30% 18%)', borderRadius: '8px', fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-1.5">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="capitalize">{d.name}</span>
              </div>
              <span className="font-mono text-xs text-muted-foreground">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
