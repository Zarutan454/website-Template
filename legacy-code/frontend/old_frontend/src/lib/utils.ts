import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a token amount with appropriate localization and abbreviation
 * @param amount The amount to format
 * @param maxDecimals Maximum number of decimals to show
 * @param abbreviate Whether to abbreviate large numbers (K, M, B)
 * @returns Formatted string
 */
export function formatTokenAmount(
  amount: number | string, 
  maxDecimals: number = 4,
  abbreviate: boolean = false
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '0';
  }
  
  // For very small numbers, show scientific notation
  if (numAmount > 0 && numAmount < 0.0001) {
    return numAmount.toExponential(2);
  }
  
  // Abbreviate large numbers
  if (abbreviate) {
    if (numAmount >= 1_000_000_000) {
      return (numAmount / 1_000_000_000).toFixed(1) + 'B';
    }
    if (numAmount >= 1_000_000) {
      return (numAmount / 1_000_000).toFixed(1) + 'M';
    }
    if (numAmount >= 1_000) {
      return (numAmount / 1_000).toFixed(1) + 'K';
    }
  }
  
  // For normal numbers, use localized formatting with appropriate decimal places
  const formatter = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: maxDecimals,
    minimumFractionDigits: 0,
  });
  
  return formatter.format(numAmount);
}

export function formatNumber(value: number, maximumFractionDigits: number = 2): string {
  return new Intl.NumberFormat('de-DE', { 
    maximumFractionDigits
  }).format(value);
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [];
  
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  
  if (minutes > 0 || hours > 0) {
    parts.push(`${minutes.toString().padStart(2, '0')}m`);
  }
  
  parts.push(`${remainingSeconds.toString().padStart(2, '0')}s`);
  
  return parts.join(' ');
}

export function formatDateForDatabase(date: Date): string {
  return date.toISOString();
}

export function isActivityLimitReached(
  activityType: string,
  activityCount: number,
  limit: number
): boolean {
  return activityCount >= limit;
}

export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
