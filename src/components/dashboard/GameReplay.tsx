import { useState, useMemo, useCallback, useEffect } from 'react';
import { ParsedGame } from '@/lib/types';
import { initialBoard, applyMove, parseMoveText, pieceToUnicode, Board } from '@/lib/chess-board';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface GameReplayProps {
  game: ParsedGame;
  onClose: () => void;
}

export function GameReplay({ game, onClose }: GameReplayProps) {
  const moves = useMemo(() => parseMoveText(game.moves), [game.moves]);

  const boards = useMemo(() => {
    const positions: Board[] = [initialBoard()];
    let current = initialBoard();
    for (let i = 0; i < moves.length; i++) {
      try {
        current = applyMove(current, moves[i], i % 2 === 0 ? 'w' : 'b');
        positions.push(current);
      } catch {
        break;
      }
    }
    return positions;
  }, [moves]);

  const [ply, setPly] = useState(0);

  const goFirst = useCallback(() => setPly(0), []);
  const goPrev = useCallback(() => setPly(p => Math.max(0, p - 1)), []);
  const goNext = useCallback(() => setPly(p => Math.min(boards.length - 1, p + 1)), [boards.length]);
  const goLast = useCallback(() => setPly(boards.length - 1), [boards.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'Home') goFirst();
      else if (e.key === 'End') goLast();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goFirst, goPrev, goNext, goLast]);

  const board = boards[ply];
  const isFlipped = game.playerColor === 'black';

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0 bg-card border-border overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-base font-heading">
            {game.white} vs {game.black}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            {game.opening} · {game.result} · {game.dateObj?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || game.date}
          </p>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row gap-4 px-5 pb-5">
          {/* Board */}
          <div className="flex-shrink-0">
            <div className="grid grid-cols-8 border border-border rounded overflow-hidden" style={{ width: 320, height: 320 }}>
              {Array.from({ length: 64 }).map((_, idx) => {
                const visualRow = isFlipped ? 7 - Math.floor(idx / 8) : Math.floor(idx / 8);
                const visualCol = isFlipped ? 7 - (idx % 8) : idx % 8;
                const piece = board[visualRow]?.[visualCol];
                const isLight = (visualRow + visualCol) % 2 === 0;

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-center text-xl select-none"
                    style={{
                      width: 40, height: 40,
                      backgroundColor: isLight ? 'hsl(43 30% 75%)' : 'hsl(43 30% 42%)',
                      color: piece?.color === 'w' ? '#fff' : '#1a1a1a',
                      textShadow: piece?.color === 'w' ? '0 1px 2px rgba(0,0,0,0.5)' : '0 1px 2px rgba(255,255,255,0.3)',
                    }}
                  >
                    {piece ? pieceToUnicode(piece) : ''}
                  </div>
                );
              })}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-1 mt-3">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-base" onClick={goFirst} disabled={ply === 0}>⏮</Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-base" onClick={goPrev} disabled={ply === 0}>◀</Button>
              <span className="text-xs text-muted-foreground w-16 text-center">
                {ply === 0 ? 'Start' : `${Math.ceil(ply / 2)}. ${ply % 2 === 1 ? '…' : ''}`}
              </span>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-base" onClick={goNext} disabled={ply >= boards.length - 1}>▶</Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-base" onClick={goLast} disabled={ply >= boards.length - 1}>⏭</Button>
            </div>
          </div>

          {/* Move list */}
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground mb-2 font-medium">Moves</div>
            <div className="max-h-[300px] overflow-y-auto pr-1 space-y-0.5">
              {Array.from({ length: Math.ceil(moves.length / 2) }).map((_, i) => {
                const whiteIdx = i * 2;
                const blackIdx = i * 2 + 1;
                return (
                  <div key={i} className="flex items-center gap-1 text-xs">
                    <span className="text-muted-foreground w-7 text-right shrink-0">{i + 1}.</span>
                    <button
                      className={`px-1.5 py-0.5 rounded hover:bg-secondary/60 transition-colors font-mono ${ply === whiteIdx + 1 ? 'bg-primary/20 text-primary font-semibold' : 'text-foreground'}`}
                      onClick={() => setPly(whiteIdx + 1)}
                    >
                      {moves[whiteIdx]}
                    </button>
                    {moves[blackIdx] && (
                      <button
                        className={`px-1.5 py-0.5 rounded hover:bg-secondary/60 transition-colors font-mono ${ply === blackIdx + 1 ? 'bg-primary/20 text-primary font-semibold' : 'text-foreground'}`}
                        onClick={() => setPly(blackIdx + 1)}
                      >
                        {moves[blackIdx]}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Game info */}
            <div className="mt-4 pt-3 border-t border-border space-y-1 text-xs text-muted-foreground">
              {game.event && <div>Event: {game.event}</div>}
              {game.whiteElo && <div>White Elo: {game.whiteElo}</div>}
              {game.blackElo && <div>Black Elo: {game.blackElo}</div>}
              <div>Result: <span className={game.playerResult === 'win' ? 'win-text' : game.playerResult === 'loss' ? 'loss-text' : 'draw-text'}>{game.result}</span></div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
