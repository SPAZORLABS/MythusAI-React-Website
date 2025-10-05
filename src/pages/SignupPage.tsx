import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';
import { useTheme } from '@/components/theme/theme-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FaApple } from 'react-icons/fa';
import { FcGoogle } from "react-icons/fc";
import EmailVerification from '@/components/auth/EmailVerification';

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  
  const { signup, user, loading } = useAuth();
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if already authenticated
  if (user) {
    navigate('/', { replace: true });
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup(formData.name, formData.email, formData.password);
      
      if (result.needsVerification) {
        setShowEmailVerification(true);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    navigate('/');
  };

  const handleBackToSignup = () => {
    setShowEmailVerification(false);
    setError('');
  };

  // Show email verification if needed
  if (showEmailVerification) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-1/2">
          <img 
            src={resolvedTheme === 'dark' ? "/logo-dark.png" : "/logo-light.png"} 
            alt="Email Verification" 
            className="w-2/3 h-full object-cover mx-auto" 
          />
        </div>
        <div className="w-1/2">
          <EmailVerification
            email={formData.email}
            onVerificationSuccess={handleVerificationSuccess}
            onBack={handleBackToSignup}
            isSignupFlow={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-1/2">
        <img 
          src={resolvedTheme === 'dark' ? "/logo-dark.png" : "/logo-light.png"} 
          alt="Signup" 
          className="w-2/3 h-full object-cover mx-auto" 
        />
      </div>
      <div className="w-1/2">
      <Card className="max-w-md mx-auto dark:bg-[#556165] border-[var(--color-border)] bg-[#d5b65a] p-4 poppins-text rounded-3xl shadow-lg shadow-black/20" size="lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome to mythus aistudio</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium m-2">
                Full Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="w-full rounded-full mt-2 dark:bg-neutral-200 dark:text-black"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium m-2">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="w-full rounded-full mt-2 dark:bg-neutral-200 dark:text-black"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium m-2">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="w-full rounded-full mt-2 dark:bg-neutral-200 dark:text-black"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium m-2">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="w-full rounded-full mt-2 dark:bg-neutral-200 dark:text-black"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full rounded-full border-2 border-primary dark:bg-[#2c3e50] dark:text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
          
          <div className="mt-6 space-y-3">
            <Button 
              type="button" 
              variant="outline"
              className="w-full rounded-full dark:bg-neutral-200 dark:text-black"
            >
              <FaApple className="mr-2 h-4 w-4" />
              Continue with Apple
            </Button>
            
            <Button 
              type="button" 
              variant="outline"
              className="w-full rounded-full dark:bg-neutral-200 dark:text-black"
            >
              <FcGoogle className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;
