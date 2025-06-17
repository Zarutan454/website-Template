
/**
 * Formatiert ein Datum in ein lesbares "Zeit vergangen" Format
 * z.B. "vor 5 Minuten", "vor 2 Stunden", "vor 3 Tagen"
 */
export function timeAgo(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
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
 * Exportiere timeAgo auch als formatTimeAgo, um Kompatibilität mit bestehenden Imports zu gewährleisten.
 * Dies ist ein Alias für die timeAgo-Funktion.
 */
export const formatTimeAgo = timeAgo;
