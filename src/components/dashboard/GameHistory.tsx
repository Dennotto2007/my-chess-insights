import { useState } from 'react';
import { ParsedGame } from '@/lib/types';
import { GameReplay } from './GameReplay';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface GameHistoryProps {
  games: ParsedGame[];
}

function resultBadge(game: ParsedGame) {
  const cls =
    game.playerResult === 'win' ? 'win-bg text-background' :
    game.playerResult === 'loss' ? 'loss-bg text-background' :
    game.playerResult === 'draw' ? 'draw-bg text-background' :
    'bg-muted text-muted-foreground';
  const label =
    game.playerResult === 'win' ? 'W' :
    game.playerResult === 'loss' ? 'L' :
    game.playerResult === 'draw' ? 'D' : '?';
  return <span className={`inline-flex items-center justify-center w-7 h-7 rounded text-xs font-bold ${cls}`}>{label}</span>;
}

function tcLabel(tc: string, category: string): string {
  if (category === 'unknown') return tc || '—';
  const catLabels: Record<string, string> = {
    bullet: '🔫 Bullet', blitz: '⚡ Blitz', rapid: '🕐 Rapid',
    classical: '♟ Classical', correspondence: '📧 Corr.',
  };
  return catLabels[category] || category;
}

function moveCount(moves: string): number {
  const nums = moves.match(/\d+\./g);
  return nums ? nums.length : 0;
}

export function GameHistory({ games }: GameHistoryProps) {
  const [replayGame, setReplayGame] = useState<ParsedGame | null>(null);
  const [visibleCount, setVisibleCount] = useState(25);

  const sorted = [...games].sort((a, b) => {
    if (a.dateObj && b.dateObj) return b.dateObj.getTime() - a.dateObj.getTime();
    return 0;
  });

  const visible = sorted.slice(0, visibleCount);

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">Game History</h2>
        <span className="text-xs text-muted-foreground">{games.length} games</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="pb-2 pr-3 font-medium">Players</th>
              <th className="pb-2 px-3 font-medium">Result</th>
              <th className="pb-2 px-3 font-medium">Opening</th>
              <th className="pb-2 px-3 font-medium">Time</th>
              <th className="pb-2 px-3 font-medium text-center">Moves</th>
              <th className="pb-2 px-3 font-medium">Date</th>
              <th className="pb-2 pl-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {visible.map(game => (
              <tr key={game.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                {/* Players */}
                <td className="py-3 pr-3">
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-xs ${game.playerColor === 'white' ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                      <span className="inline-block w-3 h-3 rounded-sm bg-white border border-border mr-1.5 align-middle" />
                      {game.white}
                      {game.whiteElo && <span className="text-muted-foreground ml-1">({game.whiteElo})</span>}
                    </span>
                    <span className={`text-xs ${game.playerColor === 'black' ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                      <span className="inline-block w-3 h-3 rounded-sm bg-zinc-800 border border-border mr-1.5 align-middle" />
                      {game.black}
                      {game.blackElo && <span className="text-muted-foreground ml-1">({game.blackElo})</span>}
                    </span>
                  </div>
                </td>
                {/* Result */}
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col text-xs font-mono leading-tight">
                      <span>{game.result === '1-0' || game.result === '1/2-1/2' ? (game.result === '1/2-1/2' ? '½' : '1') : '0'}</span>
                      <span>{game.result === '0-1' || game.result === '1/2-1/2' ? (game.result === '1/2-1/2' ? '½' : '1') : '0'}</span>
                    </div>
                    {resultBadge(game)}
                  </div>
                </td>
                {/* Opening */}
                <td className="py-3 px-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-foreground truncate max-w-[180px]" title={game.opening}>
                      {game.opening}
                    </span>
                    {game.eco && <span className="text-[10px] text-muted-foreground">{game.eco}</span>}
                  </div>
                </td>
                {/* Time Control */}
                <td className="py-3 px-3">
                  <span className="text-xs text-muted-foreground">{tcLabel(game.timeControl, game.timeControlCategory)}</span>
                </td>
                {/* Moves */}
                <td className="py-3 px-3 text-center">
                  <span className="text-xs text-muted-foreground">{moveCount(game.moves)}</span>
                </td>
                {/* Date */}
                <td className="py-3 px-3">
                  <span className="text-xs text-muted-foreground">
                    {game.dateObj ? game.dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : game.date || '—'}
                  </span>
                </td>
                {/* Replay */}
                <td className="py-3 pl-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 px-3"
                    onClick={() => setReplayGame(game)}
                  >
                    Replay
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visibleCount < sorted.length && (
        <div className="flex justify-center mt-4">
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setVisibleCount(c => c + 25)}>
            Show more ({sorted.length - visibleCount} remaining)
          </Button>
        </div>
      )}

      {replayGame && (
        <GameReplay game={replayGame} onClose={() => setReplayGame(null)} />
      )}
    </div>
  );
}
