export interface NotificationSettings {
  email: {
    transactions: boolean;
    price_alerts: boolean;
    security: boolean;
  };
  push: {
    transactions: boolean;
    price_alerts: boolean;
    security: boolean;
  };
}

export interface CookiePreferences {
  essential: boolean;
  marketing: boolean;
  analytical: boolean;
  updated_at: string | null;
}

export interface Profile {
  id: string;
  username?: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  wallet_address?: string;
  bio?: string;
  location?: string;
  phone?: string;
  timezone?: string;
  preferred_currency?: string;
  preferred_networks?: string[];
  notification_settings?: NotificationSettings;
  cookie_preferences?: CookiePreferences;
  social_links?: {
    twitter?: string;
    telegram?: string;
    discord?: string;
  };
  profile_completion_percentage?: number;
  updated_at?: string;
  last_sign_in?: string;
  following?: string[];
  display_name?: string;
}

export interface TokenMetrics {
  price_usd: number;
  volume_24h: number;
  market_cap: number;
  holder_count: number;
}

export interface TokenMetricsCardsProps {
  token: {
    token_metrics?: TokenMetrics;
  };
}

export interface LayoutProps {
  children: React.ReactNode;
}

export interface DashboardStats {
  title: string;
  value: string;
  change: number;
  icon: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor?: string;
    tension: number;
  }[];
}
