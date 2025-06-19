import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { safeT } from '../utils/i18nUtils';
import PageTemplate from '../components/templates/PageTemplate';
import EnhancedBackground from '../components/ui/EnhancedBackground';
import SectionTitle from '../components/ui/SectionTitle';
import TokenReservationWidget from '../components/TokenReservationWidget';
import { createTokenReservation, getTokenReservations, getToken, getIcoOverview } from '../utils/api';

const TokenReservationPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    wallet_address: '',
    amount_usd: '',
    network: 'ethereum',
    payment_method: 'eth'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userReservations, setUserReservations] = useState([]);
  const [icoStats, setIcoStats] = useState(null);
  const [error, setError] = useState('');

  // Verwende die safeT-Funktion für Übersetzungen mit korrektem Format
  const reservationT = (key) => safeT(t, `tokenReservationPage.${key}`);

  // Check authentication and load data
  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(!!token);
    
    if (token) {
      loadUserReservations();
    }
    
    loadIcoStats();
  }, []);

  const loadUserReservations = async () => {
    try {
      console.log('📋 Loading user reservations...');
      const reservations = await getTokenReservations();
      console.log('✅ User reservations loaded:', reservations);
      setUserReservations(reservations);
    } catch (err) {
      console.error('❌ Failed to load reservations:', err);
    }
  };

  const loadIcoStats = async () => {
    try {
      console.log('📊 Loading ICO stats...');
      const stats = await getIcoOverview();
      console.log('✅ ICO stats loaded:', stats);
      setIcoStats(stats);
    } catch (err) {
      console.error('❌ Failed to load ICO stats:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user types
  };

  const validateForm = () => {
    if (!formData.wallet_address || formData.wallet_address.length < 42) {
      setError('Please enter a valid wallet address');
      return false;
    }
    if (!formData.amount_usd || parseFloat(formData.amount_usd) < 50) {
      setError('Minimum purchase amount is $50 USD');
      return false;
    }
    if (parseFloat(formData.amount_usd) > 5000) {
      setError('Maximum purchase amount is $5,000 USD');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('Please log in to make a reservation');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      console.log('💳 Attempting token reservation:', formData);
      
      const reservationData = {
        wallet_address: formData.wallet_address,
        amount_usd: parseFloat(formData.amount_usd),
        network: formData.network,
        payment_method: formData.payment_method
      };
      
      const result = await createTokenReservation(reservationData);
      console.log('✅ Token reservation successful:', result);
      
      setIsSubmitting(false);
      setSuccess(true);
      setFormData({
        wallet_address: '',
        amount_usd: '',
        network: 'ethereum',
        payment_method: 'eth'
      });
      
      // Reload user reservations
      await loadUserReservations();
      
    } catch (err) {
      console.error('❌ Token reservation failed:', err);
      setError(err.message || 'Reservation failed. Please try again.');
      setIsSubmitting(false);
    }
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
        You need to be logged in to make token reservations. <a href="/login" className="underline">Sign in here</a>
      </p>
    </div>
  );

  return (
    <PageTemplate>
      <section className="py-20 relative overflow-hidden">
        <EnhancedBackground type="dataFlow" />
        
        <div className="container mx-auto px-6 relative z-10">
          <SectionTitle 
            title={reservationT('title')} 
            subtitle={reservationT('subtitle')}
          />
          
          <div className="max-w-4xl mx-auto">
            <TokenReservationWidget />
            
            <div className="mt-12 bg-gray-900/50 p-6 rounded-xl backdrop-blur-sm border border-gray-800">
              <h3 className="text-2xl font-light text-white mb-4">{reservationT('aboutTitle')}</h3>
              <div className="space-y-4 text-white/70">
                <p>
                  {reservationT('paragraph1')}
                </p>
                <p>
                  {reservationT('paragraph2')}
                </p>
                <p>
                  {reservationT('paragraph3')}
                </p>
                <p>
                  {reservationT('paragraph4')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-light text-white mb-6">{reservationT('aboutTitle')}</h2>
              <div className="space-y-4 text-white/80">
                <p>{reservationT('paragraph1')}</p>
                <p>{reservationT('paragraph2')}</p>
                <p>{reservationT('paragraph3')}</p>
                <p>{reservationT('paragraph4')}</p>
              </div>
              
              <div className="mt-12 grid grid-cols-2 gap-6">
                <div className="bg-gray-800 p-6 rounded-xl">
                  <div className="text-[#00a2ff] text-sm font-medium mb-2">Token Price</div>
                  <div className="text-white text-2xl font-light">${icoStats?.token_price_usd || 0.05} USD</div>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl">
                  <div className="text-[#00a2ff] text-sm font-medium mb-2">Min Purchase</div>
                  <div className="text-white text-2xl font-light">${icoStats?.min_purchase_usd || 50} USD</div>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl">
                  <div className="text-[#00a2ff] text-sm font-medium mb-2">Max Purchase</div>
                  <div className="text-white text-2xl font-light">${icoStats?.max_purchase_usd || 5000} USD</div>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl">
                  <div className="text-[#00a2ff] text-sm font-medium mb-2">Total Raised</div>
                  <div className="text-white text-2xl font-light">${icoStats?.total_raised_usd || 0} USD</div>
                </div>
              </div>
              
              {/* User's Reservations */}
              {isAuthenticated && userReservations.length > 0 && (
                <div className="mt-8 bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                  <h4 className="text-white font-medium mb-4">Your Reservations</h4>
                  <div className="space-y-3">
                    {userReservations.slice(0, 5).map((reservation, index) => (
                      <div key={index} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                        <div>
                          <div className="text-white text-sm">${reservation.amount_usd} USD</div>
                          <div className="text-white/50 text-xs">{reservation.network}</div>
                        </div>
                        <div className="text-right">
                          <div className={`px-2 py-1 rounded text-xs ${
                            reservation.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            reservation.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {reservation.status}
                          </div>
                          <div className="text-white/50 text-xs mt-1">
                            {new Date(reservation.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-gray-800 p-8 rounded-xl">
              {!isAuthenticated && <AuthenticationWarning />}
              
              {success ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-6">🎉</div>
                  <h3 className="text-2xl font-medium text-white mb-4">{t('tokenReservationPage.successTitle')}</h3>
                  <p className="text-white/70 mb-8">{t('tokenReservationPage.successMessage')}</p>
                  <button 
                    className="bg-[#00a2ff] text-white px-6 py-3 rounded-lg hover:bg-[#0077ff] transition-all"
                    onClick={() => setSuccess(false)}
                  >
                    {t('tokenReservationPage.makeAnother')}
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-light text-white mb-6">{t('tokenReservationPage.formTitle')}</h3>
                  
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
                  
                  <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                      <label className="block text-white/80 mb-2">Network</label>
                      <select
                        name="network"
                        value={formData.network}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
                        disabled={isSubmitting || !isAuthenticated}
                      >
                        <option value="ethereum">Ethereum</option>
                        <option value="polygon">Polygon</option>
                        <option value="bsc">BSC</option>
                        <option value="solana">Solana</option>
                      </select>
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-white/80 mb-2">Wallet Address</label>
                      <input
                        type="text"
                        name="wallet_address"
                        value={formData.wallet_address}
                        onChange={handleChange}
                        required
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
                        placeholder="0x..."
                        disabled={isSubmitting || !isAuthenticated}
                      />
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-white/80 mb-2">Amount (USD)</label>
                      <input
                        type="number"
                        name="amount_usd"
                        value={formData.amount_usd}
                        onChange={handleChange}
                        required
                        min="50"
                        max="5000"
                        step="0.01"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
                        placeholder="100.00"
                        disabled={isSubmitting || !isAuthenticated}
                      />
                      {formData.amount_usd && (
                        <div className="mt-2 text-[#00a2ff]">
                          ≈ {Math.round(parseFloat(formData.amount_usd) / (icoStats?.token_price_usd || 0.05)).toLocaleString()} BSN Tokens
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-8">
                      <label className="block text-white/80 mb-2">Payment Method</label>
                      <div className="grid grid-cols-3 gap-4">
                        <label className={`flex items-center justify-center p-4 border ${formData.payment_method === 'eth' ? 'border-[#00a2ff]' : 'border-gray-600'} rounded-lg cursor-pointer`}>
                          <input
                            type="radio"
                            name="payment_method"
                            value="eth"
                            checked={formData.payment_method === 'eth'}
                            onChange={handleChange}
                            className="sr-only"
                            disabled={isSubmitting || !isAuthenticated}
                          />
                          <span className="text-white">ETH</span>
                        </label>
                        
                        <label className={`flex items-center justify-center p-4 border ${formData.payment_method === 'usdt' ? 'border-[#00a2ff]' : 'border-gray-600'} rounded-lg cursor-pointer`}>
                          <input
                            type="radio"
                            name="payment_method"
                            value="usdt"
                            checked={formData.payment_method === 'usdt'}
                            onChange={handleChange}
                            className="sr-only"
                            disabled={isSubmitting || !isAuthenticated}
                          />
                          <span className="text-white">USDT</span>
                        </label>
                        
                        <label className={`flex items-center justify-center p-4 border ${formData.payment_method === 'usdc' ? 'border-[#00a2ff]' : 'border-gray-600'} rounded-lg cursor-pointer`}>
                          <input
                            type="radio"
                            name="payment_method"
                            value="usdc"
                            checked={formData.payment_method === 'usdc'}
                            onChange={handleChange}
                            className="sr-only"
                            disabled={isSubmitting || !isAuthenticated}
                          />
                          <span className="text-white">USDC</span>
                        </label>
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting || !isAuthenticated}
                      className="w-full bg-gradient-to-r from-[#00a2ff] to-[#0077ff] text-white py-4 rounded-lg hover:shadow-lg hover:shadow-[#00a2ff]/20 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </div>
                      ) : !isAuthenticated ? (
                        'Sign in to Reserve'
                      ) : (
                        'Reserve Tokens'
                      )}
                    </button>
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

export default TokenReservationPage;