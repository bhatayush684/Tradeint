import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Newspaper, Calendar, Clock, AlertTriangle, TrendingUp, TrendingDown, Globe, Filter,
  ExternalLink, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CSVManager from '@/csvManager';
import { CSVTradeData } from '@/csvManager';
import NewsService, { NewsItem, NewsAnalytics } from '@/services/NewsService';

export default function NewsPage() {
  const [trades, setTrades] = useState<CSVTradeData[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [analytics, setAnalytics] = useState<NewsAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('live');

  useEffect(() => {
    loadTrades();
    initializeNewsService();
  }, []);

  const loadTrades = async () => {
    try {
      const csvTrades = await CSVManager.loadFromAPI();
      setTrades(csvTrades);
    } catch (error) {
      console.error('Error loading trades:', error);
      setTrades([]);
    }
  };

  const initializeNewsService = () => {
    const newsService = NewsService.getInstance();
    
    // Subscribe to real-time news updates
    newsService.subscribe((newsItems: NewsItem[], newsAnalytics: NewsAnalytics) => {
      setNews(newsItems);
      setAnalytics(newsAnalytics);
      setIsLoading(false);
    });

    // Initial load
    setNews(newsService.getNews());
    setAnalytics(newsService.getAnalytics());
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'bearish':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-500/10 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      default:
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Loading real-time news...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">News & Events</h1>
          <p className="text-muted-foreground">Real-time market news and trading insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-3 py-2 animate-pulse">
            <Globe className="w-4 h-4 mr-2" />
            Live Updates
          </Badge>
          <Badge variant="outline" className="px-3 py-2">
            {news.length} Active Stories
          </Badge>
        </div>
      </motion.div>

      {/* News Analytics */}
      {analytics && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Market Sentiment Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total News</p>
                  <p className="text-2xl font-bold">{analytics.totalNews}</p>
                  <p className="text-xs text-muted-foreground mt-1">Active stories</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">High Impact</p>
                  <p className="text-2xl font-bold text-red-500">{analytics.highImpact}</p>
                  <p className="text-xs text-red-500 mt-1">Important events</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Market Sentiment</p>
                  <p className="text-2xl font-bold capitalize">
                    {analytics.marketSentiment}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Score: {analytics.avgSentimentScore}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Sentiment Score</p>
                  <p className="text-2xl font-bold">{analytics.avgSentimentScore}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics.avgSentimentScore > 0.1 ? 'Bullish' : analytics.avgSentimentScore < -0.1 ? 'Bearish' : 'Neutral'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* News Feed */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-primary" />
                Live News Feed
              </div>
              <Badge variant="outline" className="text-xs">
                Updates every 30s
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {news.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {item.category.toUpperCase()}
                        </Badge>
                        <Badge 
                          variant={item.impact === 'high' ? 'destructive' : 'secondary'} 
                          className="text-xs"
                        >
                          {item.impact.toUpperCase()}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold mb-2 leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground mb-3 leading-relaxed">
                        {item.summary}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(item.publishedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(item.publishedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Source:</span>
                          <span className="font-medium">{item.source}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSentimentIcon(item.sentiment)}
                        <span className="text-sm font-medium capitalize">{item.sentiment}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {item.url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={item.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Read More
                          </a>
                        </Button>
                      )}
                      {item.symbols && (
                        <div className="flex flex-wrap gap-1">
                          {item.symbols.map(symbol => (
                            <Badge key={symbol} variant="secondary" className="text-xs">
                              {symbol}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Trading Performance */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-card border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Trading Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Trades</p>
                <p className="text-2xl font-bold">{trades.length}</p>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
                <p className="text-2xl font-bold">
                  {trades.length > 0 ? 
                    `${((trades.filter(t => t.result > 0).length / trades.length) * 100).toFixed(1)}%` : 
                    '0%'
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {trades.length > 0 ? 
                    trades.filter(t => t.result > 0).length > trades.length * 0.5 ? 'Good' : 'Needs Work' : 
                    'No data'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total P&L</p>
                <p className={`text-2xl font-bold ${trades.reduce((sum, t) => sum + t.result, 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${Math.abs(trades.reduce((sum, t) => sum + t.result, 0)).toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {trades.reduce((sum, t) => sum + t.result, 0) >= 0 ? 'Profitable' : 'Loss'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Risk/Reward</p>
                <p className="text-2xl font-bold">
                  {trades.length > 0 ? 
                    (trades.reduce((sum, t) => sum + (t.rr || 0), 0) / trades.length).toFixed(1) : 
                    '0'
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {trades.length > 0 ? 
                    trades.reduce((sum, t) => sum + (t.rr || 0), 0) / trades.length > 1.5 ? 'Excellent' : 'Needs Improvement' : 
                    'No data'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
