import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'de' | 'en';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  de: {
    'nav.home': 'Home',
    'nav.features': 'Features',
    'nav.mining': 'Mining',
    'nav.roadmap': 'Roadmap',
    'nav.faq': 'FAQ',
    'nav.login': 'Login',
    'nav.register': 'Registrieren',
    'nav.feed': 'Feed',
    'nav.nft-market': 'NFT-Markt',
    'nav.wallet': 'Wallet',
    'nav.profile': 'Profil',
    'nav.settings': 'Einstellungen',
    'nav.notifications': 'Benachrichtigungen',
    'nav.logout': 'Abmelden',
    'nav.my-account': 'Mein Account',
    
    'login.title': 'Melde dich in deinem Konto an',
    'login.create_account': 'erstelle ein neues Konto',
    'login.email': 'E-Mail-Adresse',
    'login.password': 'Passwort',
    'login.remember_me': 'Angemeldet bleiben',
    'login.forgot_password': 'Passwort vergessen?',
    'login.sign_in': 'Anmelden',
    'login.or_continue': 'Oder fortfahren mit',
    'login.error': 'Ein Fehler ist bei der Anmeldung aufgetreten',
    
    'register.title': 'Konto erstellen',
    'register.subtitle': 'Erstelle ein neues BSN-Konto um fortzufahren',
    'register.username': 'Benutzername',
    'register.usernamePlaceholder': 'Benutzername eingeben',
    'register.firstName': 'Vorname',
    'register.firstNamePlaceholder': 'Vorname eingeben',
    'register.lastName': 'Nachname',
    'register.lastNamePlaceholder': 'Nachname eingeben',
    'register.email': 'E-Mail',
    'register.emailPlaceholder': 'E-Mail-Adresse eingeben',
    'register.password': 'Passwort',
    'register.passwordPlaceholder': 'Passwort eingeben (mindestens 8 Zeichen)',
    'register.passwordConfirm': 'Passwort bestätigen',
    'register.passwordConfirmPlaceholder': 'Passwort wiederholen',
    'register.createAccount': 'Konto erstellen',
    'register.creating': 'Konto wird erstellt...',
    'register.alreadyHaveAccount': 'Hast du bereits ein Konto?',
    'register.signIn': 'Anmelden',
    'register.sign_in': 'melde dich bei deinem bestehenden Konto an',
    'register.terms_1': 'Ich stimme den ',
    'register.terms_of_service': 'Nutzungsbedingungen',
    'register.terms_2': 'und der ',
    'register.privacy_policy': 'Datenschutzerklärung',
    'register.terms_3': ' zu',
    'register.or_continue': 'Oder fortfahren mit',
    'register.error': 'Ein Fehler ist bei der Registrierung aufgetreten',
    
    'hero.title': 'Die erste Blockchain-Social-Network Plattform',
    'hero.subtitle': 'Verbinde dich, teile Inhalte und verdiene BSN Token durch deine Aktivität',
    'hero.cta.register': 'Jetzt registrieren',
    'hero.cta.learn-more': 'Mehr erfahren',
    
    'features.title': 'Revolutionary Features',
    'features.subtitle': 'BSN kombiniert das Beste aus sozialen Netzwerken mit Blockchain-Technologie, um eine einzigartige Plattform zu schaffen, auf der deine soziale Aktivität echten Wert hat.',
    'features.token-mining': 'Token Mining',
    'features.token-mining.desc': 'Verdiene BSN-Tokens durch soziale Interaktionen, Content-Erstellung und tägliche Plattformaktivität.',
    'features.social-networking': 'Social Networking',
    'features.social-networking.desc': 'Verbinde dich mit Gleichgesinnten in der Blockchain- und Krypto-Community.',
    'features.decentralized-identity': 'Dezentrale Identität',
    'features.decentralized-identity.desc': 'Besitze deine Daten mit einem blockchain-basierten Identitäts- und Reputationssystem.',
    'features.token-analytics': 'Token Analytics',
    'features.token-analytics.desc': 'Verfolge deine Einnahmen und überwache die Token-Performance mit Echtzeit-Analysen.',
    'features.token-creation': 'Token-Erstellung',
    'features.token-creation.desc': 'Starte deine eigenen benutzerdefinierten Tokens mit unserem benutzerfreundlichen Token-Erstellungsassistenten.',
    'features.secure-wallet': 'Sicheres Wallet',
    'features.secure-wallet.desc': 'Verwalte deine Krypto-Assets mit unserem integrierten sicheren Wallet-System.',
    
    'social.title': 'Soziale Features',
    'social.subtitle': 'Mehr als nur ein Blockchain-Projekt',
    'social.description': 'BSN kombiniert das Beste aus sozialen Netzwerken mit den Vorteilen der Blockchain-Technologie. Baue deine Community auf, belohne aktive Mitglieder und schaffe ein florierendes Ökosystem.',
    'social.tab.community': 'Community',
    'social.tab.engagement': 'Engagement',
    'social.tab.rewards': 'Belohnungen',
    
    'mining.title': 'Proof-of-Activity Mining',
    'mining.subtitle': 'Verdiene Token durch soziale Interaktionen',
    'mining.description': 'Unser einzigartiger Proof-of-Activity Algorithmus belohnt dich für aktive Teilnahme im Netzwerk. Anders als traditionelles Mining brauchst du keine teure Hardware - nur deine Kreativität und Engagement.',
    'mining.dashboard': 'Mining Dashboard',
    'mining.dashboard.desc': 'Analysiere und optimiere deine Mining-Aktivitäten',
    'mining.status.active': 'Aktiv',
    'mining.total': 'BSN Gesamt',
    'mining.today': 'Heute verdient',
    'mining.efficiency': 'Mining Effizienz',
    'mining.performance': 'Aktivitätsperformance',
    'mining.boost': 'Mining-Boost verfügbar!',
    'mining.boost.desc': 'Erhöhe deine Mining-Rate um 25% für die nächsten 24 Stunden',
    'mining.boost.activate': 'Aktivieren',
    'mining.activities': 'Aktuelle Mining-Aktivitäten',
    
    'stats.title': 'Platform Statistiken',
    'stats.subtitle': 'Schließe dich tausenden von Nutzern an, die bereits vom BSN-Blockchain-Social-Network-Ökosystem profitieren',
    'stats.users': 'Benutzer',
    'stats.transactions': 'Transaktionen',
    'stats.tokens-created': 'Erstellte Tokens',
    'stats.daily-mining': 'Tägliches Mining',
    'stats.activity': 'Aktivitätsverteilung',
    'stats.social-posts': 'Social Posts',
    'stats.token-transfers': 'Token Transfers',
    'stats.nft-minting': 'NFT Minting',
    'stats.mining-rewards': 'Mining Rewards',
    
    'token-creation.title': 'Erstelle deinen eigenen Token',
    'token-creation.subtitle': 'In wenigen Schritten zum eigenen BSN-Token',
    'token-creation.cta': 'Token erstellen',
    
    'footer.rights': 'Alle Rechte vorbehalten',
    'footer.privacy': 'Datenschutz',
    'footer.terms': 'AGB',
    'footer.contact': 'Kontakt',
  },
  en: {
    'nav.home': 'Home',
    'nav.features': 'Features',
    'nav.mining': 'Mining',
    'nav.roadmap': 'Roadmap',
    'nav.faq': 'FAQ',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.feed': 'Feed',
    'nav.nft-market': 'NFT Market',
    'nav.wallet': 'Wallet',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.notifications': 'Notifications',
    'nav.logout': 'Logout',
    'nav.my-account': 'My Account',
    
    'login.title': 'Sign in to your account',
    'login.create_account': 'create a new account',
    'login.email': 'Email address',
    'login.password': 'Password',
    'login.remember_me': 'Remember me',
    'login.forgot_password': 'Forgot your password?',
    'login.sign_in': 'Sign in',
    'login.or_continue': 'Or continue with',
    'login.error': 'An error occurred during login',
    
    'register.title': 'Create your account',
    'register.subtitle': 'Create a new BSN account to continue',
    'register.username': 'Username',
    'register.usernamePlaceholder': 'Enter username',
    'register.firstName': 'First Name',
    'register.firstNamePlaceholder': 'Enter first name',
    'register.lastName': 'Last Name',
    'register.lastNamePlaceholder': 'Enter last name',
    'register.email': 'Email',
    'register.emailPlaceholder': 'Enter email address',
    'register.password': 'Password',
    'register.passwordPlaceholder': 'Enter password (minimum 8 characters)',
    'register.passwordConfirm': 'Confirm Password',
    'register.passwordConfirmPlaceholder': 'Repeat password',
    'register.createAccount': 'Create Account',
    'register.creating': 'Creating account...',
    'register.alreadyHaveAccount': 'Already have an account?',
    'register.signIn': 'Sign In',
    'register.sign_in': 'sign in to your existing account',
    'register.terms_1': 'I agree to the ',
    'register.terms_of_service': 'Terms of Service',
    'register.terms_2': 'and ',
    'register.privacy_policy': 'Privacy Policy',
    'register.terms_3': '',
    'register.or_continue': 'Or continue with',
    'register.error': 'An error occurred during registration',
    
    'hero.title': 'The First Blockchain Social Network Platform',
    'hero.subtitle': 'Connect, share content, and earn BSN Tokens through your activity',
    'hero.cta.register': 'Register Now',
    'hero.cta.learn-more': 'Learn More',
    
    'features.title': 'Revolutionary Features',
    'features.subtitle': 'BSN combines the best of social networking with blockchain technology to create a unique platform where your social activity has real value.',
    'features.token-mining': 'Token Mining',
    'features.token-mining.desc': 'Earn BSN tokens through social interactions, content creation, and daily platform activity.',
    'features.social-networking': 'Social Networking',
    'features.social-networking.desc': 'Connect with like-minded individuals in the blockchain and crypto community.',
    'features.decentralized-identity': 'Decentralized Identity',
    'features.decentralized-identity.desc': 'Own your data with blockchain-based identity and reputation system.',
    'features.token-analytics': 'Token Analytics',
    'features.token-analytics.desc': 'Track your earnings and monitor token performance with real-time analytics.',
    'features.token-creation': 'Token Creation',
    'features.token-creation.desc': 'Launch your own custom tokens with our easy-to-use token creation wizard.',
    'features.secure-wallet': 'Secure Wallet',
    'features.secure-wallet.desc': 'Manage your crypto assets with our integrated secure wallet system.',
    
    'social.title': 'Social Features',
    'social.subtitle': 'More than just a Blockchain Project',
    'social.description': 'BSN combines the best of social networks with the advantages of blockchain technology. Build your community, reward active members, and create a thriving ecosystem.',
    'social.tab.community': 'Community',
    'social.tab.engagement': 'Engagement',
    'social.tab.rewards': 'Rewards',
    
    'mining.title': 'Proof-of-Activity Mining',
    'mining.subtitle': 'Earn Tokens Through Social Interactions',
    'mining.description': 'Our unique Proof-of-Activity algorithm rewards you for active participation in the network. Unlike traditional mining, you don\'t need expensive hardware - just your creativity and engagement.',
    'mining.dashboard': 'Mining Dashboard',
    'mining.dashboard.desc': 'Analyze and optimize your mining activities',
    'mining.status.active': 'Active',
    'mining.total': 'Total BSN',
    'mining.today': 'Earned Today',
    'mining.efficiency': 'Mining Efficiency',
    'mining.performance': 'Activity Performance',
    'mining.boost': 'Mining Boost Available!',
    'mining.boost.desc': 'Increase your mining rate by 25% for the next 24 hours',
    'mining.boost.activate': 'Activate',
    'mining.activities': 'Recent Mining Activities',
    
    'stats.title': 'Platform Statistics',
    'stats.subtitle': 'Join thousands of users already benefiting from BSN\'s blockchain social network ecosystem',
    'stats.users': 'Users',
    'stats.transactions': 'Transactions',
    'stats.tokens-created': 'Tokens Created',
    'stats.daily-mining': 'Daily Mining',
    'stats.activity': 'Activity Distribution',
    'stats.social-posts': 'Social Posts',
    'stats.token-transfers': 'Token Transfers',
    'stats.nft-minting': 'NFT Minting',
    'stats.mining-rewards': 'Mining Rewards',
    
    'token-creation.title': 'Create Your Own Token',
    'token-creation.subtitle': 'Create your own BSN token in just a few steps',
    'token-creation.cta': 'Create Token',
    
    'footer.rights': 'All Rights Reserved',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.contact': 'Contact',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getBrowserLanguage = (): Language => {
    const browserLang = navigator.language.split('-')[0];
    return (browserLang === 'de' || browserLang === 'en') ? browserLang as Language : 'en';
  };
  
  const getInitialLanguage = (): Language => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('bsn-language');
      if (savedLang === 'de' || savedLang === 'en') {
        return savedLang as Language;
      }
    }
    return getBrowserLanguage();
  };
  
  const [language, setLanguageState] = useState<Language>(getInitialLanguage());
  
  const t = (key: string): string => {
    return translations[language][key] || key;
  };
  
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bsn-language', lang);
    }
  };
  
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
