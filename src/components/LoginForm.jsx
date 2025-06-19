import { useState } from 'react';
import { login } from '../utils/api';

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log('🔐 Attempting login with:', { email });
      const result = await login(email, password);
      console.log('✅ Login successful:', result);
      
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      console.error('❌ Login failed:', err);
      setError(err?.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#06071F]/70 backdrop-blur-lg border border-[#00a2ff]/20 rounded-lg p-8 w-full max-w-md">
      <h3 className="text-2xl font-light text-white mb-6">Sign in to BSN</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-white/70 text-sm mb-2">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full bg-[#06071F]/90 border border-[#00a2ff]/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#00a2ff]/50"
            disabled={isSubmitting}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-white/70 text-sm mb-2">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-[#06071F]/90 border border-[#00a2ff]/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#00a2ff]/50"
            disabled={isSubmitting}
          />
        </div>
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-gradient-to-r from-[#00a2ff] to-[#0077ff] hover:from-[#33b5ff] hover:to-[#3390ff] text-white rounded-full transition-all duration-300 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed mb-4"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </button>
        
        <div className="text-center text-white/50 text-sm">
          <p>Don't have an account? <a href="/register" className="text-[#00a2ff] hover:text-[#33b5ff]">Sign up</a></p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm; 