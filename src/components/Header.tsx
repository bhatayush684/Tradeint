import { useState } from 'react';
import { Bell, Search, User, Menu, Settings, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Left Section - Search */}
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trades, news, or settings..."
            className="pl-10 pr-4 bg-background/50 border-border/50 focus:bg-background transition-all duration-200"
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setSearchOpen(false)}
          />
          {searchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-background/95 backdrop-blur border border-border/50 rounded-xl shadow-lg z-50">
              <p className="text-sm text-muted-foreground mb-2">Quick Search</p>
              <div className="space-y-2">
                <div className="p-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                  <p className="text-sm font-medium">Recent Trades</p>
                  <p className="text-xs text-muted-foreground">View your latest trading activity</p>
                </div>
                <div className="p-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                  <p className="text-sm font-medium">Analytics</p>
                  <p className="text-xs text-muted-foreground">Performance metrics and insights</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative h-10 w-10 p-0 hover:bg-primary/10 transition-colors">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-4">
              <h3 className="font-semibold mb-2">Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/30">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Trade Completed</p>
                    <p className="text-xs text-muted-foreground">EUR/USD trade closed with +$125 profit</p>
                    <p className="text-xs text-muted-foreground mt-1">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/30">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Market Alert</p>
                    <p className="text-xs text-muted-foreground">Fed announcement in 30 minutes</p>
                    <p className="text-xs text-muted-foreground mt-1">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/30">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Risk Alert</p>
                    <p className="text-xs text-muted-foreground">Daily loss limit approaching</p>
                    <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Help */}
        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-primary/10 transition-colors">
          <HelpCircle className="h-5 w-5" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-accent/30 rounded-lg p-2 transition-colors">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">John Trader</p>
                <p className="text-xs text-muted-foreground">Premium Account</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="p-2">
              <p className="text-sm font-medium">John Trader</p>
              <p className="text-xs text-muted-foreground">john@trader.com</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
