import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, TrendingUp, ArrowRight, Shield, Zap, Sparkles, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isFocused, setIsFocused] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Accept any credentials
    login(formData.email || 'user@tradient.com', formData.password || 'password');
    navigate('/dashboard');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30"></div>
      
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/8 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/6 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/4 to-transparent rounded-full filter blur-3xl animate-spin-slow"></div>
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      ></div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Main card with enhanced styling */}
        <Card className="w-full bg-card/60 backdrop-blur-2xl border-border/30 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_20px_40px_-10px_rgba(0,0,0,0.4)] relative overflow-hidden">
          {/* Subtle border glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-50"></div>
          
          <CardHeader className="text-center pb-8 relative z-10">
            {/* Enhanced logo with glow effect */}
            <div className="mx-auto relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/60 rounded-2xl blur-xl opacity-60 animate-pulse"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)] transform hover:scale-105 transition-all duration-500 hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]">
                <TrendingUp className="w-10 h-10 text-primary-foreground" />
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-primary animate-pulse" />
              </div>
            </div>
            
            <CardTitle className="text-4xl font-bold text-foreground mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <p className="text-muted-foreground text-base mb-6">Sign in to your trading account</p>
            
            {/* Enhanced badges with icons */}
            <div className="flex justify-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/40 rounded-full border border-border/30 backdrop-blur-sm">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground">Secure</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/40 rounded-full border border-border/30 backdrop-blur-sm">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground">Fast</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/40 rounded-full border border-border/30 backdrop-blur-sm">
                <Lock className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground">Private</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 relative z-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Enhanced email input */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-foreground text-sm font-semibold tracking-wide">Email Address</Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    onFocus={() => setIsFocused('email')}
                    onBlur={() => setIsFocused('')}
                    className={`bg-background/40 border-border/40 text-foreground placeholder-muted-foreground/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-300 pr-4 h-12 rounded-lg backdrop-blur-sm ${isFocused === 'email' ? 'shadow-[0_0_20px_rgba(99,102,241,0.2)]' : ''}`}
                    required
                  />
                  <div className={`absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 to-transparent opacity-0 transition-opacity duration-300 ${isFocused === 'email' ? 'opacity-100' : ''} pointer-events-none`}></div>
                </div>
              </div>
              
              {/* Enhanced password input */}
              <div className="space-y-3">
                <Label htmlFor="password" className="text-foreground text-sm font-semibold tracking-wide">Password</Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    onFocus={() => setIsFocused('password')}
                    onBlur={() => setIsFocused('')}
                    className={`bg-background/40 border-border/40 text-foreground placeholder-muted-foreground/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 pr-12 h-12 rounded-lg backdrop-blur-sm transition-all duration-300 ${isFocused === 'password' ? 'shadow-[0_0_20px_rgba(99,102,241,0.2)]' : ''}`}
                    required
                  />
                  <div className={`absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 to-transparent opacity-0 transition-opacity duration-300 ${isFocused === 'password' ? 'opacity-100' : ''} pointer-events-none`}></div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent text-muted-foreground hover:text-foreground transition-all duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              {/* Enhanced submit button */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary text-primary-foreground font-semibold py-3.5 rounded-xl shadow-[0_4px_20px_rgba(99,102,241,0.3)] transform transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] active:scale-[0.98] relative overflow-hidden group"
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Sign In
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                )}
              </Button>
            </form>
            
            {/* Enhanced footer links */}
            <div className="mt-8 space-y-4">
              <div className="text-center">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary/80 hover:text-primary transition-colors duration-200 inline-flex items-center gap-1 hover:gap-2 group"
                >
                  Forgot your password?
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/20"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background/60 px-2 text-muted-foreground backdrop-blur-sm">OR</span>
                </div>
              </div>
              <div className="text-center text-muted-foreground text-sm">
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  className="text-primary hover:text-primary/80 font-semibold transition-colors duration-200 inline-flex items-center gap-1 hover:gap-2 group"
                >
                  Sign up
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
