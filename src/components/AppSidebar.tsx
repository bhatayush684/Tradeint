import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';
import { TrendingUp, LayoutDashboard, BarChart3, BookOpen, Newspaper, Settings, LogOut, ChevronLeft, ChevronRight, Moon, Sun, X } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'Journal', to: '/journal', icon: BookOpen },
  { label: 'News', to: '/news', icon: Newspaper },
  { label: 'Settings', to: '/settings', icon: Settings },
];

interface Props {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
}

export default function AppSidebar({ collapsed, onToggleCollapse, onClose }: Props) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="h-full flex flex-col bg-card border-r border-border safe-area-top">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2 px-4 border-b border-border shrink-0">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
          <TrendingUp className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-bold gradient-text text-lg truncate">Tradient</span>
        )}
        <button 
          onClick={onClose} 
          className="lg:hidden ml-auto p-1.5 rounded-lg hover:bg-secondary transition-colors touch-manipulation"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
        <button 
          onClick={onToggleCollapse} 
          className="hidden lg:flex ml-auto p-1.5 rounded-lg hover:bg-secondary transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 touch-manipulation ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              } ${collapsed ? 'justify-center' : ''}`
            }
            onClick={() => {
              if (window.innerWidth < 1024) {
                onClose();
              }
            }}
          >
            <item.icon className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-1 safe-area-bottom">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all w-full touch-manipulation ${collapsed ? 'justify-center' : ''}`}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <Sun className="w-[18px] h-[18px] shrink-0" /> : <Moon className="w-[18px] h-[18px] shrink-0" />}
          {!collapsed && <span className="truncate">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
        </button>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all w-full touch-manipulation ${collapsed ? 'justify-center' : ''}`}
          aria-label="Logout"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span className="truncate">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
