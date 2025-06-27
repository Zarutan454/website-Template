/**
 * Zentrale Zeit- und Datums-Utilities für das BSN-Projekt
 * Konsolidiert alle Zeit-bezogenen Funktionen aus verschiedenen Dateien
 */

/**
 * Formatiert ein Datum in ein lesbares "Zeit vergangen" Format
 * z.B. "vor 5 Minuten", "vor 2 Stunden", "vor 3 Tagen"
 */
export function timeAgo(dateInput: string | Date | number): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : 
               typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Fehlerhafte Daten behandeln
  if (isNaN(seconds) || seconds < 0) {
    return 'gerade eben';
  }
  
  // Zeitintervalle in Sekunden
  const intervals = {
    Jahr: 31536000,
    Monat: 2592000,
    Woche: 604800,
    Tag: 86400,
    Stunde: 3600,
    Minute: 60,
    Sekunde: 1
  };
  
  // Passenden Zeitraum finden
  let counter;
  let interval: keyof typeof intervals;
  
  for (interval in intervals) {
    counter = Math.floor(seconds / intervals[interval]);
    if (counter > 0) {
      if (counter === 1) {
        // Singular: "vor 1 Tag"
        return `vor 1 ${interval}`;
      } else {
        // Plural: "vor X Tagen"
        // Spezialfall für "Monat"
        if (interval === 'Monat') {
          return `vor ${counter} Monaten`;
        }
        // Für alle anderen Zeiträume
        return `vor ${counter} ${interval}en`;
      }
    }
  }
  
  return 'gerade eben';
}

/**
 * Alias für timeAgo - Kompatibilität mit bestehenden Imports
 */
export const formatTimeAgo = timeAgo;

/**
 * Formatiert ein Datum als lokalisierte Zeichenkette für deutsche Locale
 */
export function formatDate(date: Date | string | number): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'object' ? date : new Date(date);
  return dateObj.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formatiert ein Datum in kurzer Form
 */
export function formatShortDate(date: Date | string | number): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'object' ? date : new Date(date);
  return dateObj.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Konvertiert ISO-Datums-String zu einem Date-Objekt, behandelt ungültige Daten sicher
 */
export function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Formatiert einen Timestamp-String in eine relative Zeit-Anzeige
 * Ähnlich wie timeAgo, aber akzeptiert String-Input
 */
export function formatRelativeTime(timestamp: string | Date): string {
  if (!timestamp) return 'Unbekannt';
  
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  
  if (isNaN(date.getTime())) {
    return 'Ungültiges Datum';
  }
  
  return timeAgo(date);
}

/**
 * Formatiert eine verstrichene Zeit in Sekunden in einen lesbaren String
 * @param seconds Anzahl der verstrichenen Sekunden
 * @returns Formatierter String (z.B., "5m 30s")
 */
export function formatTimeElapsed(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours < 24) {
    return `${hours}h ${remainingMinutes}m`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return `${days}d ${remainingHours}h`;
}

/**
 * Formatiert eine Dauer in Sekunden in einen lesbaren String
 * mit entsprechenden Zeiteinheiten (Sekunden, Minuten, Stunden, Tage)
 */
export function formatDuration(seconds: number): string {
  return formatTimeElapsed(seconds);
}

/**
 * Berechnet die Zeitdifferenz zwischen der aktuellen Zeit und einem gegebenen Datum
 * @param date Das Datum, von dem die Zeitdifferenz berechnet werden soll
 * @returns Anzahl der Sekunden, die seit dem gegebenen Datum verstrichen sind
 */
export function getTimeElapsedInSeconds(date: Date): number {
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / 1000);
}

/**
 * Formatiert eine Zeitdauer im HH:MM:SS Format
 * @param seconds Die Zeit in Sekunden
 * @returns Formatierter Zeit-String
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
 * Formatiert verstrichene Zeit in einem lesbareren Format (HH:MM:SS)
 * @param seconds Die Anzahl der verstrichenen Sekunden
 * @returns Formatierte verstrichene Zeit
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
 * Prüft, ob ein Datum heute ist
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

/**
 * Prüft, ob ein Datum gestern war
 */
export function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getDate() === yesterday.getDate() &&
         date.getMonth() === yesterday.getMonth() &&
         date.getFullYear() === yesterday.getFullYear();
}

/**
 * Formatiert ein Datum für die Anzeige (heute/gestern oder Datum)
 */
export function formatDisplayDate(date: Date | string | number): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'object' ? date : new Date(date);
  
  if (isToday(dateObj)) {
    return 'Heute';
  } else if (isYesterday(dateObj)) {
    return 'Gestern';
  } else {
    return formatShortDate(dateObj);
  }
}
