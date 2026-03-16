import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar } from 'recharts';
import { TrendingUp, TrendingDown, Target, Activity, DollarSign, BarChart3, PieChartIcon, LineChartIcon, Award, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CSVManager from '@/csvManager';
import { CSVTradeData } from '@/csvManager';

const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AnalyticsPage() {
  const [trades, setTrades] = useState<CSVTradeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = () => {
    setIsLoading(true);
    try {
      let csvTrades = CSVManager.loadFromLocalStorage();
      
      // Force refresh with new data if we have less than 25 trades
      if (csvTrades.length < 25) {
        console.log('Refreshing analytics with new sample data...');
        csvTrades = []; // Clear existing to force reload
      }
      
      // If no data exists, initialize with sample trades
      if (csvTrades.length === 0) {
        const sampleTrades: CSVTradeData[] = [
          {
            id: 'TR-001',
            date: '2025-03-15',
            pair: 'EUR/USD',
            direction: 'long',
            entry: 1.0842,
            exit: 1.0891,
            positionSize: 1.5,
            result: 367.50,
            rr: 2.1,
            ruleViolation: null,
            notes: 'Good breakout setup with strong momentum'
          },
          {
            id: 'TR-002', 
            date: '2025-03-14',
            pair: 'GBP/USD',
            direction: 'long',
            entry: 1.2654,
            exit: 1.2612,
            positionSize: 1.0,
            result: -420.00,
            rr: -1.2,
            ruleViolation: 'Oversized Position',
            notes: 'Violated position sizing rules, need to be more disciplined'
          },
          {
            id: 'TR-003',
            date: '2025-03-13', 
            pair: 'USD/JPY',
            direction: 'short',
            entry: 150.42,
            exit: 149.88,
            positionSize: 2.0,
            result: 720.00,
            rr: 3.1,
            ruleViolation: null,
            notes: 'Perfect risk/reward setup, followed plan exactly'
          },
          {
            id: 'TR-004',
            date: '2025-03-12',
            pair: 'AUD/USD',
            direction: 'long',
            entry: 0.6543,
            exit: 0.6578,
            positionSize: 1.0,
            result: 350.00,
            rr: 1.8,
            ruleViolation: null,
            notes: 'Clean reversal trade, respected support levels'
          },
          {
            id: 'TR-005',
            date: '2025-03-11',
            pair: 'EUR/GBP',
            direction: 'short',
            entry: 0.8567,
            exit: 0.8534,
            positionSize: 0.5,
            result: -165.00,
            rr: -0.8,
            ruleViolation: 'Traded During News',
            notes: 'Got caught in news volatility, should have avoided'
          },
          {
            id: 'TR-006',
            date: '2025-03-10',
            pair: 'USD/CAD',
            direction: 'short',
            entry: 1.3521,
            exit: 1.3478,
            positionSize: 1.5,
            result: 477.00,
            rr: 2.4,
            ruleViolation: null,
            notes: 'Trend continuation trade worked perfectly'
          },
          {
            id: 'TR-007',
            date: '2025-03-09',
            pair: 'NZD/USD',
            direction: 'long',
            entry: 0.6198,
            exit: 0.6231,
            positionSize: 1.0,
            result: 330.00,
            rr: 1.6,
            ruleViolation: null,
            notes: 'Good risk management, solid R:R ratio'
          },
          {
            id: 'TR-008',
            date: '2025-03-08',
            pair: 'GBP/JPY',
            direction: 'short',
            entry: 190.54,
            exit: 191.12,
            positionSize: 0.8,
            result: -464.00,
            rr: -1.5,
            ruleViolation: 'No Stop Loss',
            notes: 'Forgot to set stop loss, costly mistake'
          },
          {
            id: 'TR-009',
            date: '2025-03-07',
            pair: 'EUR/USD',
            direction: 'long',
            entry: 1.0765,
            exit: 1.0812,
            positionSize: 2.0,
            result: 940.00,
            rr: 2.8,
            ruleViolation: null,
            notes: 'Breakout trade with excellent momentum'
          },
          {
            id: 'TR-010',
            date: '2025-03-06',
            pair: 'USD/CHF',
            direction: 'short',
            entry: 0.8821,
            exit: 0.8789,
            positionSize: 1.0,
            result: 362.00,
            rr: 1.9,
            ruleViolation: null,
            notes: 'Safe haven trade during risk-off sentiment'
          },
          {
            id: 'TR-011',
            date: '2025-03-05',
            pair: 'AUD/JPY',
            direction: 'long',
            entry: 98.45,
            exit: 97.88,
            positionSize: 1.2,
            result: -684.00,
            rr: -2.1,
            ruleViolation: 'Revenge Trade',
            notes: 'Revenge trading after previous loss, emotional decision'
          },
          {
            id: 'TR-012',
            date: '2025-03-04',
            pair: 'EUR/USD',
            direction: 'long',
            entry: 1.0901,
            exit: 1.0948,
            positionSize: 1.0,
            result: 470.00,
            rr: 2.5,
            ruleViolation: null,
            notes: 'Technical analysis paid off, clean entry'
          },
          {
            id: 'TR-013',
            date: '2025-03-03',
            pair: 'USD/CAD',
            direction: 'long',
            entry: 1.3456,
            exit: 1.3512,
            positionSize: 0.8,
            result: 448.00,
            rr: 2.2,
            ruleViolation: null,
            notes: 'Oil price rally helped CAD, but managed risk well'
          },
          {
            id: 'TR-014',
            date: '2025-03-02',
            pair: 'GBP/USD',
            direction: 'short',
            entry: 1.2789,
            exit: 1.2745,
            positionSize: 1.5,
            result: 660.00,
            rr: 3.0,
            ruleViolation: null,
            notes: 'Perfect short setup at resistance level'
          },
          {
            id: 'TR-015',
            date: '2025-03-01',
            pair: 'EUR/JPY',
            direction: 'long',
            entry: 162.34,
            exit: 161.89,
            positionSize: 1.0,
            result: -450.00,
            rr: -1.8,
            ruleViolation: 'Early Entry',
            notes: 'Entered too early, missed better entry point'
          },
          {
            id: 'TR-016',
            date: '2025-02-28',
            pair: 'AUD/USD',
            direction: 'short',
            entry: 0.6621,
            exit: 0.6587,
            positionSize: 1.2,
            result: 408.00,
            rr: 2.0,
            ruleViolation: null,
            notes: 'Risk sentiment shift favored AUD shorts'
          },
          {
            id: 'TR-017',
            date: '2025-02-27',
            pair: 'USD/CHF',
            direction: 'long',
            entry: 0.8756,
            exit: 0.8723,
            positionSize: 0.5,
            result: -165.00,
            rr: -0.9,
            ruleViolation: 'Overtrading',
            notes: 'Too many trades today, should have waited'
          },
          {
            id: 'TR-018',
            date: '2025-02-26',
            pair: 'EUR/GBP',
            direction: 'long',
            entry: 0.8423,
            exit: 0.8467,
            positionSize: 1.0,
            result: 440.00,
            rr: 2.2,
            ruleViolation: null,
            notes: 'Cross currency pair worked well with Brexit news'
          },
          {
            id: 'TR-019',
            date: '2025-02-25',
            pair: 'GBP/JPY',
            direction: 'long',
            entry: 189.67,
            exit: 190.45,
            positionSize: 0.8,
            result: 624.00,
            rr: 2.8,
            ruleViolation: null,
            notes: 'Yen weakness boosted GBPJPY, great timing'
          },
          {
            id: 'TR-020',
            date: '2025-02-24',
            pair: 'NZD/USD',
            direction: 'short',
            entry: 0.6289,
            exit: 0.6324,
            positionSize: 1.0,
            result: -350.00,
            rr: -1.4,
            ruleViolation: 'Against Trend',
            notes: 'Fighting the uptrend, should have waited for pullback'
          },
          {
            id: 'TR-021',
            date: '2025-02-23',
            pair: 'USD/JPY',
            direction: 'long',
            entry: 149.78,
            exit: 150.34,
            positionSize: 1.5,
            result: 840.00,
            rr: 3.5,
            ruleViolation: null,
            notes: 'Fed minutes boosted USD, perfect entry'
          },
          {
            id: 'TR-022',
            date: '2025-02-22',
            pair: 'EUR/USD',
            direction: 'short',
            entry: 1.0987,
            exit: 1.0943,
            positionSize: 1.0,
            result: 440.00,
            rr: 2.0,
            ruleViolation: null,
            notes: 'ECB comments weakened euro, good short'
          },
          {
            id: 'TR-023',
            date: '2025-02-21',
            pair: 'AUD/CAD',
            direction: 'long',
            entry: 0.8856,
            exit: 0.8891,
            positionSize: 0.8,
            result: 280.00,
            rr: 1.6,
            ruleViolation: null,
            notes: 'Commodity currencies correlation worked'
          },
          {
            id: 'TR-024',
            date: '2025-02-20',
            pair: 'GBP/USD',
            direction: 'short',
            entry: 1.2876,
            exit: 1.2912,
            positionSize: 1.2,
            result: -432.00,
            rr: -1.6,
            ruleViolation: 'Late Entry',
            notes: 'Missed the best entry, chased the price'
          },
          {
            id: 'TR-025',
            date: '2025-02-19',
            pair: 'USD/CHF',
            direction: 'short',
            entry: 0.8898,
            exit: 0.8854,
            positionSize: 1.0,
            result: 440.00,
            rr: 2.2,
            ruleViolation: null,
            notes: 'Swiss franc strength during risk aversion'
          }
        ];
        CSVManager.saveToLocalStorage(sampleTrades);
        setTrades(sampleTrades);
      } else {
        setTrades(csvTrades);
      }
    } catch (error) {
      console.error('Error loading trades:', error);
      setTrades([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate derived data from CSV trades
  const pairDistribution = (() => {
    const map: Record<string, number> = {};
    trades.forEach(t => { map[t.pair] = (map[t.pair] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  })();

  const statsData = [
    { title: 'Total Trades', value: trades.length, icon: BarChart3, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { title: 'Win Rate', value: trades.length > 0 ? `${((trades.filter(t => t.result > 0).length / trades.length) * 100).toFixed(1)}%` : '0%', icon: Target, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { title: 'Total P&L', value: `$${trades.reduce((sum, t) => sum + t.result, 0).toFixed(2)}`, icon: DollarSign, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    { title: 'Avg Trade', value: trades.length > 0 ? `$${(trades.reduce((sum, t) => sum + t.result, 0) / trades.length).toFixed(2)}` : '$0.00', icon: TrendingUp, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  ];

  const directionData = [
    { name: 'Long', wins: trades.filter(t => t.direction === 'long' && t.result > 0).length, losses: trades.filter(t => t.direction === 'long' && t.result <= 0).length },
    { name: 'Short', wins: trades.filter(t => t.direction === 'short' && t.result > 0).length, losses: trades.filter(t => t.direction === 'short' && t.result <= 0).length },
  ];

  // Generate equity curve data from trades
  const equityCurveData = (() => {
    let runningEquity = 10000; // Starting equity
    return trades
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(trade => {
        runningEquity += trade.result;
        const month = new Date(trade.date).toLocaleDateString('en-US', { month: 'short' });
        return { date: month, equity: Math.round(runningEquity) };
      });
  })();

  // Generate win/loss data by month
  const winLossData = (() => {
    const monthlyData: Record<string, { wins: number; losses: number }> = {};
    
    trades.forEach(trade => {
      const month = new Date(trade.date).toLocaleDateString('en-US', { month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { wins: 0, losses: 0 };
      }
      if (trade.result > 0) {
        monthlyData[month].wins++;
      } else {
        monthlyData[month].losses++;
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({ month, ...data }));
  })();

  // Generate discipline trend data (rule violations over time)
  const disciplineTrendData = (() => {
    const weeklyData: Record<string, { score: number }> = {};
    const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'];
    
    weeks.forEach((week, index) => {
      // Calculate discipline score based on rule violations in this period
      const tradesInWeek = trades.filter((_, i) => i % weeks.length === index);
      const violationRate = tradesInWeek.filter(t => t.ruleViolation).length / Math.max(tradesInWeek.length, 1);
      weeklyData[week] = { score: Math.round(100 - (violationRate * 100)) };
    });

    return Object.entries(weeklyData).map(([week, data]) => ({ week, ...data }));
  })();

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-4 py-3 text-sm border border-border/50">
      <p className="text-muted-foreground mb-2 font-medium">{label}</p>
      {payload.map((p: { name: string; value: number; color?: string }, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-muted-foreground">{p.name}:</span>
          </div>
          <span className="font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

  return (
    <div className="space-y-8 max-w-[1400px]">
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Analytics</h1>
              <p className="text-muted-foreground">Deep insights into your trading performance</p>
            </div>
            <Badge variant="outline" className="px-4 py-2">
              <Activity className="w-4 h-4 mr-2" />
              Live Data
            </Badge>
          </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cumulative P&L */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Cumulative P&L
            </h3>
            <Badge variant="secondary" className="text-xs">+12.5%</Badge>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={equityCurveData}>
              <defs>
                <linearGradient id="plGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                axisLine={{ stroke: 'hsl(var(--border))' }} 
                tickLine={false} 
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                axisLine={{ stroke: 'hsl(var(--border))' }} 
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="equity" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                fill="url(#plGrad)" 
                name="P&L"
                filter="url(#glow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pair Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-primary" />
              Pair Distribution
            </h3>
            <Badge variant="secondary" className="text-xs">{pairDistribution.length} pairs</Badge>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <defs>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity={0.2}/>
                </filter>
              </defs>
              <Pie 
                data={pairDistribution} 
                cx="50%" 
                cy="50%" 
                innerRadius={70} 
                outerRadius={100} 
                paddingAngle={2} 
                dataKey="value" 
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} 
                labelLine={false}
                filter="url(#shadow)"
              >
                {pairDistribution.map((_, i) => (
                  <Cell 
                    key={i} 
                    fill={colors[i % colors.length]}
                    stroke={colors[i % colors.length]}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Direction Performance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Long vs Short Performance
            </h3>
            <Badge variant="secondary" className="text-xs">Win Rate Analysis</Badge>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={directionData}>
              <defs>
                <linearGradient id="winsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="lossesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                axisLine={{ stroke: 'hsl(var(--border))' }} 
                tickLine={false} 
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                axisLine={{ stroke: 'hsl(var(--border))' }} 
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="wins" 
                fill="url(#winsGrad)" 
                radius={[8, 8, 0, 0]} 
                name="Wins"
                maxBarSize={60}
              />
              <Bar 
                dataKey="losses" 
                fill="url(#lossesGrad)" 
                radius={[8, 8, 0, 0]} 
                name="Losses"
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Discipline Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-primary" />
              Discipline Score Trend
            </h3>
            <Badge variant="secondary" className="text-xs">8 weeks</Badge>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={disciplineTrendData}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="100%" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
                </linearGradient>
                <filter id="lineGlow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="week" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                axisLine={{ stroke: 'hsl(var(--border))' }} 
                tickLine={false} 
              />
              <YAxis 
                domain={[60, 100]} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                axisLine={{ stroke: 'hsl(var(--border))' }} 
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="url(#lineGrad)" 
                strokeWidth={3} 
                dot={{ 
                  r: 6, 
                  fill: '#3b82f6', 
                  stroke: '#fff', 
                  strokeWidth: 2,
                  filter: "url(#lineGlow)"
                }} 
                activeDot={{ 
                  r: 8, 
                  fill: '#8b5cf6', 
                  stroke: '#fff', 
                  strokeWidth: 3 
                }}
                name="Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
        </>
      )}
    </div>
  );
}
