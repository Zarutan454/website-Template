import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { safeT } from '../utils/i18nUtils';
import PageTemplate from '../components/templates/PageTemplate';
import EnhancedBackground from '../components/ui/EnhancedBackground';
import SectionTitle from '../components/ui/SectionTitle';
import { createFaucetRequest, getFaucetRequests, getToken } from '../utils/api';

const FaucetPage = () => {
  const { t } = useTranslation();
  const [walletAddress, setWalletAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userWallet, setUserWallet] = useState('');
  const [lastRequest, setLastRequest] = useState(null);
  const [network, setNetwork] = useState('ethereum');

  // Verwende die safeT-Funktion für Übersetzungen
  const faucetT = (key) => safeT(t, `faucetPage.${key}`);

  // Check authentication status on component mount
  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(!!token);
    
    if (token) {
      // Load user's last faucet request
      loadLastFaucetRequest();
    }
  }, []);

  const loadLastFaucetRequest = async () => {
    try {
      const requests = await getFaucetRequests();
      if (requests && requests.length > 0) {
        const lastRequest = requests[requests.length - 1];
        setLastRequest(lastRequest);
        
        // Calculate remaining cooldown
        const lastRequestTime = new Date(lastRequest.created_at);
        const now = new Date();
        const timeDiff = Math.floor((now - lastRequestTime) / 1000); // seconds
        const cooldownPeriod = 4 * 60 * 60; // 4 hours in seconds
        
        if (timeDiff < cooldownPeriod) {
          setCountdown(cooldownPeriod - timeDiff);
          startCountdown(cooldownPeriod - timeDiff);
        }
      }
    } catch (err) {
      console.error('Failed to load last faucet request:', err);
    }
  };

  const startCountdown = (seconds) => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleChange = (e) => {
    setWalletAddress(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('Please log in to use the faucet');
      return;
    }
    
    if (!walletAddress || walletAddress.length < 42) {
      setError('Please enter a valid wallet address');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      console.log('💧 Attempting faucet request:', { network, walletAddress });
      
      const result = await createFaucetRequest({
        network,
        wallet_address: walletAddress,
        amount_requested: 50,
        reason: 'Test faucet request',
      });
      
      console.log('✅ Faucet request successful:', result);
      
      setIsSubmitting(false);
      setSuccess(true);
      setWalletAddress('');
      setCountdown(14400); // 4 Stunden in Sekunden
      startCountdown(14400);
      
      // Update last request
      setLastRequest(result);
      
    } catch (err) {
      console.error('❌ Faucet request failed:', err);
      setError(err.message || 'Faucet request failed. Please try again later.');
      setIsSubmitting(false);
    }
  };

  // Formatiere Countdown
  const formatTime = (seconds) => {
    if (!seconds) return '';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Authentication warning component
  const AuthenticationWarning = () => (
    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span className="text-yellow-400 font-medium">Authentication Required</span>
      </div>
      <p className="text-yellow-300/80 mt-2 text-sm">
        You need to be logged in to use the faucet. <a href="/login" className="underline">Sign in here</a>
      </p>
    </div>
  );

  return (
    <PageTemplate>
      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <EnhancedBackground type="particles" />
        
        <div className="container mx-auto px-6 relative z-10">
          <SectionTitle 
            title={faucetT('title')} 
            subtitle={faucetT('subtitle')}
          />
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Information Column */}
            <div>
              <div className="bg-gray-900/50 p-6 rounded-xl backdrop-blur-sm border border-gray-800">
                <h3 className="text-2xl font-light text-white mb-4">{faucetT('aboutTitle')}</h3>
                <div className="space-y-4 text-white/70">
                  <p>{faucetT('paragraph1')}</p>
                  <p>{faucetT('paragraph2')}</p>
                  <p>{faucetT('paragraph3')}</p>
                </div>
              </div>
              
              {/* Token Stats */}
              <div className="mt-8 grid grid-cols-2 gap-6">
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                  <div className="text-[#00a2ff] text-sm font-medium mb-2">Tokens per Request</div>
                  <div className="text-white text-2xl font-light">50 BSN</div>
                </div>
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                  <div className="text-[#00a2ff] text-sm font-medium mb-2">Cooldown Period</div>
                  <div className="text-white text-2xl font-light">4 Hours</div>
                </div>
              </div>
              
              {/* Last Request Info */}
              {lastRequest && (
                <div className="mt-6 bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                  <h4 className="text-white font-medium mb-3">Last Request</h4>
                  <div className="space-y-2 text-sm text-white/70">
                    <p>Amount: {lastRequest.amount_requested} BSN</p>
                    <p>Network: {lastRequest.network}</p>
                    <p>Status: <span className={`px-2 py-1 rounded text-xs ${lastRequest.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {lastRequest.status}
                    </span></p>
                    <p>Date: {new Date(lastRequest.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Faucet Form */}
            <div className="bg-gray-800/50 p-8 rounded-xl backdrop-blur-sm border border-gray-700">
              {!isAuthenticated && <AuthenticationWarning />}
              
              {success ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-6">💧</div>
                  <h3 className="text-2xl font-medium text-white mb-4">Tokens Sent!</h3>
                  <p className="text-white/70 mb-8">50 BSN tokens have been sent to your wallet. You can request again in:</p>
                  <div className="text-3xl font-light text-[#00a2ff] mb-8">{formatTime(countdown)}</div>
                  <button 
                    className="bg-gray-700 text-white/50 px-6 py-3 rounded-lg cursor-not-allowed"
                    disabled
                  >
                    Request Again
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-light text-white mb-6">Request Test Tokens</h3>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                      <label className="block text-white/80 mb-2">Network</label>
                      <select
                        value={network}
                        onChange={(e) => setNetwork(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
                        disabled={isSubmitting}
                      >
                        <option value="ethereum">Ethereum</option>
                        <option value="polygon">Polygon</option>
                        <option value="bsc">BSC</option>
                        <option value="solana">Solana</option>
                      </select>
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-white/80 mb-2">Your Wallet Address</label>
                      <input
                        type="text"
                        value={walletAddress}
                        onChange={handleChange}
                        required
                        className={`w-full bg-gray-700 border ${error ? 'border-red-500' : 'border-gray-600'} rounded-lg px-4 py-3 text-white`}
                        placeholder="0x..."
                        disabled={isSubmitting || !isAuthenticated}
                      />
                      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#00a2ff] to-[#0077ff] text-white py-4 rounded-lg hover:shadow-lg hover:shadow-[#00a2ff]/20 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmitting || countdown !== null || !isAuthenticated}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </div>
                      ) : countdown !== null ? (
                        `Wait ${formatTime(countdown)}`
                      ) : !isAuthenticated ? (
                        'Sign in to Request'
                      ) : (
                        'Request Tokens'
                      )}
                    </button>
                    
                    <div className="mt-6 text-center text-white/50 text-sm">
                      <p>Or connect your wallet to request tokens automatically</p>
                      <button 
                        type="button"
                        className="mt-4 bg-transparent border border-[#00a2ff] text-[#00a2ff] px-6 py-2 rounded-lg hover:bg-[#00a2ff]/10 transition-all"
                      >
                        {t('common.connectWallet')}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </PageTemplate>
  );
};

export default FaucetPage;