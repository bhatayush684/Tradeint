import { useState } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ToggleLeft, ToggleRight } from 'lucide-react';
import PerformanceCards from './PerformanceCards';

// Sample economic calendar data (in a real app, this would come from an API)
const economicCalendar = [
  { id: 1, title: 'FOMC Interest Rate Decision', time: '14:00 EST', impact: 'high' as const, currency: 'USD' },
  { id: 2, title: 'Non-Farm Payrolls', time: '08:30 EST', impact: 'high' as const, currency: 'USD' },
  { id: 3, title: 'ECB Press Conference', time: '08:45 EST', impact: 'high' as const, currency: 'EUR' },
  { id: 4, title: 'UK GDP m/m', time: '02:00 EST', impact: 'medium' as const, currency: 'GBP' },
  { id: 5, title: 'AUD Employment Change', time: '19:30 EST', impact: 'medium' as const, currency: 'AUD' },
];

const impactBadge = {
  high: 'impact-high',
  medium: 'impact-medium',
  low: 'impact-low',
};

export default function NewsSection() {
  const [showNewsPerf, setShowNewsPerf] = useState(false);

  return (
    <div className="space-y-4">
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold">Economic Calendar</h3>
          </div>
          <button
            onClick={() => setShowNewsPerf(!showNewsPerf)}
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {showNewsPerf ? <ToggleRight className="w-5 h-5 text-primary" /> : <ToggleLeft className="w-5 h-5" />}
            Show performance during news
          </button>
        </div>

        <div className="space-y-2">
          {economicCalendar.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${impactBadge[item.impact]}`}>
                  {item.impact}
                </span>
                <span className="text-sm truncate">{item.title}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-mono text-muted-foreground">{item.currency}</span>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
