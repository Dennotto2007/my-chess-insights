import { useState, useCallback } from 'react';
import { Filters, TimeControlCategory, PlayerColor } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';

const TIME_CONTROLS: TimeControlCategory[] = ['bullet', 'blitz', 'rapid', 'classical', 'correspondence'];

interface FilterBarProps {
  filters: Filters;
  onChange: (f: Filters) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const update = (partial: Partial<Filters>) => onChange({ ...filters, ...partial });

  const toggleTC = (tc: TimeControlCategory) => {
    const cur = filters.timeControls;
    update({ timeControls: cur.includes(tc) ? cur.filter(t => t !== tc) : [...cur, tc] });
  };

  return (
    <div className="stat-card flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
        <Calendar className="h-4 w-4" />
        <span>Filters</span>
      </div>

      <div className="flex gap-1">
        {TIME_CONTROLS.map(tc => (
          <button
            key={tc}
            onClick={() => toggleTC(tc)}
            className={`px-2.5 py-1 text-xs rounded-md capitalize font-medium transition-colors ${
              filters.timeControls.length === 0 || filters.timeControls.includes(tc)
                ? 'bg-primary/20 text-primary'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {tc}
          </button>
        ))}
      </div>

      <Select value={filters.color} onValueChange={(v) => update({ color: v as PlayerColor | 'both' })}>
        <SelectTrigger className="w-28 h-8 text-xs bg-secondary border-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="both">Both colors</SelectItem>
          <SelectItem value="white">White</SelectItem>
          <SelectItem value="black">Black</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.result} onValueChange={(v) => update({ result: v as any })}>
        <SelectTrigger className="w-24 h-8 text-xs bg-secondary border-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All results</SelectItem>
          <SelectItem value="win">Wins</SelectItem>
          <SelectItem value="draw">Draws</SelectItem>
          <SelectItem value="loss">Losses</SelectItem>
        </SelectContent>
      </Select>

      <Input
        placeholder="Filter opening..."
        value={filters.opening}
        onChange={e => update({ opening: e.target.value })}
        className="w-36 h-8 text-xs bg-secondary border-border"
      />

      <Input
        type="number"
        placeholder="Last N games"
        value={filters.sampleSize ?? ''}
        onChange={e => update({ sampleSize: e.target.value ? parseInt(e.target.value) : null })}
        className="w-28 h-8 text-xs bg-secondary border-border"
      />

      <Button
        variant="ghost"
        size="sm"
        className="text-xs text-muted-foreground h-8"
        onClick={() => onChange({
          dateRange: [null, null],
          timeControls: [],
          color: 'both',
          result: 'all',
          opening: '',
          opponentRatingRange: [0, 4000],
          sampleSize: null,
        })}
      >
        Reset
      </Button>
    </div>
  );
}
