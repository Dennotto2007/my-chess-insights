// Minimal chess logic for move replay — no external dependencies

export type Piece = { type: string; color: 'w' | 'b' };
export type Square = Piece | null;
export type Board = Square[][];

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

function pieceFromChar(c: string): Piece {
  return { type: c.toLowerCase(), color: c === c.toUpperCase() ? 'w' : 'b' };
}

export function fenToBoard(fen: string): Board {
  const rows = fen.split(' ')[0].split('/');
  return rows.map(row => {
    const squares: Square[] = [];
    for (const c of row) {
      if (/\d/.test(c)) {
        for (let i = 0; i < parseInt(c); i++) squares.push(null);
      } else {
        squares.push(pieceFromChar(c));
      }
    }
    return squares;
  });
}

export function initialBoard(): Board {
  return fenToBoard(INITIAL_FEN);
}

// File/rank helpers
function fileToCol(f: string): number { return f.charCodeAt(0) - 97; }
function rankToRow(r: string): number { return 8 - parseInt(r); }

function findPiece(board: Board, type: string, color: 'w' | 'b', destRow: number, destCol: number, disambigFile?: number, disambigRank?: number): [number, number] | null {
  const candidates: [number, number][] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p || p.type !== type || p.color !== color) continue;
      if (disambigFile !== undefined && c !== disambigFile) continue;
      if (disambigRank !== undefined && r !== disambigRank) continue;
      if (canReach(board, type, r, c, destRow, destCol)) {
        candidates.push([r, c]);
      }
    }
  }
  return candidates.length > 0 ? candidates[0] : null;
}

function canReach(board: Board, type: string, sr: number, sc: number, dr: number, dc: number): boolean {
  const rdiff = dr - sr;
  const cdiff = dc - sc;
  switch (type) {
    case 'p': return true; // pawn moves are handled separately
    case 'n': return (Math.abs(rdiff) === 2 && Math.abs(cdiff) === 1) || (Math.abs(rdiff) === 1 && Math.abs(cdiff) === 2);
    case 'b': return Math.abs(rdiff) === Math.abs(cdiff) && isPathClear(board, sr, sc, dr, dc);
    case 'r': return (rdiff === 0 || cdiff === 0) && isPathClear(board, sr, sc, dr, dc);
    case 'q': return ((rdiff === 0 || cdiff === 0) || Math.abs(rdiff) === Math.abs(cdiff)) && isPathClear(board, sr, sc, dr, dc);
    case 'k': return Math.abs(rdiff) <= 1 && Math.abs(cdiff) <= 1;
  }
  return false;
}

function isPathClear(board: Board, sr: number, sc: number, dr: number, dc: number): boolean {
  const rStep = Math.sign(dr - sr);
  const cStep = Math.sign(dc - sc);
  let r = sr + rStep, c = sc + cStep;
  while (r !== dr || c !== dc) {
    if (board[r][c]) return false;
    r += rStep;
    c += cStep;
  }
  return true;
}

function cloneBoard(board: Board): Board {
  return board.map(row => row.map(sq => sq ? { ...sq } : null));
}

export function applyMove(board: Board, san: string, color: 'w' | 'b'): Board {
  const b = cloneBoard(board);
  let move = san.replace(/[+#!?]+$/, '');

  // Castling
  if (move === 'O-O' || move === '0-0') {
    const row = color === 'w' ? 7 : 0;
    b[row][6] = b[row][4]; b[row][4] = null;
    b[row][5] = b[row][7]; b[row][7] = null;
    return b;
  }
  if (move === 'O-O-O' || move === '0-0-0') {
    const row = color === 'w' ? 7 : 0;
    b[row][2] = b[row][4]; b[row][4] = null;
    b[row][3] = b[row][0]; b[row][0] = null;
    return b;
  }

  // Promotion
  let promotion: string | null = null;
  const promoMatch = move.match(/=([QRBN])$/);
  if (promoMatch) {
    promotion = promoMatch[1].toLowerCase();
    move = move.replace(/=[QRBN]$/, '');
  }

  const isCapture = move.includes('x');
  move = move.replace('x', '');

  // Determine piece type and destination
  let pieceType: string;
  let destStr: string;
  let disambig = '';

  if (move[0] >= 'a' && move[0] <= 'h') {
    // Pawn move
    pieceType = 'p';
    if (move.length === 2) {
      destStr = move;
    } else {
      disambig = move[0];
      destStr = move.slice(move.length - 2);
    }
  } else {
    pieceType = move[0].toLowerCase();
    destStr = move.slice(move.length - 2);
    disambig = move.slice(1, move.length - 2);
  }

  const destCol = fileToCol(destStr[0]);
  const destRow = rankToRow(destStr[1]);

  if (pieceType === 'p') {
    // Pawn logic
    const dir = color === 'w' ? -1 : 1;
    let srcCol = disambig ? fileToCol(disambig) : destCol;
    let srcRow: number;

    if (isCapture || srcCol !== destCol) {
      srcRow = destRow - dir;
      // En passant
      if (!b[destRow][destCol]) {
        b[destRow - dir][destCol] = null;
      }
    } else {
      srcRow = destRow - dir;
      if (!b[srcRow][srcCol]) srcRow = destRow - 2 * dir;
    }

    b[destRow][destCol] = promotion
      ? { type: promotion, color }
      : b[srcRow][srcCol];
    b[srcRow][srcCol] = null;
  } else {
    let disambigFile: number | undefined;
    let disambigRank: number | undefined;
    if (disambig.length === 1) {
      if (disambig >= 'a' && disambig <= 'h') disambigFile = fileToCol(disambig);
      else disambigRank = rankToRow(disambig);
    } else if (disambig.length === 2) {
      disambigFile = fileToCol(disambig[0]);
      disambigRank = rankToRow(disambig[1]);
    }

    const src = findPiece(b, pieceType, color, destRow, destCol, disambigFile, disambigRank);
    if (src) {
      b[destRow][destCol] = b[src[0]][src[1]];
      b[src[0]][src[1]] = null;
    }
  }

  return b;
}

export function parseMoveText(moveText: string): string[] {
  // Remove result, comments, variations, annotations
  let cleaned = moveText
    .replace(/\{[^}]*\}/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/\$\d+/g, '')
    .replace(/\d+\.{3}/g, '')
    .replace(/\d+\./g, '')
    .replace(/(1-0|0-1|1\/2-1\/2|\*)\s*$/, '')
    .trim();

  return cleaned.split(/\s+/).filter(m => m.length > 0 && m !== '...');
}

// Unicode piece symbols
export function pieceToUnicode(piece: Piece): string {
  const map: Record<string, string> = {
    'wk': '♔', 'wq': '♕', 'wr': '♖', 'wb': '♗', 'wn': '♘', 'wp': '♙',
    'bk': '♚', 'bq': '♛', 'br': '♜', 'bb': '♝', 'bn': '♞', 'bp': '♟',
  };
  return map[piece.color + piece.type] || '?';
}
