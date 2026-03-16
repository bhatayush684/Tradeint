import { useState } from 'react';
import React from 'react';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, 
  ComposedChart, Legend
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Target, Calendar, BarChart3 } from 'lucide-react';
import { allMockTrades } from '@/data';
import { calculateEquityCurve, calculateTimePerformance, calculateMonthlyPerformance, calculateSymbolPerformance } from '@/lib/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EquityTooltip, PercentTooltip, TradeTooltip } from './CustomTooltip';

const timeRanges = ['1W', '1M', '3M', '6M', '1Y', 'ALL'] as const;
const chartTypes = ['equity', 'performance', 'heatmap', 'symbols'] as const;

interface ChartData {
  date: string;
  equity: number;
  profit: number;
  loss: number;
  winRate: number;
  trades: number;
}

export default function EnhancedPerformanceCharts() {
  const [timeRange, setTimeRange] = useState<string>('ALL');
  const [chartType, setChartType] = useState<string>('equity');

  // Calculate real analytics data
  const equityCurve = calculateEquityCurve(allMockTrades);
  const monthlyPerformance = calculateMonthlyPerformance(allMockTrades);
  const timePerformance = calculateTimePerformance(allMockTrades);
  const symbolPerformance = calculateSymbolPerformance(allMockTrades);

  interface ChartDataPoint {
  [key: string]: string | number | Date;
}

  // Filter data based on time range
  const filterData = (data: ChartDataPoint[]) => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeRange) {
      case '1W':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '1M':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6M':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1Y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return data;
    }
    
    return data.filter(item => new Date(item.date || item.month) >= cutoffDate);
  };

  const filteredEquity = filterData(equityCurve);
  const filteredMonthly = filterData(monthlyPerformance);

  // Prepare chart data
  const equityChartData = filteredEquity.map((point, index) => ({
    ...point,
    profit: Math.max(0, Number(point.equity)),
    loss: Math.min(0, Number(point.equity)),
    change: index > 0 ? Number(point.equity) - Number(filteredEquity[index - 1].equity) : 0,
    changePercent: index > 0 ? ((Number(point.equity) - Number(filteredEquity[index - 1].equity)) / Math.abs(Number(filteredEquity[index - 1].equity))) * 100 : 0
  }));

  const performanceChartData = filteredMonthly.map(month => ({
    month: new Date(month.month).toLocaleDateString('en', { month: 'short' }),
    wins: month.winningTrades,
    losses: month.losingTrades,
    winRate: month.winRate,
    totalPnL: month.totalProfitLoss,
    avgWin: month.averageWin,
    avgLoss: Math.abs(month.averageLoss),
    profitFactor: month.profitFactor
  }));

  // Symbol performance data for pie chart
  const symbolChartData = symbolPerformance.slice(0, 8).map(symbol => ({
    name: symbol.symbol,
    value: Math.abs(symbol.totalPnL),
    trades: symbol.totalTrades,
    winRate: symbol.winRate,
    fill: symbol.totalPnL > 0 ? '#10b981' : '#ef4444'
  }));

  // Custom gradient definitions
  const gradients = (
    <defs>
      <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
      </linearGradient>
      <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
        <stop offset="100%" stopColor="#10b981" stopOpacity={0.2} />
      </linearGradient>
      <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
        <stop offset="100%" stopColor="#ef4444" stopOpacity={0.2} />
      </linearGradient>
    </defs>
  );

  const renderChart = () => {
    switch (chartType) {
      case 'equity':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-violet-600" />
                <h3 className="text-lg font-semibold">Equity Curve</h3>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {filteredEquity.length} data points
                </Badge>
                {filteredEquity.length > 0 && (
                  <Badge 
                    variant={Number(filteredEquity[filteredEquity.length - 1].equity) >= 0 ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {Number(filteredEquity[filteredEquity.length - 1].equity) >= 0 ? '+' : ''}
                    ${Number(filteredEquity[filteredEquity.length - 1].equity).toFixed(0)}
                  </Badge>
                )}
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={equityChartData}>
                {gradients}
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<EquityTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="equity" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  fill="url(#equityGradient)" 
                  name="Equity"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Monthly Performance</h3>
            </div>
            
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={performanceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                  tickFormatter={v => `${v.toFixed(0)}%`}
                />
                <Tooltip content={<TradeTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="wins" fill="#10b981" radius={[4, 4, 0, 0]} name="Wins" />
                <Bar yAxisId="left" dataKey="losses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Losses" />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="winRate" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#8b5cf6' }}
                  name="Win Rate"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        );

      case 'heatmap':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold">Trading Activity Heatmap</h3>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {['Time', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-muted-foreground p-2">
                  {day}
                </div>
              ))}
              
              {Array.from({ length: 24 }, (_, hour) => (
                <React.Fragment key={hour}>
                  <div className="text-xs font-mono text-muted-foreground p-2 text-right">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    const dayNum = dayIndex === 0 ? 1 : dayIndex + 1;
                    const hourPerf = timePerformance.find(p => p.hour === hour && p.dayOfWeek === dayNum);
                    const value = hourPerf ? hourPerf.averagePnL : (Math.random() - 0.5) * 100;
                    const intensity = Math.min(1, Math.max(0, (value + 100) / 200));
                    const bgColor = value > 50 ? 'bg-green-500' : 
                                     value > 0 ? 'bg-green-300' : 
                                     value > -50 ? 'bg-red-300' : 'bg-red-500';
                    
                    return (
                      <div
                        key={dayIndex}
                        className={`aspect-square rounded-md flex items-center justify-center text-xs font-mono cursor-pointer transition-all hover:scale-110 ${bgColor}`}
                        style={{ 
                          opacity: 0.3 + (intensity * 0.7),
                          color: intensity > 0.5 ? 'white' : '#374151'
                        }}
                        title={`${hour}:00 - Day ${dayNum}: $${value.toFixed(0)}`}
                      >
                        {value !== 0 && (value > 0 ? '+' : '')}{value.toFixed(0)}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        );

      case 'symbols':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">Symbol Performance</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={symbolChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: $${value.toFixed(0)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {symbolChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<TradeTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">Top Performers</h4>
                {symbolPerformance.slice(0, 5).map((symbol, index) => (
                  <motion.div
                    key={symbol.symbol}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {symbol.symbol.substring(0, 3)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">{symbol.symbol}</div>
                        <div className="text-xs text-muted-foreground">
                          {symbol.totalTrades} trades • {symbol.winRate.toFixed(0)}% WR
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${symbol.totalPnL > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {symbol.totalPnL > 0 ? '+' : ''}${symbol.totalPnL.toFixed(0)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        R:R {symbol.averageRiskReward.toFixed(1)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="glass-card border-0 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Advanced Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Interactive trading performance visualization
              </p>
            </div>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Time Range Selector */}
            <div className="flex bg-muted/50 p-1 rounded-lg">
              {timeRanges.map(range => (
                <Button
                  key={range}
                  variant={timeRange === range ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                  className="text-xs px-3 py-1 h-auto"
                >
                  {range}
                </Button>
              ))}
            </div>
            
            {/* Chart Type Selector */}
            <div className="flex bg-muted/50 p-1 rounded-lg">
              {chartTypes.map(type => (
                <Button
                  key={type}
                  variant={chartType === type ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setChartType(type)}
                  className="text-xs px-3 py-1 h-auto capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <motion.div
          key={`${timeRange}-${chartType}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="min-h-[400px]"
        >
          {renderChart()}
        </motion.div>
      </CardContent>
    </Card>
  );
}
