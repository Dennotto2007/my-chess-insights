import { ParsedGame } from '@/lib/types';
import { getWDL, getWDLByColor } from '@/lib/analysis';
import { TrendingUp, TrendingDown, Minus, Trophy, Flame, Calendar, BarChart3, Users } from 'lucide-react';

interface StatsOverviewProps {
  games: ParsedGame[];
}

function computeExtendedStats(games: ParsedGame[]) {
  const wdl = getWDL(games);
  const byColor = getWDLByColor(games);
  const winRate = wdl.total > 0 ? ((wdl.wins + wdl.draws * 0.5) / wdl.total * 100).toFixed(1) : '0';

  const rated = games.filter(g => g.playerElo).sort((a, b) => (a.dateObj?.getTime() ?? 0) - (b.dateObj?.getTime() ?? 0));
  const currentRating = rated.length > 0 ? rated[rated.length - 1].playerElo : null;
  const firstRating = rated.length > 1 ? rated[0].playerElo : null;
  const ratingChange = currentRating && firstRating ? currentRating - firstRating : null;
  const highestRating = rated.length > 0 ? Math.max(...rated.map(g => g.playerElo!)) : null;

  // Average opponent rating
  const withOpp = games.filter(g => g.opponentElo);
  const avgOppRating = withOpp.length > 0 ? Math.round(withOpp.reduce((s, g) => s + g.opponentElo!, 0) / withOpp.length) : null;

  // Avg opp when win/draw/loss
  const avgOppWin = withOpp.filter(g => g.playerResult === 'win');
  const avgOppDraw = withOpp.filter(g => g.playerResult === 'draw');
  const avgOppLoss = withOpp.filter(g => g.playerResult === 'loss');
  const avgOppRatingWin = avgOppWin.length > 0 ? Math.round(avgOppWin.reduce((s, g) => s + g.opponentElo!, 0) / avgOppWin.length) : null;
  const avgOppRatingDraw = avgOppDraw.length > 0 ? Math.round(avgOppDraw.reduce((s, g) => s + g.opponentElo!, 0) / avgOppDraw.length) : null;
  const avgOppRatingLoss = avgOppLoss.length > 0 ? Math.round(avgOppLoss.reduce((s, g) => s + g.opponentElo!, 0) / avgOppLoss.length) : null;

  // Best win (highest opponent rating defeated)
  const wins = games.filter(g => g.playerResult === 'win' && g.opponentElo);
  const bestWin = wins.length > 0 ? wins.reduce((best, g) => g.opponentElo! > best.opponentElo! ? g : best) : null;

  // Best win streak
  let bestStreak = 0, currentStreak = 0;
  const sorted = [...games].sort((a, b) => (a.dateObj?.getTime() ?? 0) - (b.dateObj?.getTime() ?? 0));
  for (const g of sorted) {
    if (g.playerResult === 'win') { currentStreak++; bestStreak = Math.max(bestStreak, currentStreak); }
    else currentStreak = 0;
  }

  // Games by day/week/month/year
  const byDay: Record<string, number> = {};
  const byWeek: Record<string, number> = {};
  const byMonth: Record<string, number> = {};
  const byYear: Record<string, number> = {};

  for (const g of games) {
    if (!g.dateObj) continue;
    const d = g.dateObj;
    const dayKey = d.toISOString().slice(0, 10);
    byDay[dayKey] = (byDay[dayKey] || 0) + 1;

    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const weekKey = weekStart.toISOString().slice(0, 10);
    byWeek[weekKey] = (byWeek[weekKey] || 0) + 1;

    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;

    const yearKey = `${d.getFullYear()}`;
    byYear[yearKey] = (byYear[yearKey] || 0) + 1;
  }

  const maxEntry = (map: Record<string, number>) => {
    let maxK = '', maxV = 0;
    for (const [k, v] of Object.entries(map)) { if (v > maxV) { maxV = v; maxK = k; } }
    return { key: maxK, count: maxV };
  };

  const mostDay = maxEntry(byDay);
  const mostWeek = maxEntry(byWeek);
  const mostMonth = maxEntry(byMonth);
  const mostYear = maxEntry(byYear);

  // Format month name
  const formatMonth = (key: string) => {
    if (!key) return '—';
    const [y, m] = key.split('-');
    const d = new Date(parseInt(y), parseInt(m) - 1);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const formatWeek = (key: string) => {
    if (!key) return '—';
    const d = new Date(key);
    return `Week of ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const formatDay = (key: string) => {
    if (!key) return '—';
    const d = new Date(key);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return {
    wdl, byColor, winRate, currentRating, ratingChange, highestRating,
    avgOppRating, avgOppRatingWin, avgOppRatingDraw, avgOppRatingLoss,
    bestWin, bestStreak,
    mostDay: { ...mostDay, label: formatDay(mostDay.key) },
    mostWeek: { ...mostWeek, label: formatWeek(mostWeek.key) },
    mostMonth: { ...mostMonth, label: formatMonth(mostMonth.key) },
    mostYear: { ...mostYear, label: mostYear.key || '—' },
  };
}

export function StatsOverview({ games }: StatsOverviewProps) {
  const s = computeExtendedStats(games);

  return (
    <div className="space-y-4">
      {/* Row 1: Core stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Games</p>
          <p className="text-2xl font-bold font-heading">{s.wdl.total}</p>
        </div>

        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Win Rate</p>
          <p className="text-2xl font-bold font-heading">{s.winRate}%</p>
        </div>

        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Current Rating</p>
          <p className="text-2xl font-bold font-heading">{s.currentRating ?? '—'}</p>
          {s.ratingChange !== null && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${s.ratingChange >= 0 ? 'win-text' : 'loss-text'}`}>
              {s.ratingChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {s.ratingChange >= 0 ? '+' : ''}{s.ratingChange}
            </p>
          )}
        </div>

        {/* W/D/L */}
        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">W / D / L</p>
          <div className="flex items-baseline gap-2 text-2xl font-bold font-heading">
            <span className="win-text">{s.wdl.wins}</span>
            <span className="text-muted-foreground text-lg">/</span>
            <span className="draw-text">{s.wdl.draws}</span>
            <span className="text-muted-foreground text-lg">/</span>
            <span className="loss-text">{s.wdl.losses}</span>
          </div>
          {s.wdl.total > 0 && (
            <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden flex">
              <div className="win-bg h-full" style={{ width: `${(s.wdl.wins / s.wdl.total) * 100}%` }} />
              <div className="draw-bg h-full" style={{ width: `${(s.wdl.draws / s.wdl.total) * 100}%` }} />
              <div className="loss-bg h-full" style={{ width: `${(s.wdl.losses / s.wdl.total) * 100}%` }} />
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
                <span className="win-text">{s.byColor.white.wins}</span>
                <span className="text-muted-foreground"> / {s.byColor.white.draws} / </span>
                <span className="loss-text">{s.byColor.white.losses}</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>♚ Black</span>
              <span className="font-mono text-xs">
                <span className="win-text">{s.byColor.black.wins}</span>
                <span className="text-muted-foreground"> / {s.byColor.black.draws} / </span>
                <span className="loss-text">{s.byColor.black.losses}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Extended stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Highest Rating */}
        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Highest Rating</p>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold font-heading">{s.highestRating ?? '—'}</span>
          </div>
        </div>

        {/* Avg Opponent Rating */}
        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Avg Opponent Rating</p>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-2xl font-bold font-heading">{s.avgOppRating ?? '—'}</span>
          </div>
          {(s.avgOppRatingWin || s.avgOppRatingLoss) && (
            <div className="flex gap-3 mt-2 text-xs">
              {s.avgOppRatingWin && <span className="win-text">W: {s.avgOppRatingWin}</span>}
              {s.avgOppRatingDraw && <span className="draw-text">D: {s.avgOppRatingDraw}</span>}
              {s.avgOppRatingLoss && <span className="loss-text">L: {s.avgOppRatingLoss}</span>}
            </div>
          )}
        </div>

        {/* Best Win */}
        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Best Win</p>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold font-heading">{s.bestWin?.opponentElo ?? '—'}</span>
          </div>
          {s.bestWin && (
            <p className="text-xs win-text mt-1">
              vs {s.bestWin.playerColor === 'white' ? s.bestWin.black : s.bestWin.white}
            </p>
          )}
        </div>

        {/* Best Win Streak */}
        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Best Win Streak</p>
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-destructive" />
            <span className="text-2xl font-bold font-heading">{s.bestStreak}</span>
          </div>
        </div>
      </div>

      {/* Row 3: Activity stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Most in a Day</p>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-xl font-bold font-heading">{s.mostDay.count || '—'}</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">{s.mostDay.label}</p>
        </div>

        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Most in a Week</p>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-xl font-bold font-heading">{s.mostWeek.count || '—'}</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">{s.mostWeek.label}</p>
        </div>

        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Most in a Month</p>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-xl font-bold font-heading">{s.mostMonth.count || '—'}</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">{s.mostMonth.label}</p>
        </div>

        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Most in a Year</p>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-xl font-bold font-heading">{s.mostYear.count || '—'}</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">{s.mostYear.label}</p>
        </div>
      </div>
    </div>
  );
}
