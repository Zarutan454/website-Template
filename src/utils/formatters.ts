/**
 * Zentrale Formatierungs-Utilities für das BSN-Projekt
 */

import { formatUnits, parseUnits } from 'viem';

/**
 * Formatiert eine Zahl mit Kommas für Tausender und optionalen Dezimalstellen
 * @param value - Die zu formatierende Zahl
 * @param decimals - Anzahl der Dezimalstellen (Standard: 2)
 * @returns Formatierte Zahl als String
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
 * Formatiert große Zahlen mit Kommas
 * @param num - Die zu formatierende Zahl
 * @returns Formatierte Zahl mit Kommas
 */
export function formatNumberWithCommas(num: number | string): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Formatiert eine Zahl für die Anzeige (z.B. für Likes, Kommentare)
 * @param value - Die zu formatierende Zahl
 * @returns Formatierte Zahl als String (z.B. 1.2k, 3.4M)
 */
export function formatCompactNumber(value: number): string {
  if (value === null || value === undefined) return '0';
  
  if (value === 0) return '0';
  
  if (value < 1000) return value.toString();
  
  if (value < 1000000) {
    return `${(value / 1000).toFixed(1)}k`.replace('.0k', 'k');
  }
  
  return `${(value / 1000000).toFixed(1)}M`.replace('.0M', 'M');
}

/**
 * Formatiert ein Datum in einem lesbaren Format
 * @param date - Das zu formatierende Datum
 * @returns Formatierter Datums-String
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
 * Formatiert ein Datum für die Anzeige (mit Zeitstempel)
 * @param timestamp - Der Zeitstempel in Sekunden
 * @returns Formatierter Datums-String
 */
export function formatDateWithTime(timestamp: number): string {
  return new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(timestamp * 1000));
}

/**
 * Formatiert einen BSN-Token-Betrag mit benutzerdefiniertem Styling
 * @param amount - Der Token-Betrag
 * @returns Formatierter Token-String
 */
export function formatTokenAmount(amount: number): string {
  if (amount === undefined || amount === null) return '0 BSN';
  
  return `${formatNumber(amount)} BSN`;
}

/**
 * Formatiert Token-Beträge basierend auf Dezimalstellen (für Blockchain)
 * @param amount - Der Token-Betrag (bigint, string oder number)
 * @param decimals - Anzahl der Dezimalstellen (Standard: 18)
 * @returns Formatierter Token-String
 */
export function formatTokenAmountWithDecimals(amount: bigint | string | number, decimals = 18): string {
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

/**
 * Kürzt eine Blockchain-Adresse für die Anzeige
 * z.B. 0x1234...5678
 * @param address - Die zu kürzende Adresse
 * @param start - Anzahl der Zeichen am Anfang (Standard: 6)
 * @param end - Anzahl der Zeichen am Ende (Standard: 4)
 * @returns Gekürzte Adresse
 */
export function truncateAddress(address: string, start: number = 6, end: number = 4): string {
  if (!address) return '';
  if (address.length <= start + end) return address;
  
  return `${address.substring(0, start)}...${address.substring(address.length - end)}`;
}

/**
 * Validiert eine Ethereum-Adresse
 * @param address - Die zu validierende Adresse
 * @returns true wenn die Adresse gültig ist
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Fügt ein 0x-Präfix zu einer Adresse hinzu, falls es fehlt
 * @param address - Die Adresse
 * @returns Adresse mit 0x-Präfix
 */
export function addHexPrefix(address: string): string {
  if (!address) return '';
  if (address.startsWith('0x')) return address;
  return `0x${address}`;
}

/**
 * Kürzt einen String mit Ellipsis
 * @param str - Der zu kürzende String
 * @param maxLength - Maximale Länge vor der Kürzung
 * @returns Gekürzter String
 */
export function truncateString(str: string, maxLength: number = 20): string {
  if (!str || str.length <= maxLength) return str;
  
  return `${str.substring(0, maxLength - 3)}...`;
}

/**
 * Kürzt einen String in der Mitte (für Adressen)
 * @param str - Der zu kürzende String
 * @param startChars - Anzahl der Zeichen am Anfang (Standard: 6)
 * @param endChars - Anzahl der Zeichen am Ende (Standard: 4)
 * @returns Gekürzter String
 */
export function truncateStringMiddle(str: string, startChars = 6, endChars = 4): string {
  if (!str) return '';
  if (str.length <= startChars + endChars) return str;
  
  return `${str.substring(0, startChars)}...${str.substring(str.length - endChars)}`;
}

/**
 * Kürzt einen langen Text und fügt Ellipsis hinzu
 * @param text - Der zu kürzende Text
 * @param maxLength - Maximale Länge (Standard: 100)
 * @returns Gekürzter Text mit Ellipsis, wenn nötig
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength).trim();
  return `${truncated}...`;
}

/**
 * Formatiert eine Wallet-Adresse für die Anzeige
 * @param address - Die Wallet-Adresse
 * @param startChars - Anzahl der Zeichen am Anfang (Standard: 6)
 * @param endChars - Anzahl der Zeichen am Ende (Standard: 4)
 * @returns Formatierte Adresse
 */
export function formatAddress(address: string | undefined, startChars = 6, endChars = 4): string {
  if (!address) return '';
  return truncateStringMiddle(address, startChars, endChars);
}

/**
 * Ermittelt die Initialen aus einem Namen
 * @param name - Der vollständige Name
 * @param maxInitials - Maximale Anzahl von Initialen (Standard: 2)
 * @returns Die Initialen als String
 */
export function getInitials(name: string, maxInitials: number = 2): string {
  if (!name) return '?';
  
  const nameParts = name.trim().split(/\s+/);
  
  if (nameParts.length === 1) {
    // Bei einem einzelnen Wort die ersten 2 Buchstaben nehmen
    return name.substring(0, maxInitials).toUpperCase();
  }
  
  // Bei mehreren Wörtern die Initialen der ersten maxInitials Wörter nehmen
  return nameParts
    .slice(0, maxInitials)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
}

/**
 * Formatiert einen Prozentsatz
 * @param value - Der Prozentsatz-Wert (0-100)
 * @returns Formatierter Prozentsatz-String
 */
export function formatPercentage(value: number): string {
  if (value === undefined || value === null) return '0%';
  
  return `${Math.round(value)}%`;
}

/**
 * Formatiert Prozentsatz-Werte mit optionalem Plus-Zeichen
 * @param value - Der Prozentsatz-Wert
 * @param includePlusSign - Ob ein Plus-Zeichen hinzugefügt werden soll
 * @returns Formatierter Prozentsatz-String
 */
export function formatPercentageWithSign(value: number, includePlusSign = false): string {
  const formatted = `${Math.abs(value).toFixed(2)}%`;
  
  if (value > 0 && includePlusSign) {
    return `+${formatted}`;
  } else if (value < 0) {
    return `-${formatted}`;
  }
  
  return formatted;
}

/**
 * Gibt CSS-Klasse basierend auf Wertänderung zurück (positiv/negativ)
 * @param value - Der Wert
 * @returns CSS-Klasse für die Farbe
 */
export function getChangeClass(value: number): string {
  return value >= 0 ? 'text-green-500' : 'text-red-500';
}

/**
 * Formatiert Währungswerte
 * @param value - Der Wert
 * @param currency - Die Währung (Standard: USD)
 * @param minimumFractionDigits - Minimale Dezimalstellen (Standard: 2)
 * @returns Formatierter Währungs-String
 */
export function formatCurrency(value: number, currency = 'USD', minimumFractionDigits = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Formatiert Balance-Werte mit Token-Symbol
 * @param amount - Der Betrag
 * @param symbol - Das Token-Symbol
 * @returns Formatierter Balance-String
 */
export function formatBalance(amount: number | string, symbol: string = ''): string {
  if (typeof amount === 'undefined' || amount === null) return '0';
  
  const formattedAmount = typeof amount === 'number' 
    ? formatNumber(amount)
    : amount;
  
  return symbol ? `${formattedAmount} ${symbol}` : formattedAmount;
}
