import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FormField from './molecules/FormField';
import { Web3Button } from '@web3modal/react';
import { register } from '../utils/api';

const RegisterForm = ({ onRegisterSuccess }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('web2');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    wallet_address: '',
    acceptTerms: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.username || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (!formData.acceptTerms) {
      setError('Please accept the terms and conditions');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const registrationData = {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        wallet_address: formData.wallet_address || ''
      };
      await register(registrationData);
      if (onRegisterSuccess) onRegisterSuccess();
    } catch (err) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWalletSuccess = () => {
    if (onRegisterSuccess) onRegisterSuccess();
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Hintergrund mit Landing Page Style */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#0A0F29]"></div>
        
        {/* Subtle grid pattern wie auf der Landing Page */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(0, 162, 255, 0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(0, 162, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>

        {/* Glowing dots wie auf der Landing Page */}
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[#00A2FF] rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 bg-[#0A0F29]/95 backdrop-blur-xl rounded-lg p-6 border border-[#00A2FF]/10">
        {/* BSN Logo und Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-[#00A2FF]/10 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-[#00A2FF] font-bold text-xl">BSN</span>
              </div>
              <div className="absolute inset-0 bg-[#00A2FF]/5 rounded-lg blur-md"></div>
            </div>
          </div>
          
          <h2 className="text-xl font-light text-white mb-1">
            Blockchain Social Network
          </h2>
          <p className="text-[#00A2FF] text-sm font-light">
            Join the future of social media
          </p>
        </div>

        {/* Registration Method Selector */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('web2')}
            className={`flex-1 py-2 px-4 rounded text-sm transition-all duration-300 ${
              activeTab === 'web2'
                ? 'bg-[#00A2FF] text-white'
                : 'bg-[#00A2FF]/10 text-[#00A2FF] hover:bg-[#00A2FF]/20'
            }`}
          >
            Email Registration
          </button>
          <button
            onClick={() => setActiveTab('web3')}
            className={`flex-1 py-2 px-4 rounded text-sm transition-all duration-300 ${
              activeTab === 'web3'
                ? 'bg-[#00A2FF] text-white'
                : 'bg-[#00A2FF]/10 text-[#00A2FF] hover:bg-[#00A2FF]/20'
            }`}
          >
            Wallet Connect
          </button>
        </div>

        {activeTab === 'web2' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-white text-sm font-light mb-2">Personal Information</h3>
              <FormField
                type="email"
                label="Email Address"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-[#0A0F29] border border-[#00A2FF]/20 rounded text-white"
              />
              <FormField
                type="text"
                label="Username"
                name="username"
                placeholder="your_username"
                value={formData.username}
                onChange={handleChange}
                required
                className="bg-[#0A0F29] border border-[#00A2FF]/20 rounded text-white"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-white text-sm font-light mb-2">Security</h3>
              <FormField
                type="password"
                label="Password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="bg-[#0A0F29] border border-[#00A2FF]/20 rounded text-white"
              />
              <FormField
                type="password"
                label="Confirm Password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="bg-[#0A0F29] border border-[#00A2FF]/20 rounded text-white"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-white text-sm font-light mb-2">Wallet Integration (Optional)</h3>
              <FormField
                type="text"
                label="Wallet Address"
                name="wallet_address"
                placeholder="0x..."
                value={formData.wallet_address}
                onChange={handleChange}
                className="bg-[#0A0F29] border border-[#00A2FF]/20 rounded text-white"
              />
            </div>

            <div className="flex items-start gap-3 py-2">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="mt-1"
              />
              <span className="text-sm text-[#00A2FF]/80">
                I accept the{' '}
                <a href="/terms" className="text-[#00A2FF] hover:text-white transition-colors">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-[#00A2FF] hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </span>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded">
                <span className="text-sm text-red-400">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 bg-[#00A2FF] hover:bg-[#00A2FF]/90 text-white rounded text-sm transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10">
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </span>
              <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-[#00A2FF] text-sm mb-4">
                Connect your wallet to join BSN Network
              </p>
            </div>

            <Web3Button 
              className="w-full py-2 bg-[#00A2FF] hover:bg-[#00A2FF]/90 text-white rounded text-sm transition-all duration-300"
            />
            
            <button
              onClick={handleWalletSuccess}
              className="w-full py-2 bg-[#00A2FF]/10 hover:bg-[#00A2FF]/20 text-[#00A2FF] rounded text-sm transition-all duration-300"
            >
              <span className="mr-2">🦊</span>
              Connect MetaMask
            </button>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[#00A2FF]/20 text-center">
          <p className="text-[#00A2FF]/80 text-sm">
            Already have an account?{' '}
            <a href="/login" className="text-[#00A2FF] hover:text-white transition-colors">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm; 