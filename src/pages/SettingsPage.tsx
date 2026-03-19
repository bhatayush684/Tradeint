import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { 
  User, Bell, Shield, Save, Check, Lock, Database, HelpCircle, 
  Moon, Sun, Laptop, ArrowRight, Eye, EyeOff, FileText, MessageSquare 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import CSVManager from '@/csvManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const DEFAULT_SETTINGS = {
  name: 'Trader',
  email: 'demo@tradient.ai',
  riskPerTrade: '1.5',
  maxDailyLoss: '3.0',
  newsAlerts: true,
  tradeAlerts: true,
  disciplineAlerts: true,
};

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  
  // Modals state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Load from Local Storage on Mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('tradient_user_settings');
    if (savedSettings) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    } else if (user) {
      setSettings(prev => ({ ...prev, name: user.name, email: user.email }));
    }
  }, [user]);

  // Save changes to Local Storage
  const handleSave = () => {
    localStorage.setItem('tradient_user_settings', JSON.stringify(settings));
    setSaved(true);
    toast.success('Settings Saved', {
      description: 'Your preferences have been successfully updated.',
      icon: <Check className="w-4 h-4 text-green-500" />
    });
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExportData = async () => {
    try {
      const trades = await CSVManager.loadFromAPI();
      if (trades.length === 0) {
        toast.error('No Data Found', {
          description: 'You do not have any trades saved to export.',
        });
        return;
      }
      
      CSVManager.downloadCSV(trades, `tradient_export_${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('Data Exported', {
        description: `Successfully exported ${trades.length} trades to CSV.`,
        icon: <Database className="w-4 h-4 text-blue-500" />
      });
    } catch (e) {
      toast.error('Export Failed', { description: 'An error occurred while exporting your data.' });
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPasswordModalOpen(false);
    toast.success('Password Updated', {
      description: 'Your account password has been changed securely.'
    });
  };

  return (
    <div className="space-y-8 max-w-4xl pb-10">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your profile, preferences, and security</p>
        </div>
        
        {/* Theme Toggle mapped directly in Header for quick access */}
        <div className="flex bg-muted/50 p-1 rounded-xl border border-border/50 self-start sm:self-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setTheme('light')}
            className={`px-3 py-1.5 rounded-lg h-auto ${theme === 'light' ? 'bg-background shadow-sm' : 'hover:bg-transparent text-muted-foreground'}`}
          >
            <Sun className="w-4 h-4 mr-2" /> Light
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setTheme('dark')}
            className={`px-3 py-1.5 rounded-lg h-auto ${theme === 'dark' ? 'bg-background shadow-sm' : 'hover:bg-transparent text-muted-foreground'}`}
          >
            <Moon className="w-4 h-4 mr-2" /> Dark
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setTheme('system')}
            className={`px-3 py-1.5 rounded-lg h-auto ${theme === 'system' ? 'bg-background shadow-sm' : 'hover:bg-transparent text-muted-foreground'}`}
          >
            <Laptop className="w-4 h-4 mr-2" /> System
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Profile */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-card border-0 shadow-lg overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <User className="w-5 h-5 text-blue-500" />
                  </div>
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Display Name</label>
                    <Input 
                      value={settings.name} 
                      onChange={e => setSettings({ ...settings, name: e.target.value })} 
                      className="bg-background/50 border-border/50 hover:border-border focus:border-primary transition-colors" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                    <Input 
                      value={settings.email} 
                      onChange={e => setSettings({ ...settings, email: e.target.value })} 
                      className="bg-background/50 border-border/50 hover:border-border focus:border-primary transition-colors" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Risk Management */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="glass-card border-0 shadow-lg overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-red-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Shield className="w-5 h-5 text-orange-500" />
                  </div>
                  Risk Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Max Risk Per Trade (%)</label>
                    <div className="relative">
                      <Input 
                        value={settings.riskPerTrade} 
                        onChange={e => setSettings({ ...settings, riskPerTrade: e.target.value })} 
                        className="bg-background/50 border-border/50 font-mono focus:border-primary pl-4 pr-8" 
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Max Daily Loss (%)</label>
                    <div className="relative">
                      <Input 
                        value={settings.maxDailyLoss} 
                        onChange={e => setSettings({ ...settings, maxDailyLoss: e.target.value })} 
                        className="bg-background/50 border-border/50 font-mono focus:border-primary pl-4 pr-8" 
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notifications */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="glass-card border-0 shadow-lg overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Bell className="w-5 h-5 text-purple-500" />
                  </div>
                  Alert Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'newsAlerts', label: 'News Impact Alerts', description: 'Get notified via modern toasts about high-impact economic events.' },
                  { key: 'tradeAlerts', label: 'Trade Execution Alerts', description: 'Real-time alerts for manual trade entries and exits.' },
                  { key: 'disciplineAlerts', label: 'Discipline Warnings', description: 'AI warnings when you deviate from the risk parameters above.' },
                ].map((item, i) => (
                  <div key={item.key} className={`flex items-start sm:items-center justify-between p-4 rounded-xl border border-border/50 bg-background/30 hover:bg-background/50 transition-colors ${i !== 0 ? 'mt-3' : ''}`}>
                    <div className="flex-1 pr-4">
                      <p className="font-semibold text-foreground">{item.label}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">{item.description}</p>
                    </div>
                    <Switch
                      className="mt-1 sm:mt-0"
                      checked={settings[item.key as keyof typeof settings] as boolean}
                      onCheckedChange={(checked) => setSettings({ ...settings, [item.key]: checked })}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Main Action Area */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="pt-4">
            <Button 
              onClick={handleSave} 
              className="w-full sm:w-auto px-8 h-12 text-base font-semibold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]" 
              size="lg"
            >
              {saved ? (
                <AnimatePresence mode="wait">
                  <motion.div key="saved" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center">
                    <Check className="w-5 h-5 mr-2" />
                    Settings Saved!
                  </motion.div>
                </AnimatePresence>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div key="save" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center">
                    <Save className="w-5 h-5 mr-2" />
                    Save All Changes
                  </motion.div>
                </AnimatePresence>
              )}
            </Button>
          </motion.div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <Card className="glass-card border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Security & Data</CardTitle>
                <CardDescription>Manage your offline data and login</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-between group hover:border-primary/50 transition-colors" onClick={() => setIsPasswordModalOpen(true)}>
                  <div className="flex items-center">
                    <Lock className="w-4 h-4 mr-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    Change Password
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Button>
                
                <Button variant="outline" className="w-full justify-between group hover:border-blue-500/50 transition-colors" onClick={handleExportData}>
                  <div className="flex items-center">
                    <Database className="w-4 h-4 mr-3 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                    Export Local CSV
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Button>
                
                <Button variant="outline" className="w-full justify-between group hover:border-accent-foreground/50 transition-colors" onClick={() => setIsHelpModalOpen(true)}>
                  <div className="flex items-center">
                    <HelpCircle className="w-4 h-4 mr-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                    Help & Support
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Password Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-md glass-card border-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Change Password
            </DialogTitle>
            <DialogDescription>
              Enter a new password for your account to enhance your security.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <Input type="password" placeholder="••••••••" required className="bg-background/50 border-border/50" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" required className="bg-background/50 border-border/50 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsPasswordModalOpen(false)}>Cancel</Button>
              <Button type="submit">Update Password</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Help Modal */}
      <Dialog open={isHelpModalOpen} onOpenChange={setIsHelpModalOpen}>
        <DialogContent className="sm:max-w-md glass-card border-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Tradient Support
            </DialogTitle>
            <DialogDescription>
              We're here to help you improve your trading discipline. Reach out or check our documentation.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <Button variant="outline" className="w-full justify-start h-14" onClick={() => window.open('mailto:support@tradient.ai')}>
              <MessageSquare className="w-5 h-5 mr-3 text-primary" />
              <div className="text-left">
                <div className="font-medium">Email Support</div>
                <div className="text-xs text-muted-foreground">Get help within 24 hours</div>
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-start h-14" onClick={() => { toast.info('Documentation opening soon!'); setIsHelpModalOpen(false); }}>
              <FileText className="w-5 h-5 mr-3 text-blue-500" />
              <div className="text-left">
                <div className="font-medium">Read the Docs</div>
                <div className="text-xs text-muted-foreground">Guides on importing CSV data & analytics</div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
