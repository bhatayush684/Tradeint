import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  TrendingUp, 
  BarChart3, 
  BookOpen, 
  Newspaper, 
  Settings, 
  LogOut,
  Menu,
  X,
  Home,
  Activity,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: Home,
    description: 'Overview & metrics'
  },
  { 
    name: 'Analytics', 
    href: '/analytics', 
    icon: BarChart3,
    description: 'Performance analysis'
  },
  { 
    name: 'Journal', 
    href: '/journal', 
    icon: BookOpen,
    description: 'Trade records'
  },
  { 
    name: 'News', 
    href: '/news', 
    icon: Newspaper,
    description: 'Market updates'
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: Settings,
    description: 'Preferences'
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className={cn(
      "flex flex-col bg-card/80 backdrop-blur-md border-r border-border/50 transition-all duration-300 ease-in-out relative",
      collapsed ? "w-20" : "w-72"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border/50">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Tradient
              </h1>
              <p className="text-xs text-muted-foreground">Trading Platform</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-full flex justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0 hover:bg-primary/10 transition-colors"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary border border-primary/20 shadow-sm"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground hover:scale-[1.02]"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-primary/20 text-primary" 
                  : "bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary"
              )}>
                <item.icon className="h-5 w-5" />
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{item.name}</span>
                    {item.name === 'News' && (
                      <Badge variant="secondary" className="ml-2 text-xs px-2 py-0.5 h-5">
                        3
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {item.description}
                  </p>
                </div>
              )}
              {isActive && !collapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border/50 space-y-3">
        {!collapsed && (
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Pro Tip</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Upload your CSV trades to get started with detailed analytics
            </p>
          </div>
        )}
        
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-4 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200",
            collapsed && "w-10 h-10 p-0 mx-auto"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
}
