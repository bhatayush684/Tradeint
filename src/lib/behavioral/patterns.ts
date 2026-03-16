import { Trade, BehavioralInsight } from '../../data/types';

export function detectRevengeTrading(trades: Trade[]): BehavioralInsight[] {
  const insights: BehavioralInsight[] = [];
  
  for (let i = 1; i < trades.length; i++) {
    const prevTrade = trades[i - 1];
    const currentTrade = trades[i];
    
    // Check if previous trade was a loss and current trade shows revenge patterns
    if (prevTrade.profitLoss < 0 && 
        currentTrade.emotionalState === 'revenge' &&
        currentTrade.positionSize > prevTrade.positionSize * 1.5) {
      
      const impact = Math.abs(currentTrade.profitLoss);
      const severity = impact > 100 ? 'critical' : impact > 50 ? 'high' : 'medium';
      
      insights.push({
        id: `revenge-${i}`,
        type: 'revenge-trading',
        severity,
        title: 'Revenge Trading Detected',
        description: `After losing $${Math.abs(prevTrade.profitLoss).toFixed(2)} on ${prevTrade.symbol}, you increased position size by ${((currentTrade.positionSize / prevTrade.positionSize - 1) * 100).toFixed(0)}% and traded emotionally.`,
        affectedTrades: [prevTrade.tradeId, currentTrade.tradeId],
        recommendation: 'Take a break after losses. Never increase position size to recover losses quickly.',
        frequency: 1,
        impact: -impact
      });
    }
  }
  
  return insights;
}

export function detectOvertrading(trades: Trade[]): BehavioralInsight[] {
  const insights: BehavioralInsight[] = [];
  
  // Group trades by hour
  const tradesByHour = new Map<string, Trade[]>();
  
  trades.forEach(trade => {
    const hourKey = trade.entryTime.toISOString().slice(0, 13); // YYYY-MM-DDTHH
    if (!tradesByHour.has(hourKey)) {
      tradesByHour.set(hourKey, []);
    }
    tradesByHour.get(hourKey)!.push(trade);
  });
  
  // Check for overtrading patterns
  tradesByHour.forEach((hourTrades, hourKey) => {
    if (hourTrades.length >= 4) {
      const totalPnL = hourTrades.reduce((sum, t) => sum + t.profitLoss, 0);
      const avgPnL = totalPnL / hourTrades.length;
      
      insights.push({
        id: `overtrade-${hourKey}`,
        type: 'overtrading',
        severity: hourTrades.length >= 6 ? 'high' : 'medium',
        title: 'Excessive Trading Activity',
        description: `You placed ${hourTrades.length} trades within one hour, with average P&L of $${avgPnL.toFixed(2)}. High-frequency trading often leads to poor decisions.`,
        affectedTrades: hourTrades.map(t => t.tradeId),
        recommendation: 'Set a maximum number of trades per hour/day. Focus on quality setups over quantity.',
        frequency: hourTrades.length,
        impact: totalPnL < 0 ? totalPnL : 0
      });
    }
  });
  
  return insights;
}

export function detectPositionEscalation(trades: Trade[]): BehavioralInsight[] {
  const insights: BehavioralInsight[] = [];
  
  for (let i = 3; i < trades.length; i++) {
    const window = trades.slice(i - 3, i + 1);
    const positions = window.map(t => t.positionSize);
    
    // Check for consistent position size increase
    const isEscalating = positions.every((pos, idx) => 
      idx === 0 || pos > positions[idx - 1] * 1.2
    );
    
    if (isEscalating && positions[positions.length - 1] > positions[0] * 2) {
      const lastTrade = window[window.length - 1];
      const totalPnL = window.reduce((sum, t) => sum + t.profitLoss, 0);
      
      insights.push({
        id: `escalation-${i}`,
        type: 'position-escalation',
        severity: lastTrade.profitLoss < 0 ? 'high' : 'medium',
        title: 'Dangerous Position Size Escalation',
        description: `Position size increased by ${((positions[positions.length - 1] / positions[0] - 1) * 100).toFixed(0)}% across 4 consecutive trades. This dramatically increases risk.`,
        affectedTrades: window.map(t => t.tradeId),
        recommendation: 'Maintain consistent position sizing based on your risk management rules.',
        frequency: 1,
        impact: -Math.abs(lastTrade.profitLoss)
      });
    }
  }
  
  return insights;
}

export function detectHoldingLosers(trades: Trade[]): BehavioralInsight[] {
  const insights: BehavioralInsight[] = [];
  
  const winners = trades.filter(t => t.profitLoss > 0);
  const losers = trades.filter(t => t.profitLoss <= 0);
  
  if (winners.length === 0 || losers.length === 0) return insights;
  
  const avgWinnerTime = winners.reduce((sum, t) => sum + t.holdingTime, 0) / winners.length;
  const avgLoserTime = losers.reduce((sum, t) => sum + t.holdingTime, 0) / losers.length;
  
  if (avgLoserTime > avgWinnerTime * 2) {
    const impactedLosers = losers.filter(t => t.holdingTime > avgWinnerTime * 2);
    const totalImpact = impactedLosers.reduce((sum, t) => sum + t.profitLoss, 0);
    
    insights.push({
      id: 'holding-losers',
      type: 'holding-losers',
      severity: avgLoserTime > avgWinnerTime * 3 ? 'high' : 'medium',
      title: 'Holding Losers Too Long',
      description: `Average losing trade held for ${Math.round(avgLoserTime)} minutes vs ${Math.round(avgWinnerTime)} minutes for winners. You're letting losses run while cutting profits early.`,
      affectedTrades: impactedLosers.map(t => t.tradeId),
      recommendation: 'Set strict stop-losses and let winners run longer. Consider using trailing stops.',
      frequency: impactedLosers.length,
      impact: totalImpact
    });
  }
  
  return insights;
}

export function detectPoorRecovery(trades: Trade[]): BehavioralInsight[] {
  const insights: BehavioralInsight[] = [];
  
  for (let i = 2; i < trades.length; i++) {
    const window = trades.slice(i - 2, i + 1);
    
    // Check for loss streak followed by poor performance
    const hasLossStreak = window.slice(0, 2).every(t => t.profitLoss < 0);
    const poorRecovery = window[2].profitLoss < 0 && window[2].emotionalState !== 'calm';
    
    if (hasLossStreak && poorRecovery) {
      const streakLoss = window.slice(0, 2).reduce((sum, t) => sum + t.profitLoss, 0);
      
      insights.push({
        id: `recovery-${i}`,
        type: 'poor-recovery',
        severity: 'high',
        title: 'Poor Recovery After Loss Streak',
        description: `After losing $${Math.abs(streakLoss).toFixed(2)} in 2 consecutive trades, you continued trading emotionally and lost another $${Math.abs(window[2].profitLoss).toFixed(2)}.`,
        affectedTrades: window.map(t => t.tradeId),
        recommendation: 'Stop trading after 2 consecutive losses. Take at least 24 hours off to reset mentally.',
        frequency: 1,
        impact: streakLoss + window[2].profitLoss
      });
    }
  }
  
  return insights;
}

export function detectTimePatterns(trades: Trade[]): BehavioralInsight[] {
  const insights: BehavioralInsight[] = [];
  
  // Analyze performance by hour of day
  const hourlyPerformance = new Map<number, { trades: Trade[]; totalPnL: number }>();
  
  trades.forEach(trade => {
    const hour = trade.entryTime.getHours();
    if (!hourlyPerformance.has(hour)) {
      hourlyPerformance.set(hour, { trades: [], totalPnL: 0 });
    }
    const perf = hourlyPerformance.get(hour)!;
    perf.trades.push(trade);
    perf.totalPnL += trade.profitLoss;
  });
  
  // Find worst performing hours
  hourlyPerformance.forEach((perf, hour) => {
    if (perf.trades.length >= 5) {
      const avgPnL = perf.totalPnL / perf.trades.length;
      const winRate = perf.trades.filter(t => t.profitLoss > 0).length / perf.trades.length;
      
      if (avgPnL < -20 && winRate < 0.3) {
        insights.push({
          id: `time-pattern-${hour}`,
          type: 'time-pattern',
          severity: 'medium',
          title: 'Poor Performance During Specific Hours',
          description: `Between ${hour}:00-${hour + 1}:00, your average loss is $${avgPnL.toFixed(2)} with only ${(winRate * 100).toFixed(0)}% win rate across ${perf.trades.length} trades.`,
          affectedTrades: perf.trades.map(t => t.tradeId),
          recommendation: `Consider avoiding trading during ${hour}:00-${hour + 1}:00 or reduce position sizes during this time.`,
          frequency: perf.trades.length,
          impact: perf.totalPnL
        });
      }
    }
  });
  
  return insights;
}

export function detectSetupBias(trades: Trade[]): BehavioralInsight[] {
  const insights: BehavioralInsight[] = [];
  
  // Analyze performance by setup type
  const setupPerformance = new Map<string, { trades: Trade[]; totalPnL: number }>();
  
  trades.forEach(trade => {
    if (!setupPerformance.has(trade.setupType)) {
      setupPerformance.set(trade.setupType, { trades: [], totalPnL: 0 });
    }
    const perf = setupPerformance.get(trade.setupType)!;
    perf.trades.push(trade);
    perf.totalPnL += trade.profitLoss;
  });
  
  // Find problematic setups
  setupPerformance.forEach((perf, setupType) => {
    if (perf.trades.length >= 10) {
      const avgPnL = perf.totalPnL / perf.trades.length;
      const winRate = perf.trades.filter(t => t.profitLoss > 0).length / perf.trades.length;
      
      if (avgPnL < -15 || winRate < 0.35) {
        insights.push({
          id: `setup-bias-${setupType}`,
          type: 'setup-bias',
          severity: avgPnL < -30 ? 'high' : 'medium',
          title: `Ineffective ${setupType.charAt(0).toUpperCase() + setupType.slice(1)} Setup`,
          description: `Your ${setupType} trades average $${avgPnL.toFixed(2)} loss with ${(winRate * 100).toFixed(0)}% win rate across ${perf.trades.length} trades.`,
          affectedTrades: perf.trades.map(t => t.tradeId),
          recommendation: `Review and improve your ${setupType} strategy or reduce frequency of these setups.`,
          frequency: perf.trades.length,
          impact: perf.totalPnL
        });
      }
    }
  });
  
  return insights;
}

export function analyzeBehavioralPatterns(trades: Trade[]): BehavioralInsight[] {
  const sortedTrades = [...trades].sort((a, b) => a.entryTime.getTime() - b.entryTime.getTime());
  
  const allInsights = [
    ...detectRevengeTrading(sortedTrades),
    ...detectOvertrading(sortedTrades),
    ...detectPositionEscalation(sortedTrades),
    ...detectHoldingLosers(sortedTrades),
    ...detectPoorRecovery(sortedTrades),
    ...detectTimePatterns(sortedTrades),
    ...detectSetupBias(sortedTrades)
  ];
  
  // Sort by severity and impact
  return allInsights.sort((a, b) => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
    if (severityDiff !== 0) return severityDiff;
    return Math.abs(b.impact) - Math.abs(a.impact);
  });
}

export function getBehavioralSummary(insights: BehavioralInsight[]) {
  const summary = {
    totalInsights: insights.length,
    critical: insights.filter(i => i.severity === 'critical').length,
    high: insights.filter(i => i.severity === 'high').length,
    medium: insights.filter(i => i.severity === 'medium').length,
    low: insights.filter(i => i.severity === 'low').length,
    totalImpact: insights.reduce((sum, i) => sum + i.impact, 0),
    patterns: {
      'revenge-trading': insights.filter(i => i.type === 'revenge-trading').length,
      'overtrading': insights.filter(i => i.type === 'overtrading').length,
      'position-escalation': insights.filter(i => i.type === 'position-escalation').length,
      'holding-losers': insights.filter(i => i.type === 'holding-losers').length,
      'poor-recovery': insights.filter(i => i.type === 'poor-recovery').length,
      'time-pattern': insights.filter(i => i.type === 'time-pattern').length,
      'setup-bias': insights.filter(i => i.type === 'setup-bias').length
    }
  };
  
  return summary;
}
