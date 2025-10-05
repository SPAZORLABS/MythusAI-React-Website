import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, RefreshCw, CheckCircle } from 'lucide-react';
import { emailVerificationService } from '@/services/api/emailVerificationService';
import { useAuth } from '@/auth/AuthProvider';

interface EmailVerificationProps {
  email: string;
  onVerificationSuccess: () => void;
  onBack?: () => void;
  isSignupFlow?: boolean;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onVerificationSuccess,
  onBack,
  isSignupFlow = false
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { user, updateUser } = useAuth();

  // Timer for OTP expiry
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Auto-send OTP on component mount
  useEffect(() => {
    sendOTP();
  }, []);

  const sendOTP = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await emailVerificationService.sendOTP({ email });
      
      // Check if email is already verified
      if (response.detail === 'Email already verified' || response.message?.includes('already verified')) {
        // Update user context to mark as verified
        updateUser({ email_verified: true });
        setIsVerified(true);
        setSuccess('Your email is already verified!');
        
        // Redirect to main page after a short delay
        setTimeout(() => {
          onVerificationSuccess();
        }, 1500);
        return;
      }
      
      setTimeLeft(600); // 10 minutes
      setSuccess('OTP sent successfully! Check your email.');
    } catch (err: any) {
      // Handle the case where email is already verified
      if (err.response?.data?.detail === 'Email already verified') {
        updateUser({ email_verified: true });
        setIsVerified(true);
        setSuccess('Your email is already verified!');
        
        // Redirect to main page after a short delay
        setTimeout(() => {
          onVerificationSuccess();
        }, 1500);
        return;
      }
      
      setError(err.response?.data?.message || err.response?.data?.detail || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    setIsResending(true);
    setError('');
    
    try {
      const response = await emailVerificationService.resendOTP({ email });
      
      // Check if email is already verified
      if (response.detail === 'Email already verified' || response.message?.includes('already verified')) {
        updateUser({ email_verified: true });
        setIsVerified(true);
        setSuccess('Your email is already verified!');
        
        setTimeout(() => {
          onVerificationSuccess();
        }, 1500);
        return;
      }
      
      setTimeLeft(600); // 10 minutes
      setSuccess('OTP resent successfully!');
      setAttempts(0);
    } catch (err: any) {
      // Handle the case where email is already verified
      if (err.response?.data?.detail === 'Email already verified') {
        updateUser({ email_verified: true });
        setIsVerified(true);
        setSuccess('Your email is already verified!');
        
        setTimeout(() => {
          onVerificationSuccess();
        }, 1500);
        return;
      }
      
      setError(err.response?.data?.message || err.response?.data?.detail || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const pastedOtp = text.replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        for (let i = 0; i < pastedOtp.length; i++) {
          newOtp[i] = pastedOtp[i];
        }
        setOtp(newOtp);
        
        // Focus the next empty input or the last input
        const nextEmptyIndex = newOtp.findIndex(digit => digit === '');
        const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
        inputRefs.current[focusIndex]?.focus();
      });
    }
  };

  const verifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await emailVerificationService.verifyOTP({
        email,
        otp_code: otpCode
      });
      
      setIsVerified(true);
      setSuccess('Email verified successfully!');
      
      // Update user context with verified status
      if (response.user) {
        updateUser({ email_verified: true });
      }
      
      setTimeout(() => {
        onVerificationSuccess();
      }, 1500);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Invalid OTP. Please try again.';
      setError(errorMessage);
      setAttempts(prev => prev + 1);
      
      // Clear OTP on wrong attempt
      if (attempts >= 2) {
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="max-w-md mx-auto dark:bg-[#556165] border-[var(--color-border)] bg-[#d5b65a] p-4 poppins-text rounded-3xl shadow-lg shadow-black/20">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          {isVerified ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <Mail className="w-6 h-6 text-primary" />
          )}
        </div>
        <CardTitle className="text-xl font-bold">
          {isVerified ? 'Email Verified!' : 'Verify Your Email'}
        </CardTitle>
        <CardDescription className="text-sm">
          {isVerified 
            ? 'Your email has been successfully verified.' 
            : `We've sent a 6-digit verification code to ${email}`
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {!isVerified && (
          <>
            {/* OTP Input */}
            <div className="space-y-4">
              <label className="text-sm font-medium block text-center">
                Enter Verification Code
              </label>
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={isLoading}
                    className="w-12 h-12 text-center text-lg font-semibold rounded-lg border-2 focus:border-primary dark:bg-neutral-200 dark:text-black"
                  />
                ))}
              </div>
            </div>

            {/* Timer */}
            {timeLeft > 0 && (
              <div className="text-center text-sm text-muted-foreground">
                Code expires in: <span className="font-semibold text-primary">{formatTime(timeLeft)}</span>
              </div>
            )}

            {/* Verify Button */}
            <Button
              onClick={verifyOTP}
              disabled={isLoading || otp.join('').length !== 6 || timeLeft === 0}
              className="w-full rounded-full bg-[#2c3e50] text-white hover:bg-[#2c3e50]/80"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </Button>

            {/* Resend OTP */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Didn't receive the code?
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={resendOTP}
                disabled={isResending || timeLeft > 0}
                className="rounded-full dark:bg-neutral-200 dark:text-black"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Resending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Resend Code
                  </>
                )}
              </Button>
            </div>

            {/* Back Button */}
            {onBack && (
              <div className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ← Back to {isSignupFlow ? 'Sign Up' : 'Login'}
                </Button>
              </div>
            )}
          </>
        )}

        {isVerified && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-green-600 font-medium">
              Email verification completed successfully!
            </p>
            <div className="text-sm text-muted-foreground">
              Redirecting you to the dashboard...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailVerification;
