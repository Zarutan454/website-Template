
/**
 * Ermittelt die Initialen aus einem Namen
 * @param name Der vollständige Name
 * @param maxInitials Maximale Anzahl von Initialen (Standard: 2)
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
 * Kürzt einen langen Text und fügt Ellipsis hinzu
 * @param text Der zu kürzende Text
 * @param maxLength Maximale Länge (Standard: 100)
 * @returns Gekürzter Text mit Ellipsis, wenn nötig
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength).trim();
  return `${truncated}...`;
}

/**
 * Formatiert eine Zahl (z.B. für Likes, Kommentare) für die Anzeige
 * @param value Die zu formatierende Zahl
 * @returns Formatierte Zahl als String (z.B. 1.2k, 3.4M)
 */
export function formatNumber(value: number): string {
  if (value === null || value === undefined) return '0';
  
  if (value === 0) return '0';
  
  if (value < 1000) return value.toString();
  
  if (value < 1000000) {
    return `${(value / 1000).toFixed(1)}k`.replace('.0k', 'k');
  }
  
  return `${(value / 1000000).toFixed(1)}M`.replace('.0M', 'M');
}
