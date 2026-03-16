import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, X, TrendingUp, 
  TrendingDown, Target, Clock, DollarSign, Activity 
} from 'lucide-react';
import { allMockTrades } from '@/data';
import { Trade } from '@/data/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DotProps {
  cx?: number;
  cy?: number;
  payload?: {
    type?: string;
    price: number;
    time: number;
  };
  index?: number;
}
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';

interface TradeReplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  tradeId?: string;
}

interface PricePoint {
  time: string;
  price: number;
  type: 'entry' | 'exit' | 'movement';
}

export default function TradeReplayModal({ isOpen, onClose, tradeId }: TradeReplayModalProps) {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [chartData, setChartData] = useState<PricePoint[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Find the trade when modal opens
  useEffect(() => {
    if (isOpen && tradeId) {
      const trade = allMockTrades.find(t => t.tradeId === tradeId);
      if (trade) {
        setSelectedTrade(trade);
        generateChartData(trade);
      }
    }
  }, [isOpen, tradeId]);

  // Generate chart data based on real trade
  const generateChartData = (trade: Trade) => {
    const entryTime = new Date(trade.entryTime);
    const exitTime = new Date(trade.exitTime);
    const duration = exitTime.getTime() - entryTime.getTime();
    const points: PricePoint[] = [];

    // Add entry point
    points.push({
      time: entryTime.toLocaleTimeString(),
      price: trade.entryPrice,
      type: 'entry'
    });

    // Generate realistic price movement
    const numPoints = 20;
    for (let i = 1; i < numPoints - 1; i++) {
      const progress = i / (numPoints - 1);
      const timeOffset = progress * duration;
      const pointTime = new Date(entryTime.getTime() + timeOffset);
      
      // Create realistic price movement
      const trend = trade.profitLoss > 0 ? 1 : -1;
      const volatility = Math.random() * 0.002 - 0.001; // Random volatility
      const baseMove = trend * progress * Math.abs(trade.exitPrice - trade.entryPrice);
      const randomWalk = volatility * trade.entryPrice * Math.sin(progress * Math.PI * 4);
      
      const price = trade.entryPrice + baseMove + randomWalk;
      
      points.push({
        time: pointTime.toLocaleTimeString(),
        price: parseFloat(price.toFixed(5)),
        type: 'movement'
      });
    }

    // Add exit point
    points.push({
      time: exitTime.toLocaleTimeString(),
      price: trade.exitPrice,
      type: 'exit'
    });

    setChartData(points);
    setCurrentTime(0);
  };

  // Playback controls
  useEffect(() => {
    if (isPlaying && selectedTrade) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + playbackSpeed;
          if (next >= chartData.length - 1) {
            setIsPlaying(false);
            return chartData.length - 1;
          }
          return next;
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, chartData.length, selectedTrade]);

  const currentPrice = chartData[currentTime]?.price || selectedTrade?.entryPrice || 0;
  const currentPnL = selectedTrade ? 
    (currentPrice - selectedTrade.entryPrice) * selectedTrade.positionSize * 
    (selectedTrade.direction === 'long' ? 1 : -1) : 0;

  const formatTime = (seconds: number) => {
    if (selectedTrade) {
      const entryTime = new Date(selectedTrade.entryTime);
      const currentTime = new Date(entryTime.getTime() + (seconds * 1000));
      return currentTime.toLocaleTimeString();
    }
    return '00:00:00';
  };

  const calculateProgress = () => {
    if (!selectedTrade) return 0;
    const entryTime = new Date(selectedTrade.entryTime);
    const exitTime = new Date(selectedTrade.exitTime);
    const totalDuration = exitTime.getTime() - entryTime.getTime();
    const currentDuration = (currentTime / (chartData.length - 1)) * totalDuration;
    return (currentDuration / totalDuration) * 100;
  };

  if (!selectedTrade) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Trade Replay</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedTrade.tradeId} - {selectedTrade.symbol}
                </p>
              </div>
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          {/* Trade Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <div className="text-xl font-mono font-bold">
                  {selectedTrade.entryPrice.toFixed(5)}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-4 text-center">
                <div className="text-sm text-muted-foreground mb-1">Exit Price</div>
                <div className="text-xl font-mono font-bold">
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

          {/* Chart */}
          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">Price Action</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(currentTime)} / {formatTime(chartData.length - 1)}</span>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.slice(0, currentTime + 1)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.3} />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={['dataMin - 0.0005', 'dataMax + 0.0005']}
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
                          <div className="glass-card p-2 text-xs">
                            <div className="font-mono">{data.price.toFixed(5)}</div>
                            <div className="text-muted-foreground">{data.time}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  
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
                    dot={(props: DotProps) => {
                      const point = props.payload;
                      if (point.type === 'entry') {
                        return (
                          <circle r={6} fill="#10b981" stroke="#fff" strokeWidth={2} />
                        );
                      }
                      if (point.type === 'exit') {
                        return (
                          <circle r={6} fill="#ef4444" stroke="#fff" strokeWidth={2} />
                        );
                      }
                      return null;
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Playback Controls */}
          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{calculateProgress().toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateProgress()}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Current P&L */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Current P&L</div>
                    <div className={`text-2xl font-bold ${
                      currentPnL >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {currentPnL >= 0 ? '+' : ''}{currentPnL.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Final P&L</div>
                    <div className={`text-2xl font-bold ${
                      selectedTrade.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedTrade.profitLoss >= 0 ? '+' : ''}{selectedTrade.profitLoss.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                    disabled={currentTime === 0}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>

                  <Button
                    variant={isPlaying ? "default" : "outline"}
                    size="lg"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-16"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentTime(Math.min(chartData.length - 1, currentTime + 10))}
                    disabled={currentTime >= chartData.length - 1}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                {/* Speed Control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Playback Speed</span>
                    <span>{playbackSpeed}x</span>
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
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
