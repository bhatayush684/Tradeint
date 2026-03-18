export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  category: 'market' | 'economic' | 'crypto' | 'forex' | 'commodities';
  sentiment: 'bullish' | 'bearish' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  url?: string;
  symbols?: string[];
}

import React from 'react';
import { toast } from 'sonner';
import { Newspaper, AlertTriangle, Info } from 'lucide-react';

export interface NewsAnalytics {
  totalNews: number;
  highImpact: number;
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
  avgSentimentScore: number;
}

class NewsService {
  private static instance: NewsService;
  private news: NewsItem[] = [];
  private listeners: ((data: NewsItem[], analytics: NewsAnalytics) => void)[] = [];

  static getInstance(): NewsService {
    if (!NewsService.instance) {
      NewsService.instance = new NewsService();
    }
    return NewsService.instance;
  }

  private constructor() {
    this.initializeNews();
    this.startRealTimeUpdates();
  }

  private initializeNews() {
    // Initialize with some real-time news
    this.news = [
      {
        id: '1',
        title: 'Fed Signals Potential Rate Cut in Q2 2024',
        summary: 'Federal Reserve officials indicated that monetary policy easing could begin in the second quarter if inflation continues to moderate.',
        source: 'Reuters',
        publishedAt: new Date().toISOString(),
        category: 'economic',
        sentiment: 'neutral',
        impact: 'high',
        url: 'https://reuters.com/markets/economics',
        symbols: ['USD', 'EUR']
      },
      {
        id: '2',
        title: 'EUR/USD Surges After ECB Interest Rate Decision',
        summary: 'European Central Bank maintained interest rates as expected, causing EUR to strengthen against major currencies.',
        source: 'Bloomberg',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        category: 'forex',
        sentiment: 'bullish',
        impact: 'medium',
        url: 'https://bloomberg.com/markets/currencies',
        symbols: ['EUR', 'USD']
      },
      {
        id: '3',
        title: 'Gold Prices Rise on Geopolitical Tensions',
        summary: 'Safe-haven demand increases as investors seek protection from market uncertainty.',
        source: 'CNBC',
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        category: 'commodities',
        sentiment: 'bullish',
        impact: 'medium',
        url: 'https://cnbc.com/markets/commodities',
        symbols: ['XAU', 'GOLD']
      }
    ];
  }

  private startRealTimeUpdates() {
    // Simulate real-time updates every 15 seconds so the user can see it pop up
    setInterval(() => {
      this.updateNews();
      this.notifyListeners();
    }, 15000);
  }

  private updateNews() {
    // Simulate receiving new news items
    if (Math.random() > 0.4) { // 60% chance of new news to make it feel alive
      const newNewsItem: NewsItem = {
        id: Date.now().toString(),
        title: `Market Update ${new Date().toLocaleTimeString()}`,
        summary: 'Real-time market analysis update',
        source: 'Live Feed',
        publishedAt: new Date().toISOString(),
        category: 'market',
        sentiment: Math.random() > 0.5 ? 'bullish' : 'bearish',
        impact: Math.random() > 0.8 ? 'high' : 'medium',
        url: 'https://example.com/live-feed',
        symbols: ['SPY', 'QQQ', 'DIA']
      };

      this.news.unshift(newNewsItem);

      // Trigger the elegant top-right toast notification
      toast(newNewsItem.title, {
        description: `${newNewsItem.impact.toUpperCase()} IMPACT • ${newNewsItem.category.toUpperCase()}`,
        icon: newNewsItem.impact === 'high' ? '🚨' : '📰',
        duration: 5000,
        action: {
          label: 'View',
          onClick: () => window.location.href = '/news'
        }
      });
      
      // Keep only latest 20 items
      if (this.news.length > 20) {
        this.news = this.news.slice(0, 20);
      }
    }
  }

  private calculateAnalytics(): NewsAnalytics {
    const totalNews = this.news.length;
    const highImpact = this.news.filter(item => item.impact === 'high').length;
    const bullishCount = this.news.filter(item => item.sentiment === 'bullish').length;
    const bearishCount = this.news.filter(item => item.sentiment === 'bearish').length;
    const avgSentimentScore = (bullishCount - bearishCount) / totalNews;

    return {
      totalNews,
      highImpact,
      marketSentiment: avgSentimentScore > 0.1 ? 'bullish' : avgSentimentScore < -0.1 ? 'bearish' : 'neutral',
      avgSentimentScore: parseFloat(avgSentimentScore.toFixed(2))
    };
  }

  private notifyListeners() {
    const analytics = this.calculateAnalytics();
    this.listeners.forEach(listener => listener(this.news, analytics));
  }

  public subscribe(listener: (data: NewsItem[], analytics: NewsAnalytics) => void) {
    this.listeners.push(listener);
    // Immediately notify with current data
    listener(this.news, this.calculateAnalytics());
  }

  public unsubscribe(listener: (data: NewsItem[], analytics: NewsAnalytics) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  public getNews(): NewsItem[] {
    return this.news;
  }

  public getAnalytics(): NewsAnalytics {
    return this.calculateAnalytics();
  }
}

export default NewsService;
