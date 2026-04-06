import { ParsedGame, OpeningStats, Filters, TimeControlCategory } from './types';

export function applyFilters(games: ParsedGame[], filters: Filters): ParsedGame[] {
  let filtered = [...games];

  if (filters.dateRange[0]) {
    filtered = filtered.filter(g => g.dateObj && g.dateObj >= filters.dateRange[0]!);
  }
  if (filters.dateRange[1]) {
    filtered = filtered.filter(g => g.dateObj && g.dateObj <= filters.dateRange[1]!);
  }
  if (filters.timeControls.length > 0) {
    filtered = filtered.filter(g => filters.timeControls.includes(g.timeControlCategory));
  }
  if (filters.color !== 'both') {
    filtered = filtered.filter(g => g.playerColor === filters.color);
  }
  if (filters.result !== 'all') {
    filtered = filtered.filter(g => g.playerResult === filters.result);
  }
  if (filters.opening) {
    filtered = filtered.filter(g =>
      g.opening.toLowerCase().includes(filters.opening.toLowerCase()) ||
      g.eco.toLowerCase().includes(filters.opening.toLowerCase())
    );
  }
  if (filters.opponentRatingRange[0] > 0) {
    filtered = filtered.filter(g => g.opponentElo && g.opponentElo >= filters.opponentRatingRange[0]);
  }
  if (filters.opponentRatingRange[1] < 4000) {
    filtered = filtered.filter(g => g.opponentElo && g.opponentElo <= filters.opponentRatingRange[1]);
  }
  if (filters.sampleSize && filters.sampleSize > 0) {
    filtered = filtered.slice(-filters.sampleSize);
  }

  return filtered;
}

export function getWDL(games: ParsedGame[]) {
  const wins = games.filter(g => g.playerResult === 'win').length;
  const draws = games.filter(g => g.playerResult === 'draw').length;
  const losses = games.filter(g => g.playerResult === 'loss').length;
  return { wins, draws, losses, total: games.length };
}

export function getWDLByColor(games: ParsedGame[]) {
  const white = games.filter(g => g.playerColor === 'white');
  const black = games.filter(g => g.playerColor === 'black');
  return { white: getWDL(white), black: getWDL(black) };
}

export function getTimeControlBreakdown(games: ParsedGame[]) {
  const map: Record<TimeControlCategory, number> = {
    bullet: 0, blitz: 0, rapid: 0, classical: 0, correspondence: 0, unknown: 0,
  };
  games.forEach(g => map[g.timeControlCategory]++);
  return Object.entries(map).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
}

export function getRatingOverTime(games: ParsedGame[]) {
  return games
    .filter(g => g.dateObj && g.playerElo)
    .sort((a, b) => a.dateObj!.getTime() - b.dateObj!.getTime())
    .map((g, i) => ({
      index: i,
      date: g.dateObj!.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      rating: g.playerElo!,
      result: g.playerResult,
    }));
}

export function getOpeningStats(games: ParsedGame[]): OpeningStats[] {
  const map: Record<string, { eco: string; wins: number; draws: number; losses: number; totalOppRating: number; ratedGames: number }> = {};

  games.forEach(g => {
    const key = g.opening || g.eco || 'Unknown';
    if (!map[key]) map[key] = { eco: g.eco, wins: 0, draws: 0, losses: 0, totalOppRating: 0, ratedGames: 0 };
    if (g.playerResult === 'win') map[key].wins++;
    else if (g.playerResult === 'draw') map[key].draws++;
    else if (g.playerResult === 'loss') map[key].losses++;
    if (g.opponentElo) {
      map[key].totalOppRating += g.opponentElo;
      map[key].ratedGames++;
    }
  });

  return Object.entries(map).map(([name, s]) => {
    const total = s.wins + s.draws + s.losses;
    return {
      name,
      eco: s.eco,
      games: total,
      wins: s.wins,
      draws: s.draws,
      losses: s.losses,
      winRate: total > 0 ? (s.wins + s.draws * 0.5) / total * 100 : 0,
      performanceRating: s.ratedGames > 0 ? Math.round(s.totalOppRating / s.ratedGames + (s.wins - s.losses) / total * 400) : 0,
    };
  }).sort((a, b) => b.games - a.games);
}
