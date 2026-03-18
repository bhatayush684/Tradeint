import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AppSidebar from '@/components/AppSidebar';
import { Menu, X } from 'lucide-react';

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile && !collapsed) {
      setCollapsed(true);
    }
  }, [isMobile, collapsed]);

  // Handle sidebar state persistence
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebar-collapsed');
    if (savedCollapsed !== null) {
      setCollapsed(JSON.parse(savedCollapsed));
    }
  }, []);

  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
    }
  }, [collapsed, isMobile]);

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      {/* Enhanced Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 bg-background/90 backdrop-blur-md z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Enhanced Sidebar with better animations */}
      <motion.div 
        className={cn(
          "fixed lg:sticky top-0 h-screen z-50 transition-all duration-500 ease-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
          collapsed ? "lg:w-20" : "lg:w-72",
          "w-72"
        )}
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : (isMobile ? -288 : 0),
          width: isMobile ? 288 : (collapsed ? 80 : 288)
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
          mass: 0.8
        }}
      >
        <AppSidebar 
          collapsed={isMobile ? false : collapsed} 
          onToggleCollapse={() => !isMobile && setCollapsed(!collapsed)} 
          onClose={() => setSidebarOpen(false)} 
        />
      </motion.div>

      {/* Enhanced Main Content */}
      <motion.div 
        className={cn(
          "flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-500 ease-out",
          "lg:transition-none"
        )}
        animate={{
          marginLeft: isMobile ? 0 : (collapsed ? 0 : 0),
          width: isMobile ? "100%" : (collapsed ? "calc(100% - 80px)" : "calc(100% - 288px)")
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
          mass: 0.8
        }}
      >
        {/* Enhanced Mobile header */}
        <motion.div 
          className="lg:hidden sticky top-0 z-30 h-16 safe-area-top flex items-center gap-4 px-6 border-b border-border/20 bg-card/90 backdrop-blur-xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.button 
            onClick={() => setSidebarOpen(true)} 
            className="p-3 rounded-2xl hover:bg-primary/10 transition-all duration-300 touch-manipulation border border-border/20 hover:border-primary/30 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </motion.button>
          <motion.span 
            className="font-bold text-lg bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Tradient
          </motion.span>
        </motion.div>

        {/* Enhanced Page Content */}
        <motion.main 
          className="flex-1 overflow-y-auto safe-area-bottom"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.4, 0, 0.2, 1],
                  staggerChildren: 0.1
                }}
                className="w-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.main>
      </motion.div>
    </div>
  );
}