import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageProvider';
import { authAPI } from '@/lib/django-api-new';
import { toast } from 'sonner';

const Register3D: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Frontend-Validierung
      if (password !== passwordConfirm) {
        toast.error('Passwörter stimmen nicht überein');
        return;
      }
      
      if (password.length < 8) {
        toast.error('Passwort muss mindestens 8 Zeichen lang sein');
        return;
      }
      
      const response = await authAPI.register({
        email,
        password,
        password_confirm: passwordConfirm,
        username,
        first_name: firstName,
        last_name: lastName
      });
      
      if (response && response.user) {
        // Tokens speichern - Backend gibt 'token' und 'refresh' zurück
        const token = response.token;
        const refresh = response.refresh;
        
        if (token && refresh) {
          localStorage.setItem('access_token', token);
          localStorage.setItem('refresh_token', refresh);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          toast.success('Registrierung erfolgreich! Willkommen bei BSN!');
          
          // Kurze Verzögerung für bessere UX
          setTimeout(() => {
            navigate('/feed');
          }, 500);
        } else {
          throw new Error('Token-Informationen fehlen in der Server-Antwort');
        }
      } else {
        throw new Error('Ungültige Antwort vom Server');
      }
    } catch (error: unknown) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registrierung fehlgeschlagen';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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
            {t('register.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {language === 'de' ? 'Oder' : 'Or'}{' '}
            <Link to="/login" className="font-medium text-pink-500 hover:text-pink-400">
              {t('register.sign_in')}
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} data-testid="register-form">
          <div className="space-y-4">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('register.username')}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 bg-dark-300 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder={t('register.usernamePlaceholder')}
                required
              />
            </motion.div>
            
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('register.firstName')}
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 bg-dark-300 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder={t('register.firstNamePlaceholder')}
              />
            </motion.div>
            
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('register.lastName')}
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 bg-dark-300 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder={t('register.lastNamePlaceholder')}
              />
            </motion.div>
            
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('register.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 bg-dark-300 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder={t('register.emailPlaceholder')}
                required
              />
            </motion.div>
            
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('register.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 bg-dark-300 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder={t('register.passwordPlaceholder')}
                required
              />
            </motion.div>
            
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('register.passwordConfirm')}
              </label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 bg-dark-300 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder={t('register.passwordConfirmPlaceholder')}
                required
              />
            </motion.div>
          </div>

          <motion.button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 font-medium"
            disabled={isLoading}
            whileHover={{ y: -2 }}
            whileTap={{ y: 1 }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('register.creating')}
              </div>
            ) : (
              t('register.createAccount')
            )}
          </motion.button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-300">
            {t('register.alreadyHaveAccount')}{' '}
            <Link
              to="/login"
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              {t('register.signIn')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register3D;
