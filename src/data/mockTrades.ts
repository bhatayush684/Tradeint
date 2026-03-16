import { Trade, RuleViolation } from './types';

// Generate realistic mock trading data
const symbols = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'USD/CHF'];
const setupTypes = ['breakout', 'pullback', 'reversal', 'scalp', 'swing', 'position'];
const sessions = ['london', 'new-york', 'tokyo', 'sydney', 'overlap'];
const directions = ['long', 'short'];
const emotionalStates = ['calm', 'fearful', 'greedy', 'revenge', 'overconfident'];
const exitReasons = ['stop-loss', 'take-profit', 'manual', 'margin-call', 'time-exit'];

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRuleViolations(): RuleViolation[] {
  const violations: RuleViolation[] = [];
  const violationCount = Math.random() < 0.3 ? Math.floor(Math.random() * 3) + 1 : 0;
  
  for (let i = 0; i < violationCount; i++) {
    const types: RuleViolation['type'][] = ['position-size', 'risk-reward', 'overtrading', 'revenge', 'no-stop-loss', 'moving-stop-loss', 'early-exit', 'late-exit'];
    const severities: RuleViolation['severity'][] = ['low', 'medium', 'high', 'critical'];
    
    violations.push({
      type: randomChoice(types),
      severity: randomChoice(severities),
      description: `Violation detected: ${randomChoice(types)} issue`
    });
  }
  
  return violations;
}

function generateTrade(index: number): Trade {
  const symbol = randomChoice(symbols);
  const direction = randomChoice(directions) as Trade['direction'];
  const setupType = randomChoice(setupTypes) as Trade['setupType'];
  const session = randomChoice(sessions) as Trade['session'];
  const emotionalState = randomChoice(emotionalStates) as Trade['emotionalState'];
  const exitReason = randomChoice(exitReasons) as Trade['exitReason'];
  
  // Generate realistic price data
  const basePrice = randomBetween(1.05, 1.35); // For major pairs
  const spread = randomBetween(0.5, 3.0);
  const volatility = randomBetween(0.001, 0.02);
  
  const entryPrice = basePrice + (Math.random() - 0.5) * volatility * 10;
  const riskAmount = randomBetween(10, 100); // Risk in pips
  const rewardAmount = riskAmount * randomBetween(0.8, 3.5); // R:R ratio
  
  const exitPrice = direction === 'long' 
    ? entryPrice + (Math.random() < 0.45 ? rewardAmount : -riskAmount) * 0.0001
    : entryPrice - (Math.random() < 0.45 ? rewardAmount : -riskAmount) * 0.0001;
  
  const positionSize = randomBetween(0.01, 2.0);
  const profitLoss = direction === 'long' 
    ? (exitPrice - entryPrice) * 100000 * positionSize
    : (entryPrice - exitPrice) * 100000 * positionSize;
  
  const entryTime = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000); // Last 90 days
  const holdingTime = randomBetween(5, 2880); // 5 minutes to 48 hours
  const exitTime = new Date(entryTime.getTime() + holdingTime * 60 * 1000);
  
  const maxDrawdown = Math.abs(randomBetween(0, Math.abs(profitLoss) * 0.3));
  const maxProfit = Math.abs(randomBetween(0, Math.max(0, profitLoss) * 0.5));
  
  const riskReward = Math.abs(rewardAmount / riskAmount);
  const commission = positionSize * 7; // $7 per lot round turn
  const swap = randomBetween(-5, 5);
  
  return {
    tradeId: `TRD${String(index + 1).padStart(6, '0')}`,
    symbol,
    entryTime,
    exitTime,
    entryPrice: parseFloat(entryPrice.toFixed(5)),
    exitPrice: parseFloat(exitPrice.toFixed(5)),
    positionSize: parseFloat(positionSize.toFixed(2)),
    profitLoss: parseFloat(profitLoss.toFixed(2)),
    riskReward: parseFloat(riskReward.toFixed(2)),
    session,
    direction,
    setupType,
    ruleViolations: generateRuleViolations(),
    emotionalState,
    holdingTime,
    maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
    maxProfit: parseFloat(maxProfit.toFixed(2)),
    exitReason,
    commission: parseFloat(commission.toFixed(2)),
    swap: parseFloat(swap.toFixed(2)),
    tags: [
      setupType,
      session,
      profitLoss > 0 ? 'winner' : 'loser',
      emotionalState !== 'calm' ? 'emotional' : 'disciplined'
    ].filter(Boolean),
    notes: `${setupType} ${direction} trade on ${symbol} during ${session} session`
  };
}

// Generate 500 realistic trades
export const mockTrades: Trade[] = Array.from({ length: 500 }, (_, i) => generateTrade(i));

// Add some specific patterns for behavioral analysis
const revengeTradingPattern = [
  // Loss followed by immediate larger position revenge trade
  generateTrade(501),
  { ...generateTrade(502), positionSize: 0.5, profitLoss: -25, emotionalState: 'fearful' as const },
  { ...generateTrade(503), positionSize: 1.5, profitLoss: -60, emotionalState: 'revenge' as const, ruleViolations: [{ type: 'revenge' as const, severity: 'high' as const, description: 'Revenge trading after loss' }] },
];

const overtradingPattern = [
  // Multiple trades in short time period
  { ...generateTrade(504), entryTime: new Date('2024-01-15T09:00:00Z'), exitTime: new Date('2024-01-15T09:15:00Z') },
  { ...generateTrade(505), entryTime: new Date('2024-01-15T09:20:00Z'), exitTime: new Date('2024-01-15T09:35:00Z') },
  { ...generateTrade(506), entryTime: new Date('2024-01-15T09:40:00Z'), exitTime: new Date('2024-01-15T09:55:00Z') },
  { ...generateTrade(507), entryTime: new Date('2024-01-15T10:00:00Z'), exitTime: new Date('2024-01-15T10:10:00Z'), ruleViolations: [{ type: 'overtrading' as const, severity: 'medium' as const, description: '4 trades within 1 hour' }] },
];

const positionEscalationPattern = [
  // Increasing position sizes after wins
  { ...generateTrade(508), positionSize: 0.1, profitLoss: 15 },
  { ...generateTrade(509), positionSize: 0.2, profitLoss: 30 },
  { ...generateTrade(510), positionSize: 0.5, profitLoss: 50 },
  { ...generateTrade(511), positionSize: 1.0, profitLoss: -120, emotionalState: 'overconfident' as const, ruleViolations: [{ type: 'position-size' as const, severity: 'high' as const, description: 'Position size escalation after winning streak' }] },
];

// Combine all trades
export const allMockTrades: Trade[] = [
  ...mockTrades,
  ...revengeTradingPattern,
  ...overtradingPattern,
  ...positionEscalationPattern,
].sort((a, b) => a.entryTime.getTime() - b.entryTime.getTime());

// Export categorized data for easier testing
export const winningTrades = allMockTrades.filter(t => t.profitLoss > 0);
export const losingTrades = allMockTrades.filter(t => t.profitLoss <= 0);
export const tradesWithViolations = allMockTrades.filter(t => t.ruleViolations.length > 0);
export const emotionalTrades = allMockTrades.filter(t => t.emotionalState !== 'calm');

// CSV format for upload functionality
export const tradesCSVHeaders = [
  'tradeId', 'symbol', 'entryTime', 'exitTime', 'entryPrice', 'exitPrice', 
  'positionSize', 'profitLoss', 'riskReward', 'session', 'direction', 
  'setupType', 'emotionalState', 'holdingTime', 'maxDrawdown', 'maxProfit', 
  'exitReason', 'commission', 'swap', 'tags', 'notes'
];

export function tradesToCSV(trades: Trade[]): string {
  const headers = tradesCSVHeaders.join(',');
  const rows = trades.map(trade => [
    trade.tradeId,
    trade.symbol,
    trade.entryTime.toISOString(),
    trade.exitTime.toISOString(),
    trade.entryPrice,
    trade.exitPrice,
    trade.positionSize,
    trade.profitLoss,
    trade.riskReward,
    trade.session,
    trade.direction,
    trade.setupType,
    trade.emotionalState,
    trade.holdingTime,
    trade.maxDrawdown,
    trade.maxProfit,
    trade.exitReason,
    trade.commission,
    trade.swap,
    `"${trade.tags.join(';')}"`,
    `"${trade.notes}"`
  ].join(','));
  
  return [headers, ...rows].join('\n');
}

export function csvToTrades(csv: string): Trade[] {
  const lines = csv.split('\n').filter(line => line.trim());
  if (lines.length <= 1) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const trades: Trade[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    if (values.length !== headers.length) continue;
    
    const trade: Partial<Trade> = {};
    headers.forEach((header, index) => {
      const value = values[index];
      switch (header) {
        case 'tradeId':
          trade.tradeId = value;
          break;
        case 'symbol':
          trade.symbol = value;
          break;
        case 'entryTime':
        case 'exitTime':
          trade[header] = new Date(value);
          break;
        case 'entryPrice':
        case 'exitPrice':
        case 'positionSize':
        case 'profitLoss':
        case 'riskReward':
        case 'holdingTime':
        case 'maxDrawdown':
        case 'maxProfit':
        case 'commission':
        case 'swap':
          trade[header] = parseFloat(value);
          break;
        case 'session':
        case 'direction':
        case 'setupType':
        case 'emotionalState':
        case 'exitReason':
          (trade as Record<string, unknown>)[header] = value;
          break;
        case 'tags':
          trade.tags = value.split(';').filter(t => t.trim());
          break;
        case 'notes':
          trade.notes = value;
          break;
      }
    });
    
    // Set defaults for required fields
    trade.ruleViolations = [];
    if (!trade.tags) trade.tags = [];
    if (!trade.notes) trade.notes = '';
    
    trades.push(trade as Trade);
  }
  
  return trades;
}
