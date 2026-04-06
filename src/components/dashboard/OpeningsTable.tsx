import { ParsedGame } from '@/lib/types';
import { getOpeningStats } from '@/lib/analysis';
import { useState } from 'react';

interface OpeningsTableProps {
  games: ParsedGame[];
}

type SortKey = 'games' | 'winRate' | 'losses';

export function OpeningsTable({ games }: OpeningsTableProps) {
  const [view, setView] = useState<'most' | 'best' | 'worst' | 'lose-against'>('most');
  const allOpenings = getOpeningStats(games);

  let openings = [...allOpenings];
  const minGames = 2;

  switch (view) {
    case 'most': openings = openings.slice(0, 10); break;
    case 'best': openings = openings.filter(o => o.games >= minGames).sort((a, b) => b.winRate - a.winRate).slice(0, 10); break;
    case 'worst': openings = openings.filter(o => o.games >= minGames).sort((a, b) => a.winRate - b.winRate).slice(0, 10); break;
    case 'lose-against': openings = openings.filter(o => o.games >= minGames).sort((a, b) => b.losses - a.losses).slice(0, 10); break;
  }

  const tabs = [
    { key: 'most' as const, label: 'Most Played' },
    { key: 'best' as const, label: 'Best' },
    { key: 'worst' as const, label: 'Worst' },
    { key: 'lose-against' as const, label: 'Lose Against' },
  ];

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title">Openings</h3>
        <div className="flex gap-1">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setView(t.key)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                view === t.key ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {openings.length === 0 ? (
        <p className="text-sm text-muted-foreground">Not enough games with this filter</p>
      ) : (
        <div className="space-y-1">
          <div className="grid grid-cols-[1fr_60px_60px_60px_70px] gap-2 text-xs text-muted-foreground px-2 pb-1">
            <span>Opening</span><span className="text-center">Games</span><span className="text-center">W/D/L</span><span className="text-center">Score</span><span className="text-center">Perf</span>
          </div>
          {openings.map(o => (
            <div key={o.name} className="grid grid-cols-[1fr_60px_60px_60px_70px] gap-2 text-sm px-2 py-1.5 rounded-md hover:bg-secondary/50 transition-colors">
              <div className="truncate">
                <span className="text-xs text-muted-foreground mr-1.5">{o.eco}</span>
                {o.name}
              </div>
              <span className="text-center font-mono text-xs">{o.games}</span>
              <span className="text-center font-mono text-xs">
                <span className="win-text">{o.wins}</span>/{o.draws}/<span className="loss-text">{o.losses}</span>
              </span>
              <span className={`text-center font-mono text-xs font-medium ${o.winRate >= 55 ? 'win-text' : o.winRate <= 40 ? 'loss-text' : 'draw-text'}`}>
                {o.winRate.toFixed(0)}%
              </span>
              <span className="text-center font-mono text-xs">{o.performanceRating || '—'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
