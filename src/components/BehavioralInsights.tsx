import { motion } from 'framer-motion';
import { Brain, AlertTriangle, Info, TrendingDown, Clock, Target, Zap } from 'lucide-react';
import { allMockTrades } from '@/data';
import { analyzeBehavioralPatterns, getBehavioralSummary } from '@/lib/behavioral';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const severityConfig = {
  critical: { 
    class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200', 
    icon: AlertTriangle, 
    label: 'Critical',
    color: 'text-red-600'
  },
  high: { 
    class: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200', 
    icon: AlertTriangle, 
    label: 'High',
    color: 'text-orange-600'
  },
  medium: { 
    class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200', 
    icon: AlertTriangle, 
    label: 'Medium',
    color: 'text-yellow-600'
  },
  low: { 
    class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200', 
    icon: Info, 
    label: 'Low',
    color: 'text-blue-600'
  }
};

const patternIcons = {
  'revenge-trading': Zap,
  'overtrading': Clock,
  'position-escalation': TrendingDown,
  'holding-losers': Target,
  'poor-recovery': Brain,
  'time-pattern': Clock,
  'setup-bias': Target
};

export default function BehavioralInsights() {
  const insights = analyzeBehavioralPatterns(allMockTrades);
  const summary = getBehavioralSummary(insights);
  
  const topInsights = insights.slice(0, 5);

  return (
    <Card className="glass-card border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">AI Behavioral Insights</h3>
            <p className="text-sm text-muted-foreground">
              {summary.totalInsights} patterns detected • ${Math.abs(summary.totalImpact).toFixed(0)} impact
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.critical}</div>
            <div className="text-xs text-red-600 dark:text-red-400">Critical</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{summary.high}</div>
            <div className="text-xs text-orange-600 dark:text-orange-400">High</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{summary.medium}</div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400">Medium</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summary.low}</div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Low</div>
          </div>
        </div>

        {/* Pattern Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pattern Breakdown</h4>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(summary.patterns).map(([pattern, count]) => {
              if (count === 0) return null;
              const Icon = patternIcons[pattern as keyof typeof patternIcons] || Brain;
              const patternName = pattern.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ');
              
              return (
                <div key={pattern} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{patternName}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {count} {count === 1 ? 'instance' : 'instances'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Insights */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Top Insights</h4>
          <div className="space-y-3">
            {topInsights.map((insight, i) => {
              const sev = severityConfig[insight.severity];
              const PatternIcon = patternIcons[insight.type] || Brain;
              
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  className="p-4 rounded-lg border bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-1">
                      <PatternIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge className={`text-xs ${sev.class} border`}>
                          {sev.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {insight.affectedTrades.length} trades affected
                        </span>
                        {insight.impact < 0 && (
                          <span className="text-xs text-red-600 font-medium">
                            -${Math.abs(insight.impact).toFixed(0)}
                          </span>
                        )}
                      </div>
                      <h5 className="text-sm font-semibold mb-1">{insight.title}</h5>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                        {insight.description}
                      </p>
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        💡 {insight.recommendation}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {insights.length === 0 && (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No behavioral patterns detected. Keep up the disciplined trading!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
