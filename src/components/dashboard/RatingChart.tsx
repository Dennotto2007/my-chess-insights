import { ParsedGame } from '@/lib/types';
import { getRatingOverTime } from '@/lib/analysis';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface RatingChartProps {
  games: ParsedGame[];
}

export function RatingChart({ games }: RatingChartProps) {
  const data = getRatingOverTime(games);
  if (data.length < 2) return (
    <div className="stat-card h-72 flex items-center justify-center text-muted-foreground text-sm">
      Need at least 2 rated games to show rating chart
    </div>
  );

  const ratings = data.map(d => d.rating);
  const avg = Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length);
  const min = Math.min(...ratings);
  const max = Math.max(...ratings);

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title">Rating Over Time</h3>
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span>Low: {min}</span>
          <span>Avg: {avg}</span>
          <span>Peak: {max}</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} tickLine={false} axisLine={false} />
          <YAxis domain={[min - 20, max + 20]} tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} tickLine={false} axisLine={false} width={40} />
          <Tooltip
            contentStyle={{ background: 'hsl(222 41% 10%)', border: '1px solid hsl(222 30% 18%)', borderRadius: '8px', fontSize: '12px' }}
            labelStyle={{ color: 'hsl(213 31% 91%)' }}
          />
          <ReferenceLine y={avg} stroke="hsl(215 20% 55%)" strokeDasharray="3 3" strokeOpacity={0.4} />
          <Line
            type="monotone"
            dataKey="rating"
            stroke="hsl(43 96% 56%)"
            strokeWidth={2}
            dot={(props: any) => {
              const { cx, cy, payload } = props;
              const color = payload.result === 'win' ? 'hsl(152 69% 45%)' : payload.result === 'loss' ? 'hsl(0 72% 51%)' : 'hsl(215 20% 55%)';
              return <circle key={props.index} cx={cx} cy={cy} r={3} fill={color} stroke="none" />;
            }}
            activeDot={{ r: 5, fill: 'hsl(43 96% 56%)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
