/**
 * Formats a date into a human-readable "time ago" string (e.g., "5 minutes ago")
 */
export function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  // Define time intervals
  const intervals = {
    jahr: 31536000,
    monat: 2592000,
    woche: 604800,
    tag: 86400,
    stunde: 3600,
    minute: 60,
    sekunde: 1
  };
  
  // Handle future dates
  if (seconds < 0) {
    return 'in der Zukunft';
  }
  
  // Calculate the appropriate time interval
  let counter;
  let interval: keyof typeof intervals;
  
  for (interval in intervals) {
    counter = Math.floor(seconds / intervals[interval]);
    if (counter > 0) {
      if (counter === 1) {
        // Singular forms for German
        switch (interval) {
          case 'jahr': return 'vor einem Jahr';
          case 'monat': return 'vor einem Monat';
          case 'woche': return 'vor einer Woche';
          case 'tag': return 'vor einem Tag';
          case 'stunde': return 'vor einer Stunde';
          case 'minute': return 'vor einer Minute';
          case 'sekunde': return 'vor einer Sekunde';
        }
      } else {
        // Plural forms for German, with proper pluralization
        switch (interval) {
          case 'jahr': return `vor ${counter} Jahren`;
          case 'monat': return `vor ${counter} Monaten`;
          case 'woche': return `vor ${counter} Wochen`;
          case 'tag': return `vor ${counter} Tagen`;
          case 'stunde': return `vor ${counter} Stunden`;
          case 'minute': return `vor ${counter} Minuten`;
          case 'sekunde': return `vor ${counter} Sekunden`;
        }
      }
    }
  }
  
  return 'gerade eben';
}

/**
 * Formats a date as a localized string for German locale
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Convert ISO date string to a Date object, safely handling invalid dates
 */
export function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Formats a timestamp string into a relative time display
 * Similar to timeAgo but accepts string input
 */
export function formatRelativeTime(timestamp: string | Date): string {
  if (!timestamp) return 'Unbekannt';
  
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  
  if (isNaN(date.getTime())) {
    return 'Ungültiges Datum';
  }
  
  return timeAgo(date);
}
