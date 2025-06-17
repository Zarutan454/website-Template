
import { formatUnits, parseUnits } from 'viem';

// Function to truncate a string in the middle
export function truncateString(str: string, startChars = 6, endChars = 4): string {
  if (!str) return '';
  if (str.length <= startChars + endChars) return str;
  
  return `${str.substring(0, startChars)}...${str.substring(str.length - endChars)}`;
}

// Format large numbers with commas
export function formatNumberWithCommas(num: number | string): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Format token amounts based on decimals
export function formatTokenAmount(amount: bigint | string | number, decimals = 18): string {
  if (typeof amount === 'undefined' || amount === null) return '0';
  
  try {
    // Convert to string first to handle all possible inputs
    const amountString = amount.toString();
    const formattedAmount = formatUnits(BigInt(amountString), decimals);
    
    // Handle different display formats based on value
    const numericValue = parseFloat(formattedAmount);
    
    if (numericValue === 0) return '0';
    if (numericValue < 0.0001) return '< 0.0001';
    if (numericValue < 1) return numericValue.toFixed(4);
    if (numericValue < 1000) return numericValue.toFixed(2);
    
    // Format with commas for larger numbers
    return formatNumberWithCommas(parseFloat(numericValue.toFixed(2)));
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return '0';
  }
}

// Format wallet address for display
export function formatAddress(address: string | undefined, startChars = 6, endChars = 4): string {
  if (!address) return '';
  return truncateString(address, startChars, endChars);
}

// Format currency values
export function formatCurrency(value: number, currency = 'USD', minimumFractionDigits = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits: 2
  }).format(value);
}

// Format percentage values
export function formatPercentage(value: number, includePlusSign = false): string {
  const formatted = `${Math.abs(value).toFixed(2)}%`;
  
  if (value > 0 && includePlusSign) {
    return `+${formatted}`;
  } else if (value < 0) {
    return `-${formatted}`;
  }
  
  return formatted;
}

// Get CSS class based on value change (positive/negative)
export function getChangeClass(value: number): string {
  return value >= 0 ? 'text-green-500' : 'text-red-500';
}

// Format balance values with the token symbol
export function formatBalance(amount: number | string, symbol: string = ''): string {
  if (typeof amount === 'undefined' || amount === null) return '0';
  
  const formattedAmount = typeof amount === 'number' 
    ? formatNumber(amount)
    : amount;
  
  return symbol ? `${formattedAmount} ${symbol}` : formattedAmount;
}

// Format numbers with localization
export function formatNumber(value: number, maximumFractionDigits: number = 2): string {
  return new Intl.NumberFormat('de-DE', { 
    maximumFractionDigits,
    minimumFractionDigits: 0
  }).format(value);
}

// Format date for display
export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(timestamp * 1000));
}
