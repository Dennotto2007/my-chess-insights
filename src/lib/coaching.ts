import { ParsedGame, CoachingInsight, OpeningStats } from './types';
import { getWDL, getWDLByColor, getOpeningStats } from './analysis';

export function generateInsights(games: ParsedGame[]): CoachingInsight[] {
  if (games.length < 5) return [{ category: 'general', priority: 'medium', title: 'Import more games', description: 'Need at least 5 games to generate insights.', icon: '📊' }];

  const insights: CoachingInsight[] = [];
  const wdl = getWDL(games);
  const byColor = getWDLByColor(games);
  const openings = getOpeningStats(games);
  const winRate = wdl.total > 0 ? (wdl.wins + wdl.draws * 0.5) / wdl.total : 0;

  // Color imbalance
  const whiteWR = byColor.white.total > 0 ? (byColor.white.wins + byColor.white.draws * 0.5) / byColor.white.total : 0;
  const blackWR = byColor.black.total > 0 ? (byColor.black.wins + byColor.black.draws * 0.5) / byColor.black.total : 0;
  if (Math.abs(whiteWR - blackWR) > 0.15 && byColor.white.total > 3 && byColor.black.total > 3) {
    const weaker = whiteWR < blackWR ? 'White' : 'Black';
    insights.push({
      category: 'opening',
      priority: 'high',
      title: `Improve your ${weaker} repertoire`,
      description: `Your ${weaker} win rate (${(Math.min(whiteWR, blackWR) * 100).toFixed(0)}%) is significantly lower than ${weaker === 'White' ? 'Black' : 'White'} (${(Math.max(whiteWR, blackWR) * 100).toFixed(0)}%). Focus on studying ${weaker} openings.`,
      icon: weaker === 'White' ? '♔' : '♚',
    });
  }

  // Worst openings
  const worstOpenings = openings.filter(o => o.games >= 3).sort((a, b) => a.winRate - b.winRate).slice(0, 3);
  worstOpenings.forEach(o => {
    if (o.winRate < 40) {
      insights.push({
        category: 'opening',
        priority: o.winRate < 25 ? 'high' : 'medium',
        title: `Study the ${o.name}`,
        description: `You score only ${o.winRate.toFixed(0)}% in ${o.games} games with the ${o.name}. Consider studying this line or switching to an alternative.`,
        icon: '📖',
      });
    }
  });

  // High loss rate
  if (wdl.losses / wdl.total > 0.55) {
    insights.push({
      category: 'tactics',
      priority: 'high',
      title: 'Focus on tactical training',
      description: `With a ${((wdl.losses / wdl.total) * 100).toFixed(0)}% loss rate, daily puzzle practice on Lichess or Chess.com could make a big difference.`,
      icon: '⚔️',
    });
  }

  // Low draw rate may suggest tactical volatility
  if (wdl.draws / wdl.total < 0.05 && wdl.total > 20) {
    insights.push({
      category: 'general',
      priority: 'medium',
      title: 'Consider defensive resources',
      description: `Your draw rate is very low (${((wdl.draws / wdl.total) * 100).toFixed(1)}%). Learning to hold worse positions and find drawing resources can save many half-points.`,
      icon: '🛡️',
    });
  }

  // Rating trend
  const rated = games.filter(g => g.playerElo && g.dateObj).sort((a, b) => a.dateObj!.getTime() - b.dateObj!.getTime());
  if (rated.length > 10) {
    const recent = rated.slice(-10);
    const older = rated.slice(-20, -10);
    if (older.length > 5) {
      const recentAvg = recent.reduce((s, g) => s + g.playerElo!, 0) / recent.length;
      const olderAvg = older.reduce((s, g) => s + g.playerElo!, 0) / older.length;
      if (recentAvg < olderAvg - 30) {
        insights.push({
          category: 'general',
          priority: 'high',
          title: 'Rating trending down',
          description: `Your recent rating (${Math.round(recentAvg)}) is ${Math.round(olderAvg - recentAvg)} points below your previous average. Consider taking a break or focusing on fundamentals.`,
          icon: '📉',
        });
      }
    }
  }

  // General if few insights
  if (insights.length === 0) {
    insights.push({
      category: 'general',
      priority: 'low',
      title: 'Keep it up!',
      description: `Your overall score is ${(winRate * 100).toFixed(0)}% across ${wdl.total} games. No major weaknesses detected — keep playing and analyzing!`,
      icon: '🎯',
    });
  }

  return insights.sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    return p[a.priority] - p[b.priority];
  });
}
