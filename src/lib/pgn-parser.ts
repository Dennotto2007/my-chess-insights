import { ParsedGame, GameResult, TimeControlCategory } from './types';

let gameIdCounter = 0;

function generateId(): string {
  return `game_${++gameIdCounter}_${Date.now()}`;
}

function parseHeader(line: string): [string, string] | null {
  const match = line.match(/^\[(\w+)\s+"(.*)"\]$/);
  if (match) return [match[1], match[2]];
  return null;
}

function classifyTimeControl(tc: string): TimeControlCategory {
  if (!tc || tc === '-' || tc === '?') return 'unknown';
  if (tc.includes('correspondence') || tc.includes('/')) return 'correspondence';
  const match = tc.match(/^(\d+)\+?(\d+)?$/);
  if (!match) return 'unknown';
  const base = parseInt(match[1]);
  const inc = parseInt(match[2] || '0');
  const total = base + inc * 40;
  if (total < 180) return 'bullet';
  if (total < 600) return 'blitz';
  if (total < 1800) return 'rapid';
  return 'classical';
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr === '?' || dateStr === '????.??.??') return null;
  const cleaned = dateStr.replace(/\./g, '-').replace(/\?/g, '01');
  const d = new Date(cleaned);
  return isNaN(d.getTime()) ? null : d;
}

function normalizeResult(r: string): GameResult {
  if (r === '1-0') return '1-0';
  if (r === '0-1') return '0-1';
  if (r === '1/2-1/2' || r === '½-½') return '1/2-1/2';
  return '*';
}

function detectPlayerName(games: { white: string; black: string }[]): string {
  const counts: Record<string, number> = {};
  games.forEach(g => {
    counts[g.white] = (counts[g.white] || 0) + 1;
    counts[g.black] = (counts[g.black] || 0) + 1;
  });
  let maxName = '';
  let maxCount = 0;
  for (const [name, count] of Object.entries(counts)) {
    if (count > maxCount) { maxCount = count; maxName = name; }
  }
  return maxName;
}

export function parsePGN(pgnText: string, playerName?: string): ParsedGame[] {
  const games: ParsedGame[] = [];
  const lines = pgnText.split('\n');
  let headers: Record<string, string> = {};
  let moves = '';
  let inMoves = false;

  const flushGame = () => {
    if (Object.keys(headers).length === 0) return;
    const white = headers.White || 'Unknown';
    const black = headers.Black || 'Unknown';
    const result = normalizeResult(headers.Result || '*');
    const dateStr = headers.Date || headers.UTCDate || null;
    const dateObj = dateStr ? parseDate(dateStr) : null;
    const tc = headers.TimeControl || '';
    const opening = headers.Opening || headers.ECO || 'Unknown';
    const eco = headers.ECO || '';

    const game: ParsedGame = {
      id: generateId(),
      white,
      black,
      result,
      date: dateStr,
      dateObj,
      event: headers.Event || '',
      site: headers.Site || '',
      round: headers.Round || '',
      whiteElo: headers.WhiteElo ? parseInt(headers.WhiteElo) : null,
      blackElo: headers.BlackElo ? parseInt(headers.BlackElo) : null,
      eco,
      opening,
      timeControl: tc,
      timeControlCategory: classifyTimeControl(tc),
      moves: moves.trim(),
      playerColor: null,
      playerElo: null,
      opponentElo: null,
      playerResult: 'unknown',
    };
    games.push(game);
    headers = {};
    moves = '';
    inMoves = false;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '') {
      if (inMoves) continue;
      if (Object.keys(headers).length > 0 && moves.trim()) {
        flushGame();
      }
      continue;
    }
    const header = parseHeader(trimmed);
    if (header) {
      if (inMoves && Object.keys(headers).length > 0) {
        flushGame();
      }
      inMoves = false;
      headers[header[0]] = header[1];
    } else {
      inMoves = true;
      moves += ' ' + trimmed;
    }
  }
  flushGame();

  // Detect player and assign colors
  const detected = playerName || detectPlayerName(games);
  for (const g of games) {
    if (g.white.toLowerCase() === detected.toLowerCase()) {
      g.playerColor = 'white';
      g.playerElo = g.whiteElo;
      g.opponentElo = g.blackElo;
      g.playerResult = g.result === '1-0' ? 'win' : g.result === '0-1' ? 'loss' : g.result === '1/2-1/2' ? 'draw' : 'unknown';
    } else if (g.black.toLowerCase() === detected.toLowerCase()) {
      g.playerColor = 'black';
      g.playerElo = g.blackElo;
      g.opponentElo = g.whiteElo;
      g.playerResult = g.result === '0-1' ? 'win' : g.result === '1-0' ? 'loss' : g.result === '1/2-1/2' ? 'draw' : 'unknown';
    }
  }

  return games;
}

export function deduplicateGames(games: ParsedGame[]): ParsedGame[] {
  const seen = new Set<string>();
  return games.filter(g => {
    const key = `${g.white}|${g.black}|${g.date}|${g.result}|${g.moves.slice(0, 80)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
