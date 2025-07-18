import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageProvider';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const Login3D: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      
      console.log('Login successful, navigating to /feed...');
      
      // Kurze Verzögerung für bessere UX
      setTimeout(() => {
        navigate('/feed');
      }, 500);
    } catch (error: unknown) {
      console.error('Login error:', error);
      // Fehlerbehandlung ist bereits im AuthContext implementiert
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Avatar removed as requested */}
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid pattern */}
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(to right, #ffffff05 1px, transparent 1px), linear-gradient(to bottom, #ffffff05 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        
        {/* Animated gradient blobs */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-pink-500/20 rounded-full blur-3xl"
          animate={{ 
            x: [0, 30, 0], 
            y: [0, -30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 10,
            ease: "easeInOut" 
          }}
        />
        
        <motion.div 
          className="absolute bottom-1/3 right-1/3 w-64 h-64 md:w-96 md:h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{ 
            x: [0, -20, 0], 
            y: [0, 20, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 8,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>
      
      <motion.div 
        className="max-w-md w-full space-y-8 bg-dark-200/80 backdrop-blur-lg p-10 rounded-2xl border border-gray-800 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <motion.div 
            className="mx-auto h-16 w-16 relative"
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 blur-lg opacity-70" />
            <div className="absolute inset-1 rounded-full bg-dark-300 flex items-center justify-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 text-2xl font-bold">BSN</span>
            </div>
          </motion.div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            {t('login.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {language === 'de' ? 'Oder' : 'Or'}{' '}
            <Link to="/register" className="font-medium text-pink-500 hover:text-pink-400">
              {t('login.create_account')}
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md -space-y-px">
            <div className="mb-4">
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-700 bg-dark-300 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder={t('login.email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </motion.div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-700 bg-dark-300 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder={t('login.password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </motion.div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-700 rounded bg-dark-300"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                {t('login.remember_me')}
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-pink-500 hover:text-pink-400">
                {t('login.forgot_password')}
              </a>
            </div>
          </div>

          <div>
            <motion.button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 font-medium"
              disabled={isLoading}
              whileHover={{ y: -2 }}
              whileTap={{ y: 1 }}
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <span>{t('login.sign_in')}</span>
              )}
            </motion.button>
          </div>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-dark-200 text-gray-400">
                {t('login.or_continue')}
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <motion.button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-700 rounded-lg bg-dark-300 text-gray-400 hover:bg-dark-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              whileHover={{ y: -2 }}
              whileTap={{ y: 1 }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0110 4.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.14 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
              </svg>
            </motion.button>

            <motion.button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-700 rounded-lg bg-dark-300 text-gray-400 hover:bg-dark-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              whileHover={{ y: -2 }}
              whileTap={{ y: 1 }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </motion.button>

            <motion.button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-700 rounded-lg bg-dark-300 text-gray-400 hover:bg-dark-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              whileHover={{ y: -2 }}
              whileTap={{ y: 1 }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0110 4.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.14 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
              </svg>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login3D;
