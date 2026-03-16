import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { User, Bell, Shield, Palette, Save, Check, Settings, Lock, Smartphone, Globe, Database, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    name: user?.name || 'Trader',
    email: user?.email || 'demo@tradient.ai',
    riskPerTrade: '1.5',
    maxDailyLoss: '3.0',
    newsAlerts: true,
    tradeAlerts: true,
    disciplineAlerts: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Settings</h1>
          <p className="text-muted-foreground">Manage your account and trading preferences</p>
        </div>
        <Badge variant="outline" className="px-4 py-2">
          <Settings className="w-4 h-4 mr-2" />
          Preferences
        </Badge>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Display Name</label>
                    <Input 
                      value={settings.name} 
                      onChange={e => setSettings({ ...settings, name: e.target.value })} 
                      className="glass-card border-0" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Email</label>
                    <Input 
                      value={settings.email} 
                      onChange={e => setSettings({ ...settings, email: e.target.value })} 
                      className="glass-card border-0" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Risk Management */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="glass-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Risk Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Max Risk Per Trade (%)</label>
                    <Input 
                      value={settings.riskPerTrade} 
                      onChange={e => setSettings({ ...settings, riskPerTrade: e.target.value })} 
                      className="glass-card border-0 font-mono" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Max Daily Loss (%)</label>
                    <Input 
                      value={settings.maxDailyLoss} 
                      onChange={e => setSettings({ ...settings, maxDailyLoss: e.target.value })} 
                      className="glass-card border-0 font-mono" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notifications */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="glass-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'newsAlerts', label: 'News Impact Alerts', description: 'Get notified about high-impact economic events' },
                  { key: 'tradeAlerts', label: 'Trade Execution Alerts', description: 'Alerts for trade entries and exits' },
                  { key: 'disciplineAlerts', label: 'Discipline Warnings', description: 'Warnings when breaking trading rules' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                    <div className="flex-1">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch
                      checked={settings[item.key as keyof typeof settings] as boolean}
                      onCheckedChange={(checked) => setSettings({ ...settings, [item.key]: checked })}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card className="glass-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help & Support
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Account Status */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <Card className="glass-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <Badge variant="secondary">Pro</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <span className="text-sm">Jan 2024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Storage Used</span>
                  <span className="text-sm">2.3 GB</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Save Button */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Button onClick={handleSave} className="px-8" size="lg">
          {saved ? <Check className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {saved ? 'Changes Saved!' : 'Save Changes'}
        </Button>
      </motion.div>
    </div>
  );
}
