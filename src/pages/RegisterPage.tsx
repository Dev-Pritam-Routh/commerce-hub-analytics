
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    try {
      setLoading(true);
      await register(name, email, password, 'user');
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg border-slate-200 dark:border-slate-700">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create a Customer Account</CardTitle>
            <CardDescription className="text-center">
              Sign up to shop and explore products on CommerceHub
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  type="text"
                  placeholder="John Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                  className="transition-all duration-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="transition-all duration-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="transition-all duration-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="transition-all duration-200"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Create Customer Account'}
              </Button>
            </form>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-300 dark:border-slate-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Are you a seller?</p>
              <Button 
                variant="outline" 
                className="mt-2 w-full"
                onClick={() => navigate('/seller/register')}
              >
                Register as a Seller
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-primary hover:underline"
              >
                Sign in
              </Link>
            </div>
            
            <div className="text-xs text-center text-slate-500 dark:text-slate-400">
              By creating an account, you agree to our{' '}
              <a href="#" className="underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="underline">Privacy Policy</a>.
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
