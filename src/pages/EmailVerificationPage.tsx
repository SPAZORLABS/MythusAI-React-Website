import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';
import { useTheme } from '@/components/theme/theme-provider';
import EmailVerification from '@/components/auth/EmailVerification';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EmailVerificationPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const { user, loading } = useAuth();
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

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

  // Redirect if not authenticated
  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }

  // Get email from location state or user data
  useEffect(() => {
    const emailFromState = location.state?.email;
    if (emailFromState) {
      setEmail(emailFromState);
    } else if (user?.email) {
      setEmail(user.email);
    }
  }, [location.state, user]);

  const handleVerificationSuccess = () => {
    navigate('/', { replace: true });
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No email address found for verification.</p>
          <Button onClick={() => navigate('/')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-1/2">
        <img
          src={resolvedTheme === 'dark' ? "/logo-dark.png" : "/logo-light.png"}
          alt="Email Verification"
          className="mx-auto w-2/3 h-full object-cover"
        />
      </div>
      <div className="w-1/2 relative">
        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        <EmailVerification
          email={email}
          onVerificationSuccess={handleVerificationSuccess}
          onBack={handleBack}
          isSignupFlow={false}
        />
      </div>
    </div>
  );
};

export default EmailVerificationPage;
