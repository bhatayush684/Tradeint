import { Trade, PerformanceMetrics, TimePerformance, SymbolPerformance } from '../../data/types';

export function calculatePerformanceMetrics(trades: Trade[]): PerformanceMetrics {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      totalProfitLoss: 0,
      averageWin: 0,
      averageLoss: 0,
      averageRiskReward: 0,
      expectancy: 0,
      profitFactor: 0,
      maxDrawdown: 0,
      maxConsecutiveWins: 0,
      maxConsecutiveLosses: 0,
      sharpeRatio: 0,
      sortinoRatio: 0,
      calmarRatio: 0,
      totalCommission: 0,
      totalSwap: 0
    };
  }

  const winningTrades = trades.filter(t => t.profitLoss > 0);
  const losingTrades = trades.filter(t => t.profitLoss <= 0);
  
  const totalProfitLoss = trades.reduce((sum, t) => sum + t.profitLoss, 0);
  const totalWins = winningTrades.reduce((sum, t) => sum + t.profitLoss, 0);
  const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.profitLoss, 0));
  
  const averageWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0;
  const averageLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;
  const averageRiskReward = trades.reduce((sum, t) => sum + t.riskReward, 0) / trades.length;
  
  const winRate = (winningTrades.length / trades.length) * 100;
  const expectancy = (winRate * averageWin - (100 - winRate) * averageLoss) / 100;
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;
  
  // Calculate max drawdown
  let peak = 0;
  let maxDrawdown = 0;
  let runningTotal = 0;
  
  trades.forEach(trade => {
    runningTotal += trade.profitLoss;
    if (runningTotal > peak) peak = runningTotal;
    const drawdown = peak - runningTotal;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  });
  
  // Calculate consecutive wins/losses
  let currentConsecutive = 0;
  let maxConsecutiveWins = 0;
  let maxConsecutiveLosses = 0;
  
  trades.forEach(trade => {
    if (trade.profitLoss > 0) {
      currentConsecutive = currentConsecutive > 0 ? currentConsecutive + 1 : 1;
      maxConsecutiveWins = Math.max(maxConsecutiveWins, currentConsecutive);
    } else {
      currentConsecutive = currentConsecutive < 0 ? currentConsecutive - 1 : -1;
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, Math.abs(currentConsecutive));
    }
  });
  
  // Calculate Sharpe ratio (simplified)
  const returns = trades.map(t => t.profitLoss);
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;
  
  // Calculate Sortino ratio (downside deviation only)
  const downsideReturns = returns.filter(r => r < 0);
  const downsideVariance = downsideReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / downsideReturns.length;
  const downsideDeviation = Math.sqrt(downsideVariance);
  const sortinoRatio = downsideDeviation > 0 ? avgReturn / downsideDeviation : 0;
  
  // Calculate Calmar ratio
  const calmarRatio = maxDrawdown > 0 ? totalProfitLoss / maxDrawdown : 0;
  
  const totalCommission = trades.reduce((sum, t) => sum + t.commission, 0);
  const totalSwap = trades.reduce((sum, t) => sum + t.swap, 0);
  
  return {
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate,
    totalProfitLoss,
    averageWin,
    averageLoss,
    averageRiskReward,
    expectancy,
    profitFactor,
    maxDrawdown,
    maxConsecutiveWins,
    maxConsecutiveLosses,
    sharpeRatio,
    sortinoRatio,
    calmarRatio,
    totalCommission,
    totalSwap
  };
}

export function calculateEquityCurve(trades: Trade[]): { date: string; equity: number; tradeId: string }[] {
  const sortedTrades = [...trades].sort((a, b) => a.exitTime.getTime() - b.exitTime.getTime());
  const equityCurve: { date: string; equity: number; tradeId: string }[] = [];
  
  let runningEquity = 0;
  sortedTrades.forEach(trade => {
    runningEquity += trade.profitLoss;
    equityCurve.push({
      date: trade.exitTime.toISOString().split('T')[0],
      equity: runningEquity,
      tradeId: trade.tradeId
    });
  });
  
  return equityCurve;
}

export function calculateTimePerformance(trades: Trade[]): TimePerformance[] {
  const timeMap = new Map<string, TimePerformance>();
  
  trades.forEach(trade => {
    const hour = trade.entryTime.getHours();
    const dayOfWeek = trade.entryTime.getDay();
    const key = `${hour}-${dayOfWeek}`;
    
    if (!timeMap.has(key)) {
      timeMap.set(key, {
        hour,
        dayOfWeek,
        winRate: 0,
        totalTrades: 0,
        averagePnL: 0,
        profitFactor: 0,
        bestHour: false
      });
    }
    
    const perf = timeMap.get(key)!;
    perf.totalTrades++;
    perf.averagePnL += trade.profitLoss;
  });
  
  // Calculate final metrics
  const timePerformance = Array.from(timeMap.values());
  timePerformance.forEach(perf => {
    const hourTrades = trades.filter(t => 
      t.entryTime.getHours() === perf.hour && 
      t.entryTime.getDay() === perf.dayOfWeek
    );
    
    const winners = hourTrades.filter(t => t.profitLoss > 0);
    const losers = hourTrades.filter(t => t.profitLoss <= 0);
    
    perf.winRate = (winners.length / perf.totalTrades) * 100;
    perf.averagePnL = perf.averagePnL / perf.totalTrades;
    
    const totalWins = winners.reduce((sum, t) => sum + t.profitLoss, 0);
    const totalLosses = Math.abs(losers.reduce((sum, t) => sum + t.profitLoss, 0));
    perf.profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;
  });
  
  // Mark best performing hours
  const avgProfitFactor = timePerformance.reduce((sum, p) => sum + p.profitFactor, 0) / timePerformance.length;
  timePerformance.forEach(perf => {
    perf.bestHour = perf.profitFactor > avgProfitFactor * 1.5;
  });
  
  return timePerformance.sort((a, b) => a.hour - b.hour);
}

export function calculateSymbolPerformance(trades: Trade[]): SymbolPerformance[] {
  const symbolMap = new Map<string, SymbolPerformance>();
  
  trades.forEach(trade => {
    if (!symbolMap.has(trade.symbol)) {
      symbolMap.set(trade.symbol, {
        symbol: trade.symbol,
        totalTrades: 0,
        winRate: 0,
        totalPnL: 0,
        averagePnL: 0,
        averageRiskReward: 0,
        bestSetup: '',
        worstSetup: '',
        volatility: 0,
        spread: 0
      });
    }
    
    const perf = symbolMap.get(trade.symbol)!;
    perf.totalTrades++;
    perf.totalPnL += trade.profitLoss;
    perf.averageRiskReward += trade.riskReward;
    perf.volatility = Math.max(perf.volatility, Math.abs(trade.maxDrawdown));
  });
  
  // Calculate final metrics
  const symbolPerformance = Array.from(symbolMap.values());
  symbolPerformance.forEach(perf => {
    const symbolTrades = trades.filter(t => t.symbol === perf.symbol);
    const winners = symbolTrades.filter(t => t.profitLoss > 0);
    
    perf.winRate = (winners.length / perf.totalTrades) * 100;
    perf.averagePnL = perf.totalPnL / perf.totalTrades;
    perf.averageRiskReward = perf.averageRiskReward / perf.totalTrades;
    
    // Find best and worst setups
    const setupPerformance = new Map<string, { count: number; totalPnL: number }>();
    symbolTrades.forEach(trade => {
      if (!setupPerformance.has(trade.setupType)) {
        setupPerformance.set(trade.setupType, { count: 0, totalPnL: 0 });
      }
      const setup = setupPerformance.get(trade.setupType)!;
      setup.count++;
      setup.totalPnL += trade.profitLoss;
    });
    
    let bestAvgPnL = -Infinity;
    let worstAvgPnL = Infinity;
    
    setupPerformance.forEach((setupPerf, setup) => {
      const avgPnL = setupPerf.totalPnL / setupPerf.count;
      if (avgPnL > bestAvgPnL) {
        bestAvgPnL = avgPnL;
        perf.bestSetup = setup;
      }
      if (avgPnL < worstAvgPnL) {
        worstAvgPnL = avgPnL;
        perf.worstSetup = setup;
      }
    });
    
    // Simulate spread based on symbol
    perf.spread = Math.random() * 2 + 0.5; // 0.5-2.5 pips
  });
  
  return symbolPerformance.sort((a, b) => b.totalPnL - a.totalPnL);
}

export function calculateSessionPerformance(trades: Trade[]) {
  const sessions = ['london', 'new-york', 'tokyo', 'sydney', 'overlap'] as const;
  const sessionStats = sessions.map(session => {
    const sessionTrades = trades.filter(t => t.session === session);
    const metrics = calculatePerformanceMetrics(sessionTrades);
    
    return {
      session,
      trades: sessionTrades.length,
      winRate: metrics.winRate,
      totalPnL: metrics.totalProfitLoss,
      averagePnL: sessionTrades.length > 0 ? metrics.totalProfitLoss / sessionTrades.length : 0,
      profitFactor: metrics.profitFactor,
      sharpeRatio: metrics.sharpeRatio
    };
  });
  
  return sessionStats.sort((a, b) => b.totalPnL - a.totalPnL);
}

export function calculateMonthlyPerformance(trades: Trade[]) {
  const monthlyMap = new Map<string, PerformanceMetrics>();
  
  trades.forEach(trade => {
    const month = trade.exitTime.toISOString().slice(0, 7); // YYYY-MM
    const monthTrades = trades.filter(t => t.exitTime.toISOString().slice(0, 7) === month);
    monthlyMap.set(month, calculatePerformanceMetrics(monthTrades));
  });
  
  return Array.from(monthlyMap.entries())
    .map(([month, metrics]) => ({ month, ...metrics }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function calculateRiskMetrics(trades: Trade[]) {
  const returns = trades.map(t => t.profitLoss);
  const totalCapital = 10000; // Assume starting capital
  const returnsPercent = returns.map(r => (r / totalCapital) * 100);
  
  const avgReturn = returnsPercent.reduce((sum, r) => sum + r, 0) / returnsPercent.length;
  const variance = returnsPercent.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returnsPercent.length;
  const stdDev = Math.sqrt(variance);
  
  // Value at Risk (95% confidence)
  const sortedReturns = [...returnsPercent].sort((a, b) => a - b);
  const var95 = sortedReturns[Math.floor(sortedReturns.length * 0.05)];
  
  // Maximum drawdown already calculated in performance metrics
  const metrics = calculatePerformanceMetrics(trades);
  
  return {
    totalReturn: metrics.totalProfitLoss,
    totalReturnPercent: (metrics.totalProfitLoss / totalCapital) * 100,
    avgReturnPercent: avgReturn,
    volatility: stdDev,
    var95,
    maxDrawdown: metrics.maxDrawdown,
    maxDrawdownPercent: (metrics.maxDrawdown / totalCapital) * 100,
    sharpeRatio: metrics.sharpeRatio,
    sortinoRatio: metrics.sortinoRatio,
    calmarRatio: metrics.calmarRatio
  };
}
