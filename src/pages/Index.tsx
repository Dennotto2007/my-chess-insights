import { useState, useMemo, useCallback } from 'react';
import { parsePGN, deduplicateGames } from '@/lib/pgn-parser';
import { applyFilters } from '@/lib/analysis';
import { Filters, ParsedGame } from '@/lib/types';
import { SAMPLE_PGN } from '@/lib/sample-data';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { RatingChart } from '@/components/dashboard/RatingChart';
import { TimeControlChart } from '@/components/dashboard/TimeControlChart';
import { OpeningsTable } from '@/components/dashboard/OpeningsTable';
import { CoachingSection } from '@/components/dashboard/CoachingSection';
import { GameHistory } from '@/components/dashboard/GameHistory';
import { PGNImporter } from '@/components/dashboard/PGNImporter';
import { Button } from '@/components/ui/button';

const defaultFilters: Filters = {
  dateRange: [null, null],
  timeControls: [],
  color: 'both',
  result: 'all',
  opening: '',
  opponentRatingRange: [0, 4000],
  sampleSize: null,
};

export default function Index() {
  const [allGames, setAllGames] = useState<ParsedGame[]>([]);
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const handleImport = useCallback((pgn: string) => {
    const parsed = parsePGN(pgn);
    setAllGames(prev => deduplicateGames([...prev, ...parsed]));
  }, []);

  const loadSample = useCallback(() => {
    const parsed = parsePGN(SAMPLE_PGN);
    setAllGames(deduplicateGames(parsed));
  }, []);

  const filteredGames = useMemo(() => applyFilters(allGames, filters), [allGames, filters]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">♟</span>
            <div>
              <h1 className="text-xl font-heading font-bold tracking-tight">Chess Insights</h1>
              <p className="text-xs text-muted-foreground">Improvement dashboard for hobby players</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 rounded bg-secondary">Lichess / Chess.com import coming soon</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        {/* Import */}
        <PGNImporter onImport={handleImport} gameCount={allGames.length} />

        {allGames.length === 0 ? (
          <div className="stat-card flex flex-col items-center justify-center py-16 text-center">
            <span className="text-5xl mb-4">♔</span>
            <h2 className="text-lg font-heading font-semibold mb-2">No games loaded</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Upload your PGN files to see your performance stats, rating trends, opening analysis, and personalized coaching tips.
            </p>
            <Button onClick={loadSample} variant="outline" size="sm" className="text-xs">
              Load sample data (12 games)
            </Button>
          </div>
        ) : (
          <>
            <FilterBar filters={filters} onChange={setFilters} />
            <StatsOverview games={filteredGames} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <RatingChart games={filteredGames} />
              </div>
              <TimeControlChart games={filteredGames} />
            </div>

            <OpeningsTable games={filteredGames} />
            <GameHistory games={filteredGames} />
            <CoachingSection games={filteredGames} />
          </>
        )}
      </main>
    </div>
  );
}
