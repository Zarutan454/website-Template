import { useState } from 'react';

const RegistrationForm = ({ referralCode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1); // 1 = form, 2 = verification pending

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validate inputs
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (!password) {
      setError('Please enter a password');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!termsAccepted) {
      setError('You must accept the terms and conditions');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, this would be an API call to backend
      // const response = await fetch('/api/auth/register/', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     email, 
      //     password,
      //     referralCode: referralCode || null
      //   })
      // });
      // const data = await response.json();
      
      // Store registration in localStorage for demo purposes
      const registration = {
        email,
        timestamp: new Date().toISOString(),
        verified: false,
        referralCode: referralCode || null
      };
      
      localStorage.setItem('bsn_registration', JSON.stringify(registration));
      
      // Show success message
      setSuccess(true);
      setStep(2);
      
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle social login
  const handleSocialLogin = (provider) => {
    // In a real implementation, this would redirect to OAuth provider
    alert(`Redirecting to ${provider} login... (This is just a demo)`);
  };

  return (
    <div className="bg-[#06071F]/70 backdrop-blur-lg border border-[#00a2ff]/20 rounded-lg p-8 w-full max-w-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-light text-white">Join BSN Network</h3>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-[#00a2ff]/60 rounded-full mr-2"></div>
          <span className="text-xs text-[#8aa0ff]/80">Pre-Launch</span>
        </div>
      </div>
      
      {step === 1 ? (
        <>
          {referralCode && (
            <div className="mb-6 bg-[#00a2ff]/10 border border-[#00a2ff]/30 rounded-lg p-4 flex items-center">
              <svg className="w-5 h-5 text-[#00a2ff] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
              <div>
                <p className="text-white text-sm">Invited by a friend</p>
                <p className="text-[#00a2ff]/80 text-xs">Referral code: {referralCode}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-white/70 text-sm mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-[#06071F]/90 border border-[#00a2ff]/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#00a2ff]/50"
              />
            </div>
            
            {/* Password Input */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-white/70 text-sm mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#06071F]/90 border border-[#00a2ff]/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#00a2ff]/50"
              />
            </div>
            
            {/* Confirm Password Input */}
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-white/70 text-sm mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#06071F]/90 border border-[#00a2ff]/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#00a2ff]/50"
              />
            </div>
            
            {/* Terms Checkbox */}
            <div className="mb-6">
              <label className="flex items-start cursor-pointer">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-4 h-4 text-[#00a2ff] bg-[#06071F] border border-[#00a2ff]/30 rounded focus:ring-[#00a2ff] focus:ring-opacity-25"
                  />
                </div>
                <span className="ml-2 text-xs text-white/60">
                  I agree to the <a href="#" className="text-[#00a2ff] hover:underline">Terms of Service</a> and <a href="#" className="text-[#00a2ff] hover:underline">Privacy Policy</a>
                </span>
              </label>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-[#00a2ff] to-[#0077ff] hover:from-[#33b5ff] hover:to-[#3390ff] text-white rounded-full transition-all duration-300 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed mb-4"
            >
              {isSubmitting ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
          
          {/* Social Login */}
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative px-4 bg-[#06071F]/70">
              <span className="text-xs text-white/40">Or continue with</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              type="button"
              onClick={() => handleSocialLogin('Google')}
              className="flex justify-center items-center py-2 px-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors duration-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('Facebook')}
              className="flex justify-center items-center py-2 px-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors duration-300"
            >
              <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('Telegram')}
              className="flex justify-center items-center py-2 px-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors duration-300"
            >
              <svg className="w-5 h-5 text-[#0088cc]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </button>
          </div>
          
          {/* Login Link */}
          <div className="text-center text-white/50 text-sm">
            Already have an account? <a href="#" className="text-[#00a2ff] hover:underline">Log in</a>
          </div>
        </>
      ) : (
        <div className="text-center">
          <div className="w-20 h-20 bg-[#00a2ff]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#00a2ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h4 className="text-2xl text-white mb-4">Verify Your Email</h4>
          <p className="text-[#8aa0ff]/80 mb-6">
            We've sent a verification email to <span className="text-white">{email}</span>. 
            Please check your inbox and click the verification link to complete your registration.
          </p>
          <div className="bg-[#06071F]/50 border border-[#00a2ff]/20 rounded-lg p-4 mb-6">
            <p className="text-white/70 text-sm">
              After verification, you'll be able to:
            </p>
            <ul className="text-left mt-3 space-y-2 text-sm text-white/60">
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-[#00a2ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Claim Pre-BSN tokens every 4 hours
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-[#00a2ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Invite friends and earn referral rewards
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-[#00a2ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Reserve BSN tokens for the official launch
              </li>
            </ul>
          </div>
          <button
            onClick={() => setStep(1)}
            className="text-[#00a2ff] hover:underline"
          >
            Back to registration
          </button>
        </div>
      )}
    </div>
  );
};

export default RegistrationForm; 