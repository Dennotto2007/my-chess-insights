import { ParsedGame } from '@/lib/types';
import { generateInsights } from '@/lib/coaching';

interface CoachingSectionProps {
  games: ParsedGame[];
}

const priorityColors = {
  high: 'border-l-loss',
  medium: 'border-l-primary',
  low: 'border-l-win',
};

export function CoachingSection({ games }: CoachingSectionProps) {
  const insights = generateInsights(games);

  return (
    <div className="stat-card">
      <h3 className="section-title mb-4">🎯 What Should I Improve?</h3>
      <div className="space-y-3">
        {insights.map((insight, i) => (
          <div key={i} className={`border-l-2 ${priorityColors[insight.priority]} pl-4 py-2`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{insight.icon}</span>
              <h4 className="font-medium text-sm">{insight.title}</h4>
              <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-medium ${
                insight.priority === 'high' ? 'bg-loss/20 loss-text' :
                insight.priority === 'medium' ? 'bg-primary/20 text-primary' :
                'bg-win/20 win-text'
              }`}>
                {insight.priority}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border">
        <p className="text-xs text-muted-foreground">
          🔧 <strong>Engine Analysis (coming soon):</strong> Accuracy %, blunder/mistake/inaccuracy counts, and centipawn loss per game. Structured for local Stockfish integration.
        </p>
      </div>
    </div>
  );
}
