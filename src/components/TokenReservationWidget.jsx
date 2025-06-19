import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { safeT } from '../utils/i18nUtils';
import { useWallet } from '../context/WalletContext';

const TokenReservationWidget = () => {
  const { t } = useTranslation();
  const { 
    walletAddress, 
    isConnected, 
    isConnecting, 
    currentNetwork,
    walletBalance,
    connectWallet, 
    disconnectWallet 
  } = useWallet();

  // State für die Token-Reservierung
  const [isLoading, setIsLoading] = useState(false);
  const [reservationAmount, setReservationAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('eth');
  const [reservationHistory, setReservationHistory] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Token-Preis und Limits
  const TOKEN_PRICE = 0.05; // $0.05 pro Token
  const MIN_AMOUNT = 50; // $50 Mindestbetrag
  const MAX_AMOUNT = 5000; // $5000 Maximalbetrag

  // Lade Reservierungshistorie beim Verbinden
  useEffect(() => {
    if (isConnected && walletAddress) {
      // Hier würde die tatsächliche API-Anfrage für die Historie stehen
      // Für jetzt simulieren wir eine Historie
      setReservationHistory([
        {
          id: 1,
          amount: 2000,
          tokens: 40000,
          date: '2023-06-10T14:20:00Z',
          status: 'completed'
        }
      ]);
    }
  }, [isConnected, walletAddress]);

  // Berechne die Anzahl der Token basierend auf dem Betrag
  const calculateTokens = (amount) => {
    return amount / TOKEN_PRICE;
  };

  // Behandle Änderungen im Eingabefeld
  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setReservationAmount(value);
    }
  };

  // Simuliere die Reservierung von Tokens
  const reserveTokens = async () => {
    if (!isConnected) {
      setError(t('tokenReservationWidget.errorConnectWallet'));
      return;
    }

    const amount = parseFloat(reservationAmount);

    if (isNaN(amount) || amount === 0) {
      setError(t('tokenReservationWidget.errorValidAmount'));
      return;
    }

    if (amount < MIN_AMOUNT) {
      setError(t('tokenReservationWidget.errorMinAmount', { amount: MIN_AMOUNT }));
      return;
    }

    if (amount > MAX_AMOUNT) {
      setError(t('tokenReservationWidget.errorMaxAmount', { amount: MAX_AMOUNT }));
      return;
    }

    // Prüfe Wallet Balance
    const walletBalanceNum = parseFloat(walletBalance);
    if (walletBalanceNum < amount) {
      setError(t('tokenReservationWidget.insufficientBalance'));
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Hier würde die tatsächliche API-Anfrage stehen
      setTimeout(() => {
        const tokens = calculateTokens(amount);

        // Füge die Reservierung zur Historie hinzu
        setReservationHistory(prev => [
          {
            id: Date.now(),
            amount,
            tokens,
            date: new Date().toISOString(),
            status: 'pending'
          },
          ...prev
        ]);

        setReservationAmount('');
        setSuccess(t('tokenReservationWidget.successReservation', { tokens: tokens.toLocaleString(), amount: amount.toLocaleString() }));
        setIsLoading(false);
      }, 2000);
    } catch (err) {
      setError(t('tokenReservationWidget.errorReservation'));
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900/50 p-6 rounded-xl backdrop-blur-sm border border-gray-800">
      <h2 className="text-3xl font-light text-white mb-6">{t('tokenReservationPage.title')}</h2>

      {!isConnected ? (
        <div className="mb-8">
          <p className="text-white/70 mb-4">
            {t('tokenReservationWidget.connectWalletText')}
          </p>
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="bg-gradient-to-r from-[#00a2ff] to-[#0077ff] text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-[#00a2ff]/20 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? t('tokenReservationWidget.connecting') : t('wallet.connect')}
          </button>
        </div>
      ) : (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/70">{t('tokenReservationWidget.connectedWallet')}:</p>
            <p className="text-[#00a2ff] font-mono">{walletAddress}</p>
          </div>

          {/* Wallet Info */}
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/70">{t('wallet.balance')}:</span>
              <span className="text-white">
                {parseFloat(walletBalance).toFixed(4)} {currentNetwork?.symbol || 'ETH'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">{t('wallet.network')}:</span>
              <span className="text-white">{currentNetwork?.name || 'Unknown'}</span>
            </div>
          </div>

          {/* Token-Reservierung */}
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 mb-6">
            <h3 className="text-xl text-white mb-3">{t('tokenReservationWidget.reserveTokens')}</h3>

            <div className="mb-4">
              <label className="block text-white/70 mb-2">{t('tokenReservationWidget.amount')} (USD)</label>
              <div className="flex">
                <span className="bg-gray-700 text-white/80 p-3 rounded-l-lg border border-gray-600">$</span>
                <input
                  type="text"
                  value={reservationAmount}
                  onChange={handleAmountChange}
                  placeholder={`${MIN_AMOUNT} - ${MAX_AMOUNT}`}
                  className="bg-gray-900 text-white/80 p-3 rounded-r-lg flex-grow border border-gray-700 focus:outline-none"
                />
              </div>
              <p className="text-white/60 text-sm mt-1">
                1 BSN = ${TOKEN_PRICE.toFixed(2)} | {t('tokenReservationWidget.min')}: ${MIN_AMOUNT} | {t('tokenReservationWidget.max')}: ${MAX_AMOUNT}
              </p>
            </div>

            {reservationAmount && !isNaN(parseFloat(reservationAmount)) && (
              <div className="mb-4 bg-gray-700/30 p-3 rounded-lg">
                <p className="text-white/70">
                  {t('tokenReservationWidget.youReceive')}: <span className="text-[#00a2ff] font-semibold">
                    {calculateTokens(parseFloat(reservationAmount)).toLocaleString()} BSN-Token
                  </span>
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-white/70 mb-2">{t('tokenReservationWidget.paymentMethod')}</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPaymentMethod('eth')}
                  className={`p-3 rounded-lg border ${
                    paymentMethod === 'eth'
                      ? 'border-[#00a2ff] bg-[#00a2ff]/10'
                      : 'border-gray-700 bg-gray-800/30'
                  } transition`}
                >
                  <p className={`text-center ${paymentMethod === 'eth' ? 'text-[#00a2ff]' : 'text-white/70'}`}>ETH</p>
                </button>
                <button
                  onClick={() => setPaymentMethod('usdt')}
                  className={`p-3 rounded-lg border ${
                    paymentMethod === 'usdt'
                      ? 'border-[#00a2ff] bg-[#00a2ff]/10'
                      : 'border-gray-700 bg-gray-800/30'
                  } transition`}
                >
                  <p className={`text-center ${paymentMethod === 'usdt' ? 'text-[#00a2ff]' : 'text-white/70'}`}>USDT</p>
                </button>
                <button
                  onClick={() => setPaymentMethod('usdc')}
                  className={`p-3 rounded-lg border ${
                    paymentMethod === 'usdc'
                      ? 'border-[#00a2ff] bg-[#00a2ff]/10'
                      : 'border-gray-700 bg-gray-800/30'
                  } transition`}
                >
                  <p className={`text-center ${paymentMethod === 'usdc' ? 'text-[#00a2ff]' : 'text-white/70'}`}>USDC</p>
                </button>
              </div>
            </div>

            <button
              onClick={reserveTokens}
              disabled={isLoading || !reservationAmount || isNaN(parseFloat(reservationAmount))}
              className="w-full bg-gradient-to-r from-[#00a2ff] to-[#0077ff] text-white py-3 rounded-lg hover:shadow-lg hover:shadow-[#00a2ff]/20 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t('tokenReservationWidget.processing') : t('tokenReservationWidget.reserveTokens')}
            </button>

            <p className="text-white/60 text-sm mt-3">
              {t('tokenReservationWidget.reservationNote')}
            </p>
          </div>

          {/* Error und Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-600/20 border border-red-600/50 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-600/20 border border-green-600/50 rounded-lg">
              <p className="text-green-400">{success}</p>
            </div>
          )}

          {/* Reservierungshistorie */}
          {reservationHistory.length > 0 && (
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <h3 className="text-xl text-white mb-3">{t('tokenReservationWidget.reservationHistory')}</h3>
              <div className="space-y-2">
                {reservationHistory.map((reservation) => (
                  <div key={reservation.id} className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                    <div>
                      <p className="text-white">
                        ${reservation.amount.toLocaleString()} → {reservation.tokens.toLocaleString()} BSN
                      </p>
                      <p className="text-white/60 text-sm">
                        {new Date(reservation.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      reservation.status === 'completed' 
                        ? 'bg-green-600/20 text-green-400' 
                        : reservation.status === 'pending'
                        ? 'bg-yellow-600/20 text-yellow-400'
                        : 'bg-red-600/20 text-red-400'
                    }`}>
                      {t(`tokenReservationWidget.status${reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TokenReservationWidget;