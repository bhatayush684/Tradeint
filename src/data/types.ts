// Trading Data Types

export interface Trade {
  tradeId: string;
  symbol: string;
  entryTime: Date;
  exitTime: Date;
  entryPrice: number;
  exitPrice: number;
  positionSize: number;
  profitLoss: number;
  riskReward: number;
  session: 'london' | 'new-york' | 'tokyo' | 'sydney' | 'overlap';
  direction: 'long' | 'short';
  setupType: 'breakout' | 'pullback' | 'reversal' | 'scalp' | 'swing' | 'position';
  ruleViolations: RuleViolation[];
  emotionalState: 'calm' | 'fearful' | 'greedy' | 'revenge' | 'overconfident';
  holdingTime: number; // in minutes
  maxDrawdown: number;
  maxProfit: number;
  exitReason: 'stop-loss' | 'take-profit' | 'manual' | 'margin-call' | 'time-exit';
  commission: number;
  swap: number;
  tags: string[];
  notes: string;
}

export interface RuleViolation {
  type: 'position-size' | 'risk-reward' | 'overtrading' | 'revenge' | 'no-stop-loss' | 'moving-stop-loss' | 'early-exit' | 'late-exit';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface TradingSession {
  date: string;
  session: string;
  trades: Trade[];
  totalPnL: number;
  winRate: number;
  totalTrades: number;
  violations: RuleViolation[];
}

export interface MarketConditions {
  volatility: 'low' | 'medium' | 'high' | 'extreme';
  trend: 'bullish' | 'bearish' | 'sideways';
  newsImpact: 'none' | 'low' | 'medium' | 'high' | 'extreme';
  liquidity: 'high' | 'medium' | 'low';
}

export interface PerformanceMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalProfitLoss: number;
  averageWin: number;
  averageLoss: number;
  averageRiskReward: number;
  expectancy: number;
  profitFactor: number;
  maxDrawdown: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  totalCommission: number;
  totalSwap: number;
}

export interface BehavioralInsight {
  id: string;
  type: 'revenge-trading' | 'overtrading' | 'position-escalation' | 'holding-losers' | 'poor-recovery' | 'time-pattern' | 'setup-bias';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedTrades: string[];
  recommendation: string;
  frequency: number; // how often this pattern occurs
  impact: number; // impact on PnL
}

export interface DisciplineScore {
  overall: number;
  riskManagement: number;
  ruleAdherence: number;
  emotionalControl: number;
  consistency: number;
  breakdown: {
    category: string;
    score: number;
    weight: number;
    factors: string[];
  }[];
}

export interface TimePerformance {
  hour: number;
  dayOfWeek: number;
  winRate: number;
  totalTrades: number;
  averagePnL: number;
  profitFactor: number;
  bestHour: boolean;
}

export interface SymbolPerformance {
  symbol: string;
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  averagePnL: number;
  averageRiskReward: number;
  bestSetup: string;
  worstSetup: string;
  volatility: number;
  spread: number;
}
