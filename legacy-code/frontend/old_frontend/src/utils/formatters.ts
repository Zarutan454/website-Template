
/**
 * Formats a number to have commas for thousands and optional decimal places
 * @param value - The number to format
 * @param decimals - Number of decimal places to show (default: 2)
 * @returns Formatted number string
 */
export function formatNumber(value: number, decimals: number = 2): string {
  // Handle undefined or null
  if (value === undefined || value === null) return '0';
  
  // Format with commas and specified decimal places
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Formats a date in a human-readable way
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | number): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'object' ? date : new Date(date);
  return dateObj.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Formats a time duration in HH:MM:SS format
 * @param seconds - The time in seconds
 * @returns Formatted time string
 */
export function formatTime(seconds: number): string {
  if (!seconds) return '00:00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return [hours, minutes, remainingSeconds]
    .map(v => v < 10 ? '0' + v : v)
    .join(':');
}

/**
 * Formats elapsed time in a more readable format (HH:MM:SS)
 * @param seconds - The number of seconds elapsed
 * @returns Formatted elapsed time string
 */
export function formatElapsedTime(seconds: number): string {
  if (!seconds) return '00:00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Formats a time in a relative format (e.g. "3 hours ago")
 * @param date - The date to format
 * @returns Formatted relative time string
 */
export function formatTimeAgo(date: Date | string | number): string {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffMonth / 12);
  
  if (diffSec < 60) {
    return 'gerade eben';
  } else if (diffMin < 60) {
    return `vor ${diffMin} ${diffMin === 1 ? 'Minute' : 'Minuten'}`;
  } else if (diffHour < 24) {
    return `vor ${diffHour} ${diffHour === 1 ? 'Stunde' : 'Stunden'}`;
  } else if (diffDay < 30) {
    return `vor ${diffDay} ${diffDay === 1 ? 'Tag' : 'Tagen'}`;
  } else if (diffMonth < 12) {
    return `vor ${diffMonth} ${diffMonth === 1 ? 'Monat' : 'Monaten'}`;
  } else {
    return `vor ${diffYear} ${diffYear === 1 ? 'Jahr' : 'Jahren'}`;
  }
}

/**
 * Formats a BSN token amount with custom styling
 * @param amount - The token amount
 * @returns Formatted token string
 */
export function formatTokenAmount(amount: number): string {
  if (amount === undefined || amount === null) return '0 BSN';
  
  return `${formatNumber(amount)} BSN`;
}

/**
 * Truncates an Ethereum address
 * @param address - The Ethereum address
 * @returns Truncated address
 */
export function truncateAddress(address: string): string {
  if (!address) return '';
  if (address.length <= 10) return address;
  
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Truncates a string with ellipsis
 * @param str - The string to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated string
 */
export function truncateString(str: string, maxLength: number = 20): string {
  if (!str || str.length <= maxLength) return str;
  
  return `${str.substring(0, maxLength - 3)}...`;
}

/**
 * Formats a percentage
 * @param value - The percentage value (0-100)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number): string {
  if (value === undefined || value === null) return '0%';
  
  return `${Math.round(value)}%`;
}
