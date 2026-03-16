import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, Calendar, Clock, AlertTriangle, TrendingUp, Globe, Filter } from 'lucide-react';
import NewsSection from '@/components/NewsSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CSVManager from '@/csvManager';
import { CSVTradeData } from '@/csvManager';

export default function NewsPage() {
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
        console.log('Refreshing news page with new sample data...');
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

  // Calculate news trading performance from CSV data
  const newsPerformanceMetrics = (() => {
    const newsRelatedTrades = trades.filter(t => t.ruleViolation === 'Traded During News');
    const totalPnL = newsRelatedTrades.reduce((sum, t) => sum + t.result, 0);
    const winRate = newsRelatedTrades.length > 0 
      ? (newsRelatedTrades.filter(t => t.result > 0).length / newsRelatedTrades.length) * 100 
      : 0;
    const avgRiskReward = newsRelatedTrades.length > 0
      ? newsRelatedTrades.reduce((sum, t) => sum + Math.abs(t.rr), 0) / newsRelatedTrades.length
      : 0;
    const expectancy = newsRelatedTrades.length > 0
      ? totalPnL / newsRelatedTrades.length
      : 0;
    const disciplineScore = newsRelatedTrades.length > 0
      ? Math.max(0, 100 - (newsRelatedTrades.filter(t => t.ruleViolation).length / newsRelatedTrades.length * 100))
      : 100;

    return {
      totalPnL,
      winRate,
      avgRiskReward,
      expectancy,
      disciplineScore
    };
  })();

  return (
    <div className="space-y-8 max-w-[1400px]">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">News & Events</h1>
          <p className="text-muted-foreground">Economic calendar and market impact analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Badge variant="secondary" className="px-3 py-2">
            <Globe className="w-4 h-4 mr-2" />
            Live Updates
          </Badge>
        </div>
      </motion.div>

      {/* Performance Impact */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              News Trading Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">P&L During News</p>
                <p className={`text-2xl font-bold ${newsPerformanceMetrics.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${Math.abs(newsPerformanceMetrics.totalPnL).toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {newsPerformanceMetrics.totalPnL >= 0 ? 'Profitable' : 'Loss'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
                <p className="text-2xl font-bold">{newsPerformanceMetrics.winRate.toFixed(1)}%</p>
                <p className="text-xs text-red-500 mt-1">Below average</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Expectancy</p>
                <p className="text-2xl font-bold">${newsPerformanceMetrics.expectancy.toFixed(2)}</p>
                <p className="text-xs text-red-500 mt-1">Negative</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Discipline Score</p>
                <p className="text-2xl font-bold">{newsPerformanceMetrics.disciplineScore}</p>
                <p className="text-xs text-orange-500 mt-1">Needs improvement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="glass-card border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">High Impact Today</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <div className="p-2 bg-red-500/10 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Today's Events</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-xl">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Risk Level</p>
                <p className="text-2xl font-bold text-orange-500">High</p>
              </div>
              <div className="p-2 bg-orange-500/10 rounded-xl">
                <TrendingUp className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* News Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <NewsSection />
      </motion.div>
    </div>
  );
}
