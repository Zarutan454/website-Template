/**
 * Internationalization & Localization Service for BSN Social Network
 * Multi-language support, regional content adaptation, and cultural compliance
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Supported languages
export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', flag: '🇺🇸', direction: 'ltr' },
  de: { name: 'Deutsch', flag: '🇩🇪', direction: 'ltr' },
  es: { name: 'Español', flag: '🇪🇸', direction: 'ltr' },
  fr: { name: 'Français', flag: '🇫🇷', direction: 'ltr' },
  it: { name: 'Italiano', flag: '🇮🇹', direction: 'ltr' },
  pt: { name: 'Português', flag: '🇵🇹', direction: 'ltr' },
  ru: { name: 'Русский', flag: '🇷🇺', direction: 'ltr' },
  zh: { name: '中文', flag: '🇨🇳', direction: 'ltr' },
  ja: { name: '日本語', flag: '🇯🇵', direction: 'ltr' },
  ko: { name: '한국어', flag: '🇰🇷', direction: 'ltr' },
  ar: { name: 'العربية', flag: '🇸🇦', direction: 'rtl' },
  hi: { name: 'हिन्दी', flag: '🇮🇳', direction: 'ltr' },
  tr: { name: 'Türkçe', flag: '🇹🇷', direction: 'ltr' },
  nl: { name: 'Nederlands', flag: '🇳🇱', direction: 'ltr' },
  pl: { name: 'Polski', flag: '🇵🇱', direction: 'ltr' },
  sv: { name: 'Svenska', flag: '🇸🇪', direction: 'ltr' },
};

// Regional settings
export const REGIONAL_SETTINGS = {
  US: {
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    numberFormat: 'en-US',
    timezone: 'America/New_York',
  },
  DE: {
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
    numberFormat: 'de-DE',
    timezone: 'Europe/Berlin',
  },
  ES: {
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    numberFormat: 'es-ES',
    timezone: 'Europe/Madrid',
  },
  FR: {
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    numberFormat: 'fr-FR',
    timezone: 'Europe/Paris',
  },
  IT: {
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    numberFormat: 'it-IT',
    timezone: 'Europe/Rome',
  },
  PT: {
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    numberFormat: 'pt-PT',
    timezone: 'Europe/Lisbon',
  },
  RU: {
    currency: 'RUB',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
    numberFormat: 'ru-RU',
    timezone: 'Europe/Moscow',
  },
  CN: {
    currency: 'CNY',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    numberFormat: 'zh-CN',
    timezone: 'Asia/Shanghai',
  },
  JP: {
    currency: 'JPY',
    dateFormat: 'YYYY/MM/DD',
    timeFormat: '24h',
    numberFormat: 'ja-JP',
    timezone: 'Asia/Tokyo',
  },
  KR: {
    currency: 'KRW',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    numberFormat: 'ko-KR',
    timezone: 'Asia/Seoul',
  },
  SA: {
    currency: 'SAR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    numberFormat: 'ar-SA',
    timezone: 'Asia/Riyadh',
  },
  IN: {
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    numberFormat: 'hi-IN',
    timezone: 'Asia/Kolkata',
  },
  TR: {
    currency: 'TRY',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
    numberFormat: 'tr-TR',
    timezone: 'Europe/Istanbul',
  },
  NL: {
    currency: 'EUR',
    dateFormat: 'DD-MM-YYYY',
    timeFormat: '24h',
    numberFormat: 'nl-NL',
    timezone: 'Europe/Amsterdam',
  },
  PL: {
    currency: 'PLN',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
    numberFormat: 'pl-PL',
    timezone: 'Europe/Warsaw',
  },
  SE: {
    currency: 'SEK',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    numberFormat: 'sv-SE',
    timezone: 'Europe/Stockholm',
  },
};

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      home: 'Home',
      feed: 'Feed',
      profile: 'Profile',
      wallet: 'Wallet',
      mining: 'Mining',
      notifications: 'Notifications',
      settings: 'Settings',
      
      // Authentication
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      username: 'Username',
      forgotPassword: 'Forgot Password?',
      
      // Social Features
      post: 'Post',
      comment: 'Comment',
      like: 'Like',
      share: 'Share',
      follow: 'Follow',
      unfollow: 'Unfollow',
      friends: 'Friends',
      followers: 'Followers',
      following: 'Following',
      
      // Blockchain Features
      tokens: 'Tokens',
      nfts: 'NFTs',
      mining: 'Mining',
      staking: 'Staking',
      governance: 'Governance',
      transactions: 'Transactions',
      wallet: 'Wallet',
      connect: 'Connect Wallet',
      
      // Content
      createPost: 'Create Post',
      whatOnYourMind: 'What\'s on your mind?',
      addPhoto: 'Add Photo',
      addVideo: 'Add Video',
      hashtags: 'Hashtags',
      location: 'Location',
      
      // Notifications
      newFollower: 'New Follower',
      newLike: 'New Like',
      newComment: 'New Comment',
      newMention: 'New Mention',
      miningReward: 'Mining Reward',
      
      // Settings
      language: 'Language',
      region: 'Region',
      privacy: 'Privacy',
      security: 'Security',
      notifications: 'Notifications',
      theme: 'Theme',
      
      // Common
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
    },
  },
  de: {
    translation: {
      home: 'Startseite',
      feed: 'Feed',
      profile: 'Profil',
      wallet: 'Wallet',
      mining: 'Mining',
      notifications: 'Benachrichtigungen',
      settings: 'Einstellungen',
      
      login: 'Anmelden',
      register: 'Registrieren',
      logout: 'Abmelden',
      email: 'E-Mail',
      password: 'Passwort',
      username: 'Benutzername',
      forgotPassword: 'Passwort vergessen?',
      
      post: 'Beitrag',
      comment: 'Kommentar',
      like: 'Gefällt mir',
      share: 'Teilen',
      follow: 'Folgen',
      unfollow: 'Nicht mehr folgen',
      friends: 'Freunde',
      followers: 'Follower',
      following: 'Folgt',
      
      tokens: 'Tokens',
      nfts: 'NFTs',
      mining: 'Mining',
      staking: 'Staking',
      governance: 'Governance',
      transactions: 'Transaktionen',
      wallet: 'Wallet',
      connect: 'Wallet verbinden',
      
      createPost: 'Beitrag erstellen',
      whatOnYourMind: 'Was denkst du?',
      addPhoto: 'Foto hinzufügen',
      addVideo: 'Video hinzufügen',
      hashtags: 'Hashtags',
      location: 'Standort',
      
      newFollower: 'Neuer Follower',
      newLike: 'Neuer Like',
      newComment: 'Neuer Kommentar',
      newMention: 'Neue Erwähnung',
      miningReward: 'Mining Belohnung',
      
      language: 'Sprache',
      region: 'Region',
      privacy: 'Datenschutz',
      security: 'Sicherheit',
      notifications: 'Benachrichtigungen',
      theme: 'Design',
      
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      search: 'Suchen',
      loading: 'Lädt...',
      error: 'Fehler',
      success: 'Erfolg',
    },
  },
  es: {
    translation: {
      home: 'Inicio',
      feed: 'Feed',
      profile: 'Perfil',
      wallet: 'Billetera',
      mining: 'Minería',
      notifications: 'Notificaciones',
      settings: 'Configuración',
      
      login: 'Iniciar sesión',
      register: 'Registrarse',
      logout: 'Cerrar sesión',
      email: 'Correo electrónico',
      password: 'Contraseña',
      username: 'Nombre de usuario',
      forgotPassword: '¿Olvidaste tu contraseña?',
      
      post: 'Publicar',
      comment: 'Comentar',
      like: 'Me gusta',
      share: 'Compartir',
      follow: 'Seguir',
      unfollow: 'Dejar de seguir',
      friends: 'Amigos',
      followers: 'Seguidores',
      following: 'Siguiendo',
      
      tokens: 'Tokens',
      nfts: 'NFTs',
      mining: 'Minería',
      staking: 'Staking',
      governance: 'Gobernanza',
      transactions: 'Transacciones',
      wallet: 'Billetera',
      connect: 'Conectar billetera',
      
      createPost: 'Crear publicación',
      whatOnYourMind: '¿Qué tienes en mente?',
      addPhoto: 'Agregar foto',
      addVideo: 'Agregar video',
      hashtags: 'Hashtags',
      location: 'Ubicación',
      
      newFollower: 'Nuevo seguidor',
      newLike: 'Nuevo me gusta',
      newComment: 'Nuevo comentario',
      newMention: 'Nueva mención',
      miningReward: 'Recompensa de minería',
      
      language: 'Idioma',
      region: 'Región',
      privacy: 'Privacidad',
      security: 'Seguridad',
      notifications: 'Notificaciones',
      theme: 'Tema',
      
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      search: 'Buscar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
    },
  },
  // Add more languages as needed...
};

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
          debug: import.meta.env.DEV,
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

/**
 * Internationalization Service for BSN Social Network
 */
export class InternationalizationService {
  private static currentLanguage: string = 'en';
  private static currentRegion: string = 'US';

  /**
   * Initialize internationalization
   */
  static async initialize() {
    // Detect user's preferred language
    const userLanguage = this.detectUserLanguage();
    await this.setLanguage(userLanguage);
    
    // Detect user's region
    const userRegion = this.detectUserRegion();
    this.setRegion(userRegion);
    
    console.log(`i18n initialized: ${this.currentLanguage}, region: ${this.currentRegion}`);
  }

  /**
   * Detect user's preferred language
   */
  private static detectUserLanguage(): string {
    // Check localStorage first
    const storedLanguage = localStorage.getItem('bsn_language');
    if (storedLanguage && SUPPORTED_LANGUAGES[storedLanguage as keyof typeof SUPPORTED_LANGUAGES]) {
      return storedLanguage;
    }
    
    // Check browser language
    const browserLanguage = navigator.language.split('-')[0];
    if (SUPPORTED_LANGUAGES[browserLanguage as keyof typeof SUPPORTED_LANGUAGES]) {
      return browserLanguage;
    }
    
    // Default to English
    return 'en';
  }

  /**
   * Detect user's region
   */
  private static detectUserRegion(): string {
    // Check localStorage first
    const storedRegion = localStorage.getItem('bsn_region');
    if (storedRegion && REGIONAL_SETTINGS[storedRegion as keyof typeof REGIONAL_SETTINGS]) {
      return storedRegion;
    }
    
    // Try to detect from timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    for (const [region, settings] of Object.entries(REGIONAL_SETTINGS)) {
      if (settings.timezone === timezone) {
        return region;
      }
    }
    
    // Default to US
    return 'US';
  }

  /**
   * Set language
   */
  static async setLanguage(language: string) {
    if (!SUPPORTED_LANGUAGES[language as keyof typeof SUPPORTED_LANGUAGES]) {
      console.warn(`Unsupported language: ${language}`);
      return;
    }
    
    this.currentLanguage = language;
    localStorage.setItem('bsn_language', language);
    await i18n.changeLanguage(language);
    
    // Update document direction for RTL languages
    const direction = SUPPORTED_LANGUAGES[language as keyof typeof SUPPORTED_LANGUAGES].direction;
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }

  /**
   * Set region
   */
  static setRegion(region: string) {
    if (!REGIONAL_SETTINGS[region as keyof typeof REGIONAL_SETTINGS]) {
      console.warn(`Unsupported region: ${region}`);
      return;
    }
    
    this.currentRegion = region;
    localStorage.setItem('bsn_region', region);
  }

  /**
   * Get current language
   */
  static getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  /**
   * Get current region
   */
  static getCurrentRegion(): string {
    return this.currentRegion;
  }

  /**
   * Get regional settings
   */
  static getRegionalSettings() {
    return REGIONAL_SETTINGS[this.currentRegion as keyof typeof REGIONAL_SETTINGS];
  }

  /**
   * Format currency based on region
   */
  static formatCurrency(amount: number, currency?: string): string {
    const settings = this.getRegionalSettings();
    const currencyCode = currency || settings.currency;
    
    return new Intl.NumberFormat(settings.numberFormat, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  }

  /**
   * Format date based on region
   */
  static formatDate(date: Date, format?: string): string {
    const settings = this.getRegionalSettings();
    const dateFormat = format || settings.dateFormat;
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    
    return new Intl.DateTimeFormat(settings.numberFormat, options).format(date);
  }

  /**
   * Format time based on region
   */
  static formatTime(date: Date, format?: string): string {
    const settings = this.getRegionalSettings();
    const timeFormat = format || settings.timeFormat;
    
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: timeFormat === '12h',
    };
    
    return new Intl.DateTimeFormat(settings.numberFormat, options).format(date);
  }

  /**
   * Format number based on region
   */
  static formatNumber(number: number): string {
    const settings = this.getRegionalSettings();
    return new Intl.NumberFormat(settings.numberFormat).format(number);
  }

  /**
   * Get supported languages
   */
  static getSupportedLanguages() {
    return SUPPORTED_LANGUAGES;
  }

  /**
   * Get supported regions
   */
  static getSupportedRegions() {
    return REGIONAL_SETTINGS;
  }

  /**
   * Translate text
   */
  static t(key: string, options?: any): string {
    return i18n.t(key, options);
  }

  /**
   * Check if current language is RTL
   */
  static isRTL(): boolean {
    const language = this.getCurrentLanguage();
    return SUPPORTED_LANGUAGES[language as keyof typeof SUPPORTED_LANGUAGES]?.direction === 'rtl';
  }

  /**
   * Adapt content for regional preferences
   */
  static adaptContent(content: string, targetRegion?: string): string {
    const region = targetRegion || this.currentRegion;
    const settings = REGIONAL_SETTINGS[region as keyof typeof REGIONAL_SETTINGS];
    
    // Apply regional content adaptations
    let adaptedContent = content;
    
    // Currency conversion (simplified)
    if (settings.currency !== 'USD') {
      // In production, use real exchange rates
      adaptedContent = adaptedContent.replace(/\$(\d+)/g, `${settings.currency}$1`);
    }
    
    // Date format adaptation
    adaptedContent = adaptedContent.replace(
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/g,
      (match, month, day, year) => {
        if (settings.dateFormat === 'DD.MM.YYYY') {
          return `${day}.${month}.${year}`;
        } else if (settings.dateFormat === 'YYYY-MM-DD') {
          return `${year}-${month}-${day}`;
        }
        return match;
      }
    );
    
    return adaptedContent;
  }

  /**
   * Filter content based on cultural preferences
   */
  static filterContent(content: string, region?: string): string {
    const targetRegion = region || this.currentRegion;
    
    // Cultural content filtering (simplified)
    const culturalFilters: Record<string, string[]> = {
      SA: ['alcohol', 'pork', 'gambling'], // Saudi Arabia
      IN: ['beef'], // India
      CN: ['tibet', 'taiwan'], // China
      // Add more cultural filters as needed
    };
    
    const filters = culturalFilters[targetRegion] || [];
    let filteredContent = content;
    
    for (const filter of filters) {
      const regex = new RegExp(filter, 'gi');
      filteredContent = filteredContent.replace(regex, '[filtered]');
    }
    
    return filteredContent;
  }
}

export default i18n; 