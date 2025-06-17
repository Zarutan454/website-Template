import { useState } from 'react';

const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
    
    if (!consent) {
      setError('Please agree to the privacy policy');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, this would be an API call to backend
      // const response = await fetch('/api/newsletter/subscribe/', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });
      // const data = await response.json();
      
      // Store subscription in localStorage for demo purposes
      const subscription = {
        email,
        timestamp: new Date().toISOString(),
        confirmed: false
      };
      
      const existingSubscriptions = JSON.parse(localStorage.getItem('bsn_newsletter_subscriptions') || '[]');
      localStorage.setItem('bsn_newsletter_subscriptions', JSON.stringify([...existingSubscriptions, subscription]));
      
      // Show success message
      setSuccess(true);
      
      // Reset form
      setEmail('');
      setConsent(false);
      
    } catch (err) {
      setError('Failed to subscribe. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#06071F]/70 backdrop-blur-lg border border-[#00a2ff]/20 rounded-lg p-6 w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-light text-white">Newsletter</h3>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-[#00a2ff]/60 rounded-full mr-2"></div>
          <span className="text-xs text-[#8aa0ff]/80">Stay Updated</span>
        </div>
      </div>
      
      <p className="text-[#8aa0ff]/80 text-sm mb-6">
        Subscribe to our newsletter and be the first to know about platform updates, token events, and exclusive community offers.
      </p>
      
      {success ? (
        <div className="bg-[#06071F]/50 border border-green-500/20 rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h4 className="text-xl text-white mb-2">Thank You!</h4>
          <p className="text-[#8aa0ff]/80">
            You've been successfully subscribed to our newsletter.
          </p>
          <p className="mt-4 text-white/60 text-xs">
            Please check your inbox for a confirmation email. You may need to confirm your subscription to start receiving updates.
          </p>
          <button 
            className="mt-6 w-full py-3 bg-gradient-to-r from-[#00a2ff] to-[#0077ff] hover:from-[#33b5ff] hover:to-[#3390ff] text-white rounded-full transition-all duration-300"
            onClick={() => setSuccess(false)}
          >
            Subscribe Another Email
          </button>
        </div>
      ) : (
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
          
          {/* Consent Checkbox */}
          <div className="mb-6">
            <label className="flex items-start cursor-pointer">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="w-4 h-4 text-[#00a2ff] bg-[#06071F] border border-[#00a2ff]/30 rounded focus:ring-[#00a2ff] focus:ring-opacity-25"
                />
              </div>
              <span className="ml-2 text-xs text-white/60">
                I agree to receive newsletter emails and accept the <a href="#" className="text-[#00a2ff] hover:underline">privacy policy</a>. You can unsubscribe at any time.
              </span>
            </label>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-[#00a2ff] to-[#0077ff] hover:from-[#33b5ff] hover:to-[#3390ff] text-white rounded-full transition-all duration-300 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Subscribe to Newsletter'
            )}
          </button>
          
          {/* Info Text */}
          <div className="mt-4 flex items-center justify-center text-xs text-[#8aa0ff]/60">
            <svg className="w-4 h-4 mr-1 text-[#00a2ff]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Join 25,000+ blockchain enthusiasts
          </div>
        </form>
      )}
    </div>
  );
};

export default NewsletterForm; 