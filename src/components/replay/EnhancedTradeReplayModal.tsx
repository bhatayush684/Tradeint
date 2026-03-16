import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, X, TrendingUp, 
  TrendingDown, Target, Clock, DollarSign, Activity, Volume2, 
  BarChart3, Settings, Maximize2, Minimize2
} from 'lucide-react';
import { dataManager } from '@/lib/data-management';
import { Trade } from '@/data/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea, ComposedChart, Area, AreaChart, Bar } from 'recharts';

interface EnhancedTradeReplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  tradeId?: string;
}

interface PricePoint {
  time: string;
  price: number;
  volume: number;
  type: 'entry' | 'exit' | 'movement';
  timestamp: number;
}

interface MarketData {
  price: number;
  volume: number;
  volatility: number;
  momentum: number;
}

export default function EnhancedTradeReplayModal({ isOpen, onClose, tradeId }: EnhancedTradeReplayModalProps) {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [chartData, setChartData] = useState<PricePoint[]>([]);
  const [showVolume, setShowVolume] = useState(true);
  const [showIndicators, setShowIndicators] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Find trade when modal opens
  useEffect(() => {
    if (isOpen && tradeId) {
      const trades = dataManager.getTrades();
      const trade = trades.find(t => t.tradeId === tradeId);
      if (trade) {
        setSelectedTrade(trade);
        generateRealisticChartData(trade);
      }
    }
  }, [isOpen, tradeId]);

  // Generate realistic chart data based on actual trade
  const generateRealisticChartData = (trade: Trade) => {
    const entryTime = new Date(trade.entryTime);
    const exitTime = new Date(trade.exitTime);
    const duration = exitTime.getTime() - entryTime.getTime();
    const points: PricePoint[] = [];
    const numPoints = 100; // More points for smoother animation

    // Add entry point
    points.push({
      time: entryTime.toLocaleTimeString(),
      price: trade.entryPrice,
      volume: Math.random() * 1000000 + 500000,
      type: 'entry',
      timestamp: entryTime.getTime()
    });

    // Generate realistic price movement
    for (let i = 1; i < numPoints - 1; i++) {
      const progress = i / (numPoints - 1);
      const timeOffset = progress * duration;
      const pointTime = new Date(entryTime.getTime() + timeOffset);
      
      // Create realistic market movement
      const trend = trade.profitLoss > 0 ? 1 : -1;
      const baseMove = trend * progress * Math.abs(trade.exitPrice - trade.entryPrice);
      
      // Add market noise and volatility
      const volatility = 0.0002; // Realistic forex volatility
      const noise = (Math.random() - 0.5) * volatility * trade.entryPrice;
      
      // Add cyclical patterns (market cycles)
      const cycle1 = Math.sin(progress * Math.PI * 8) * volatility * trade.entryPrice * 0.5;
      const cycle2 = Math.cos(progress * Math.PI * 12) * volatility * trade.entryPrice * 0.3;
      
      // Combine all factors
      const price = trade.entryPrice + baseMove + noise + cycle1 + cycle2;
      
      // Generate realistic volume profile
      let volume = Math.random() * 1000000 + 500000;
      if (progress < 0.1 || progress > 0.9) {
        volume *= 1.5; // Higher volume at start/end
      }
      
      points.push({
        time: pointTime.toLocaleTimeString(),
        price: parseFloat(price.toFixed(5)),
        volume: Math.round(volume),
        type: 'movement',
        timestamp: pointTime.getTime()
      });
    }

    // Add exit point
    points.push({
      time: exitTime.toLocaleTimeString(),
      price: trade.exitPrice,
      volume: Math.random() * 1000000 + 500000,
      type: 'exit',
      timestamp: exitTime.getTime()
    });

    setChartData(points);
    setCurrentTime(0);
  };

  // Playback controls
  useEffect(() => {
    if (isPlaying && chartData.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + playbackSpeed;
          if (next >= chartData.length - 1) {
            setIsPlaying(false);
            return chartData.length - 1;
          }
          return next;
        });
      }, 50); // 20 FPS for smooth animation
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, playbackSpeed, chartData.length]);

  const currentPrice = chartData[currentTime]?.price || selectedTrade?.entryPrice || 0;
  const currentVolume = chartData[currentTime]?.volume || 0;
  const currentPnL = selectedTrade ? 
    (currentPrice - selectedTrade.entryPrice) * selectedTrade.positionSize * 
    (selectedTrade.direction === 'long' ? 1 : -1) : 0;

  const calculateProgress = () => {
    if (!selectedTrade || chartData.length === 0) return 0;
    return (currentTime / (chartData.length - 1)) * 100;
  };

  const calculateMovingAverage = (data: PricePoint[], period: number) => {
    if (data.length < period) return 0;
    const recent = data.slice(-period);
    const sum = recent.reduce((acc, point) => acc + point.price, 0);
    return sum / period;
  };

  const formatTime = (seconds: number) => {
    if (!selectedTrade) return '00:00:00';
    const entryTime = new Date(selectedTrade.entryTime);
    const currentTime = new Date(entryTime.getTime() + (seconds * 1000));
    return currentTime.toLocaleTimeString();
  };

  if (!selectedTrade) return null;

  const enhancedChartData = chartData.slice(0, currentTime + 1).map((point, index) => {
    const ma20 = calculateMovingAverage(chartData.slice(0, index + 1), 20);
    const ma50 = calculateMovingAverage(chartData.slice(0, index + 1), 50);
    
    return {
      ...point,
      ma20: index >= 19 ? ma20 : null,
      ma50: index >= 49 ? ma50 : null,
      upperBand: index >= 19 ? ma20 * 1.02 : null,
      lowerBand: index >= 19 ? ma20 * 0.98 : null
    };
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isFullscreen ? 'max-w-[95vw] max-h-[95vh]' : 'max-w-6xl max-h-[90vh]'} overflow-hidden`}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Enhanced Trade Replay</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedTrade.tradeId} - {selectedTrade.symbol}
                </p>
              </div>
            </DialogTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className={`${isFullscreen ? 'h-[80vh]' : 'h-[70vh]'} overflow-y-auto p-6 space-y-6`}>
          {/* Trade Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="glass-card border-0">
              <CardContent className="p-4 text-center">
                <div className="text-sm text-muted-foreground mb-1">Direction</div>
                <Badge 
                  variant={selectedTrade.direction === 'long' ? 'default' : 'destructive'}
                  className="text-lg px-3 py-1"
                >
                  {selectedTrade.direction.toUpperCase()}
                </Badge>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-4 text-center">
                <div className="text-sm text-muted-foreground mb-1">Entry Price</div>
                <div className="text-xl font-mono font-bold text-green-600">
                  {selectedTrade.entryPrice.toFixed(5)}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-4 text-center">
                <div className="text-sm text-muted-foreground mb-1">Exit Price</div>
                <div className="text-xl font-mono font-bold text-red-600">
                  {selectedTrade.exitPrice.toFixed(5)}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-4 text-center">
                <div className="text-sm text-muted-foreground mb-1">Position Size</div>
                <div className="text-xl font-mono font-bold">
                  {selectedTrade.positionSize.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Chart */}
          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Price Action Analysis
                </h4>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Volume</span>
                    <Switch
                      checked={showVolume}
                      onCheckedChange={setShowVolume}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Indicators</span>
                    <Switch
                      checked={showIndicators}
                      onCheckedChange={setShowIndicators}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{formatTime(currentTime)} / {formatTime(chartData.length - 1)}</span>
              </div>
            </CardContent>
              
              <ResponsiveContainer width="100%" height={isFullscreen ? 500 : 300}>
                  <ComposedChart data={enhancedChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.3} />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      domain={['dataMin - 0.001', 'dataMax + 0.001']}
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={value => value.toFixed(5)}
                    />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload?.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="glass-card p-3 text-xs">
                            <div className="font-mono font-bold">{data.price.toFixed(5)}</div>
                            <div className="text-muted-foreground">{data.time}</div>
                            {showVolume && (
                              <div className="text-muted-foreground">Vol: {data.volume?.toLocaleString()}</div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  
                  {/* Volume bars */}
                  {showVolume && (
                    <BarChart3>
                      <Bar
                        dataKey="volume"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                        maxBarSize={20}
                      />
                    </BarChart3>
                  )}
                  
                  {/* Entry Line */}
                  <ReferenceLine 
                    y={selectedTrade.entryPrice} 
                    stroke="#10b981" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    label="Entry"
                  />
                  
                  {/* Exit Line */}
                  <ReferenceLine 
                    y={selectedTrade.exitPrice} 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    label="Exit"
                  />
                  
                  {/* Current Price Line */}
                  <ReferenceLine 
                    y={currentPrice} 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    label="Current"
                  />
                  
                  {/* Profit/Loss Area */}
                  <ReferenceArea 
                    y1={selectedTrade.entryPrice}
                    y2={selectedTrade.exitPrice}
                    fill={selectedTrade.profitLoss > 0 ? '#10b981' : '#ef4444'}
                    fillOpacity={0.1}
                  />
                  
                  {/* Moving Averages */}
                  {showIndicators && (
                    <>
                      <Line
                        type="monotone"
                        dataKey="ma20"
                        stroke="#f59e0b"
                        strokeWidth={1}
                        dot={false}
                        strokeDasharray="3 3"
                      />
                      <Line
                        type="monotone"
                        dataKey="ma50"
                        stroke="#06b6d4"
                        strokeWidth={1}
                        dot={false}
                        strokeDasharray="3 3"
                      />
                      <Line
                        type="monotone"
                        dataKey="upperBand"
                        stroke="#10b981"
                        strokeWidth={1}
                        dot={false}
                        strokeOpacity={0.5}
                      />
                      <Line
                        type="monotone"
                        dataKey="lowerBand"
                        stroke="#10b981"
                        strokeWidth={1}
                        dot={false}
                        strokeOpacity={0.5}
                      />
                    </>
                  )}
                  
                  {/* Main Price Line */}
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={false}
                  />
                  
                  {/* Entry/Exit Markers */}
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="transparent"
                    strokeWidth={0}
                    dot={(props: { payload?: { type?: string; price?: number; time?: string | number; volume?: number; [key: string]: unknown } }) => {
                      const point = props.payload;
                      if (point.type === 'entry') {
                        return (
                          <circle r={8} fill="#10b981" stroke="#fff" strokeWidth={2} />
                        );
                      }
                      if (point.type === 'exit') {
                        return (
                          <circle r={8} fill="#ef4444" stroke="#fff" strokeWidth={2} />
                        );
                      }
                      return null;
                    }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
          </Card>

          {/* Playback Controls */}
          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{calculateProgress().toFixed(1)}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateProgress()}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Current P&L */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2 flex items-center justify-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Current P&L</span>
                    </div>
                    <div className={`text-3xl font-bold ${
                      currentPnL >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {currentPnL >= 0 ? '+' : ''}{currentPnL.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {((currentPnL / (selectedTrade.entryPrice * selectedTrade.positionSize)) * 100).toFixed(2)}% from entry
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2 flex items-center justify-center gap-2">
                      <Target className="h-4 w-4" />
                      <span>Final P&L</span>
                    </div>
                    <div className={`text-3xl font-bold ${
                      selectedTrade.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedTrade.profitLoss >= 0 ? '+' : ''}{selectedTrade.profitLoss.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {selectedTrade.setupType} • {selectedTrade.session}
                    </div>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-center gap-6">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setCurrentTime(Math.max(0, currentTime - 5))}
                    disabled={currentTime === 0}
                  >
                    <SkipBack className="h-5 w-5" />
                  </Button>

                  <Button
                    variant={isPlaying ? "default" : "outline"}
                    size="lg"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-20"
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setCurrentTime(Math.min(chartData.length - 1, currentTime + 5))}
                    disabled={currentTime >= chartData.length - 1}
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>
                </div>

                {/* Speed Control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      <span>Playback Speed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{playbackSpeed}x</span>
                      <div className="flex gap-1">
                        {[0.5, 1, 2, 3, 5].map(speed => (
                          <Button
                            key={speed}
                            variant={playbackSpeed === speed ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPlaybackSpeed(speed)}
                          >
                            {speed}x
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Slider
                    value={[playbackSpeed]}
                    onValueChange={(value) => setPlaybackSpeed(value[0])}
                    max={5}
                    min={0.5}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-muted-foreground">Duration</div>
                    <div className="font-bold">
                      {Math.floor((new Date(selectedTrade.exitTime).getTime() - new Date(selectedTrade.entryTime).getTime()) / 60000)}m
                    </div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-muted-foreground">Risk/Reward</div>
                    <div className="font-bold">{selectedTrade.riskReward.toFixed(1)}</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-muted-foreground">Max Drawdown</div>
                    <div className="font-bold">{selectedTrade.maxDrawdown.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
