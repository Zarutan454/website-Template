import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReferralWidget from '../components/ReferralWidget';
import EnhancedBackground from '../components/ui/EnhancedBackground';
import SectionTitle from '../components/ui/SectionTitle';
import PageTemplate from '../components/templates/PageTemplate';
import { safeT } from '../utils/i18nUtils';
import { getReferralCode, getReferralProgram, getToken } from '../utils/api';

const ReferralPage = () => {
  const { t } = useTranslation();
  const [referralData, setReferralData] = useState(null);
  const [referralStats, setReferralStats] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Verwende die safeT-Funktion für Übersetzungen
  const referralT = (key) => safeT(t, `referralPage.${key}`);

  // Check authentication and load referral data
  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(!!token);
    
    if (token) {
      loadReferralData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadReferralData = async () => {
    try {
      setIsLoading(true);
      console.log('🔗 Loading referral data...');
      
      // Load referral code
      const codeData = await getReferralCode();
      console.log('✅ Referral code loaded:', codeData);
      setReferralData(codeData);
      
      // Load referral program stats
      const programData = await getReferralProgram();
      console.log('✅ Referral program loaded:', programData);
      setReferralStats(programData);
      
    } catch (err) {
      console.error('❌ Failed to load referral data:', err);
      setError(err.message || 'Failed to load referral data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (referralData?.referral_link) {
      navigator.clipboard.writeText(referralData.referral_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareToSocial = (platform) => {
    if (!referralData?.referral_link) return;
    
    const text = `Join BSN and earn rewards! Use my referral link: ${referralData.referral_link}`;
    const url = encodeURIComponent(referralData.referral_link);
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}&text=${encodeURIComponent('Join BSN and earn rewards!')}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
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
        You need to be logged in to access your referral program. <a href="/login" className="underline">Sign in here</a>
      </p>
    </div>
  );

  return (
    <PageTemplate>
      <section className="pt-32 pb-20 relative overflow-hidden">
        <EnhancedBackground type="particles" />
        
        <div className="container mx-auto px-6 relative z-10">
          <SectionTitle 
            title={referralT('title')} 
            subtitle={referralT('subtitle')}
          />
        </div>
      </section>

      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="bg-gray-900/50 p-6 rounded-xl backdrop-blur-sm border border-gray-800">
                <h3 className="text-2xl font-light text-white mb-4">{referralT('aboutTitle')}</h3>
                <div className="space-y-4 text-white/70">
                  <p>{referralT('paragraph1')}</p>
                  <p>{referralT('paragraph2')}</p>
                  <p>{referralT('paragraph3')}</p>
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-6">
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                  <div className="text-[#00a2ff] text-sm font-medium mb-2">Reward per Referral</div>
                  <div className="text-white text-2xl font-light">50 BSN</div>
                </div>
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                  <div className="text-[#00a2ff] text-sm font-medium mb-2">Min. Purchase</div>
                  <div className="text-white text-2xl font-light">100 BSN</div>
                </div>
              </div>
              
              {/* Referral Program Info */}
              {referralStats && (
                <div className="mt-6 bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                  <h4 className="text-white font-medium mb-3">Program Details</h4>
                  <div className="space-y-2 text-sm text-white/70">
                    <p>Commission Rate: {referralStats.commission_rate || 5}%</p>
                    <p>Minimum Purchase: {referralStats.min_purchase || 100} BSN</p>
                    <p>Program Status: <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">
                      {referralStats.is_active ? 'Active' : 'Inactive'}
                    </span></p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-gray-800/50 p-8 rounded-xl backdrop-blur-sm border border-gray-700">
              {!isAuthenticated && <AuthenticationWarning />}
              
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 text-[#00a2ff] mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </div>
                  <p className="text-white/70">Loading your referral data...</p>
                </div>
              ) : !isAuthenticated ? (
                <div className="text-center py-8">
                  <p className="text-white/70 mb-6">Sign in to access your referral program</p>
                  <a 
                    href="/login"
                    className="bg-gradient-to-r from-[#00a2ff] to-[#0077ff] text-white px-8 py-3 rounded-lg hover:shadow-lg hover:shadow-[#00a2ff]/20 transition-all inline-block"
                  >
                    Sign In
                  </a>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-light text-white mb-6">Your Referral Link</h3>
                  
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
                  
                  <div className="mb-8">
                    <div className="flex">
                      <input
                        type="text"
                        value={referralData?.referral_link || 'Loading...'}
                        readOnly
                        className="flex-grow bg-gray-700 border border-gray-600 rounded-l-lg px-4 py-3 text-white"
                      />
                      <button
                        onClick={handleCopyLink}
                        disabled={!referralData?.referral_link}
                        className={`px-4 rounded-r-lg ${
                          copied 
                            ? 'bg-green-600 text-white' 
                            : 'bg-[#00a2ff] text-white hover:bg-[#0077ff]'
                        } transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <h4 className="text-lg font-medium text-white">Share Your Link</h4>
                    <div className="flex flex-wrap gap-4">
                      <button 
                        onClick={() => shareToSocial('facebook')}
                        disabled={!referralData?.referral_link}
                        className="flex-1 bg-[#1877f2] text-white py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Facebook
                      </button>
                      <button 
                        onClick={() => shareToSocial('twitter')}
                        disabled={!referralData?.referral_link}
                        className="flex-1 bg-[#1da1f2] text-white py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Twitter
                      </button>
                      <button 
                        onClick={() => shareToSocial('telegram')}
                        disabled={!referralData?.referral_link}
                        className="flex-1 bg-[#0088cc] text-white py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Telegram
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-8 border-t border-gray-700">
                    <h4 className="text-lg font-medium text-white mb-4">Your Referral Stats</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <div className="text-sm text-white/70 mb-1">Total Referrals</div>
                        <div className="text-xl text-white">{referralStats?.total_referrals || 0}</div>
                      </div>
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <div className="text-sm text-white/70 mb-1">Total Rewards</div>
                        <div className="text-xl text-white">{referralStats?.total_rewards || 0} BSN</div>
                      </div>
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <div className="text-sm text-white/70 mb-1">Pending Rewards</div>
                        <div className="text-xl text-white">{referralStats?.pending_rewards || 0} BSN</div>
                      </div>
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <div className="text-sm text-white/70 mb-1">Claimed Rewards</div>
                        <div className="text-xl text-white">{referralStats?.claimed_rewards || 0} BSN</div>
                      </div>
                    </div>
                    
                    {/* Recent Referrals */}
                    {referralStats?.recent_referrals && referralStats.recent_referrals.length > 0 && (
                      <div className="mt-6">
                        <h5 className="text-white font-medium mb-3">Recent Referrals</h5>
                        <div className="space-y-2">
                          {referralStats.recent_referrals.slice(0, 5).map((referral, index) => (
                            <div key={index} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                              <div>
                                <div className="text-white text-sm">{referral.username || 'Anonymous'}</div>
                                <div className="text-white/50 text-xs">{new Date(referral.created_at).toLocaleDateString()}</div>
                              </div>
                              <div className="text-[#00a2ff] text-sm">
                                {referral.status === 'completed' ? 'Completed' : 'Pending'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </PageTemplate>
  );
};

export default ReferralPage;