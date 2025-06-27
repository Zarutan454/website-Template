import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createTokenReservation, getTokenReservations, getToken, getIcoOverview } from '../utils/api';

const TokenReservationPage: React.FC = () => {
  const { user } = useAuth();
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
  const [isLoading, setIsLoading] = useState(true);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
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
      setError(err instanceof Error ? err.message : 'Reservation failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-600">Loading token reservation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-light text-gray-900 mb-4">
            BSN Token Reservation
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Secure your position in the future of blockchain social networking. 
            Reserve BSN tokens now and be part of the revolution.
          </p>
        </div>

        {/* Authentication Warning */}
        {!isAuthenticated && (
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
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-400 font-medium">Reservation Successful!</span>
            </div>
            <p className="text-green-300/80 mt-2 text-sm">
              Your token reservation has been created successfully.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-400 font-medium">Error</span>
            </div>
            <p className="text-red-300/80 mt-2 text-sm">{error}</p>
          </div>
        )}

        {/* Reservation Form */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Token Reservation Form</h2>
            
            <div className="mb-4">
              <label htmlFor="wallet_address" className="block text-sm font-medium text-gray-700 mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                id="wallet_address"
                name="wallet_address"
                value={formData.wallet_address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0x..."
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="amount_usd" className="block text-sm font-medium text-gray-700 mb-2">
                Amount (USD)
              </label>
              <input
                type="number"
                id="amount_usd"
                name="amount_usd"
                value={formData.amount_usd}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="100"
                min="50"
                max="5000"
                step="0.01"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="network" className="block text-sm font-medium text-gray-700 mb-2">
                Network
              </label>
              <select
                id="network"
                name="network"
                value={formData.network}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ethereum">Ethereum</option>
                <option value="polygon">Polygon</option>
                <option value="bsc">BSC</option>
              </select>
            </div>

            <div className="mb-6">
              <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                id="payment_method"
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="eth">ETH</option>
                <option value="usdt">USDT</option>
                <option value="usdc">USDC</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isAuthenticated}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Reserve Tokens'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TokenReservationPage; 
