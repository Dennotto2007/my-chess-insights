import { ParsedGame } from '@/lib/types';
import { getWDL, getWDLByColor } from '@/lib/analysis';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsOverviewProps {
  games: ParsedGame[];
}

export function StatsOverview({ games }: StatsOverviewProps) {
  const wdl = getWDL(games);
  const byColor = getWDLByColor(games);
  const winRate = wdl.total > 0 ? ((wdl.wins + wdl.draws * 0.5) / wdl.total * 100).toFixed(1) : '0';

  const rated = games.filter(g => g.playerElo).sort((a, b) => (a.dateObj?.getTime() ?? 0) - (b.dateObj?.getTime() ?? 0));
  const currentRating = rated.length > 0 ? rated[rated.length - 1].playerElo : null;
  const firstRating = rated.length > 1 ? rated[0].playerElo : null;
  const ratingChange = currentRating && firstRating ? currentRating - firstRating : null;

  const stats = [
    { label: 'Total Games', value: wdl.total, sub: null },
    { label: 'Win Rate', value: `${winRate}%`, sub: null },
    { label: 'Current Rating', value: currentRating ?? '—', sub: ratingChange !== null ? `${ratingChange >= 0 ? '+' : ''}${ratingChange}` : null },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map(s => (
        <div key={s.label} className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
          <p className="text-2xl font-bold font-heading">{s.value}</p>
          {s.sub && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${
              s.sub.startsWith('+') ? 'win-text' : s.sub.startsWith('-') ? 'loss-text' : 'draw-text'
            }`}>
              {s.sub.startsWith('+') ? <TrendingUp className="h-3 w-3" /> : s.sub.startsWith('-') ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
              {s.sub}
            </p>
          )}
        </div>
      ))}

      {/* W/D/L Card */}
      <div className="stat-card">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">W / D / L</p>
        <div className="flex items-baseline gap-2 text-2xl font-bold font-heading">
          <span className="win-text">{wdl.wins}</span>
          <span className="text-muted-foreground text-lg">/</span>
          <span className="draw-text">{wdl.draws}</span>
          <span className="text-muted-foreground text-lg">/</span>
          <span className="loss-text">{wdl.losses}</span>
        </div>
        {wdl.total > 0 && (
          <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden flex">
            <div className="win-bg h-full" style={{ width: `${(wdl.wins / wdl.total) * 100}%` }} />
            <div className="draw-bg h-full" style={{ width: `${(wdl.draws / wdl.total) * 100}%` }} />
            <div className="loss-bg h-full" style={{ width: `${(wdl.losses / wdl.total) * 100}%` }} />
          </div>
        )}
      </div>

      {/* Color performance */}
      <div className="stat-card">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">White vs Black</p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span>♔ White</span>
            <span className="font-mono text-xs">
              <span className="win-text">{byColor.white.wins}</span>
              <span className="text-muted-foreground"> / {byColor.white.draws} / </span>
              <span className="loss-text">{byColor.white.losses}</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>♚ Black</span>
            <span className="font-mono text-xs">
              <span className="win-text">{byColor.black.wins}</span>
              <span className="text-muted-foreground"> / {byColor.black.draws} / </span>
              <span className="loss-text">{byColor.black.losses}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
