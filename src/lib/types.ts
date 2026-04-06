export type GameResult = '1-0' | '0-1' | '1/2-1/2' | '*';
export type PlayerColor = 'white' | 'black';
export type TimeControlCategory = 'bullet' | 'blitz' | 'rapid' | 'classical' | 'correspondence' | 'unknown';

export interface ParsedGame {
  id: string;
  white: string;
  black: string;
  result: GameResult;
  date: string | null;
  dateObj: Date | null;
  event: string;
  site: string;
  round: string;
  whiteElo: number | null;
  blackElo: number | null;
  eco: string;
  opening: string;
  timeControl: string;
  timeControlCategory: TimeControlCategory;
  moves: string;
  playerColor: PlayerColor | null;
  playerElo: number | null;
  opponentElo: number | null;
  playerResult: 'win' | 'loss' | 'draw' | 'unknown';
  // Future engine analysis fields
  accuracy?: number;
  blunders?: number;
  mistakes?: number;
  inaccuracies?: number;
  avgCentipawnLoss?: number;
}

export interface Filters {
  dateRange: [Date | null, Date | null];
  timeControls: TimeControlCategory[];
  color: PlayerColor | 'both';
  result: 'win' | 'loss' | 'draw' | 'all';
  opening: string;
  opponentRatingRange: [number, number];
  sampleSize: number | null;
}

export interface OpeningStats {
  name: string;
  eco: string;
  games: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  performanceRating: number;
}

export interface CoachingInsight {
  category: 'opening' | 'tactics' | 'endgame' | 'time_management' | 'general';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  icon: string;
}
