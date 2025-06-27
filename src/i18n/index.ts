import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English translations
const resources = {
  en: {
    translation: {
      // Mining Dashboard
      mining: {
        title: 'Mining Dashboard',
        status: 'Mining Status',
        active: 'Active',
        inactive: 'Inactive',
        analytics: 'Analytics',
        rewards: 'Rewards',
        leaderboard: 'Leaderboard',
        achievements: 'Achievements',
        tips: 'Mining Tips',
        tipsList: [
          'Keep your mining active to earn tokens continuously',
          'Interact with posts to earn additional token bonuses',
          'Maintain a daily streak to increase your efficiency multiplier',
          'Create quality content to get more likes and earn more tokens'
        ],
        overview: {
          status: 'Status',
          active: 'Active',
          inactive: 'Inactive',
          miningRate: 'Mining Rate',
          dailyEarnings: 'Daily Earnings',
          miningStreak: 'Mining Streak',
          days: 'days'
        },
        analyticsTitle: 'Advanced Analytics',
        analyticsDesc: 'Detailed mining analytics are coming soon. Track your mining performance, rewards, and more.',
        rewardsTitle: 'Mining Rewards',
        rewardsDesc: 'Rewards system is being enhanced. Check back soon for more ways to earn BSN tokens.',
        leaderboardTitle: 'Global Leaderboard',
        leaderboardDesc: 'Compete with other miners worldwide. Leaderboard will be available soon.',
        achievementsTitle: 'Mining Achievements',
        achievementsDesc: 'Unlock special achievements and earn bonus tokens. Coming soon.',
        info: 'Earn BSN tokens through your activities in the network. Mining starts automatically when you\'re online.'
      },
      // Token Balance
      token: {
        balance: 'Token Balance',
        available: 'Available',
        locked: 'Locked',
        total: 'Total'
      },
      // General
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      failed: 'Failed',
      try_again: 'Try Again'
    }
  },
  de: {
    translation: {
      mining: {
        title: 'Mining-Dashboard',
        status: 'Mining-Status',
        active: 'Aktiv',
        inactive: 'Inaktiv',
        analytics: 'Analytics',
        rewards: 'Belohnungen',
        leaderboard: 'Bestenliste',
        achievements: 'Erfolge',
        tips: 'Mining-Tipps',
        tipsList: [
          'Halte dein Mining aktiv, um kontinuierlich Token zu verdienen',
          'Interagiere mit Beiträgen, um zusätzliche Token-Boni zu erhalten',
          'Halte eine tägliche Serie aufrecht, um deinen Effizienz-Multiplikator zu erhöhen',
          'Erstelle hochwertige Inhalte, um mehr Likes und mehr Token zu erhalten'
        ],
        overview: {
          status: 'Status',
          active: 'Aktiv',
          inactive: 'Inaktiv',
          miningRate: 'Mining-Rate',
          dailyEarnings: 'Tägliche Einnahmen',
          miningStreak: 'Mining-Serie',
          days: 'Tage'
        },
        analyticsTitle: 'Erweiterte Analytics',
        analyticsDesc: 'Detaillierte Mining-Analysen folgen in Kürze. Verfolge deine Mining-Performance, Belohnungen und mehr.',
        rewardsTitle: 'Mining-Belohnungen',
        rewardsDesc: 'Das Belohnungssystem wird verbessert. Schau bald wieder vorbei, um mehr Möglichkeiten zum Verdienen von BSN-Token zu entdecken.',
        leaderboardTitle: 'Globale Bestenliste',
        leaderboardDesc: 'Tritt gegen andere Miner weltweit an. Die Bestenliste ist bald verfügbar.',
        achievementsTitle: 'Mining-Erfolge',
        achievementsDesc: 'Schalte spezielle Erfolge frei und erhalte Bonus-Token. Bald verfügbar.',
        info: 'Verdiene BSN-Token durch deine Aktivitäten im Netzwerk. Mining startet automatisch, sobald du online bist.'
      },
      loading: 'Lädt...',
      error: 'Fehler',
      success: 'Erfolg',
      failed: 'Fehlgeschlagen',
      try_again: 'Erneut versuchen'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 