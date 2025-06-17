
/**
 * Generiert eine konsistente Farbe basierend auf einem String-Input
 * Nützlich für Profilbilder oder Avatare
 */
export function getRandomColor(input: string): string {
  // Generiere einen Hashwert für den Input
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Wähle aus einer vordefinierten Liste von Farben
  const colors = [
    '#F87171', // rot
    '#FB923C', // orange
    '#FBBF24', // gelb
    '#34D399', // grün
    '#60A5FA', // blau
    '#A78BFA', // lila
    '#F472B6', // rosa
  ];
  
  // Wähle Farbe basierend auf Hash
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

/**
 * Generiert eine zufällige Farbe mit angepasster Helligkeit
 */
export function generateRandomColor(brightness: 'light' | 'dark' | 'medium' = 'medium'): string {
  let r, g, b;
  
  // Helligkeit anpassen
  if (brightness === 'light') {
    r = Math.floor(Math.random() * 55) + 200; // 200-255
    g = Math.floor(Math.random() * 55) + 200; // 200-255
    b = Math.floor(Math.random() * 55) + 200; // 200-255
  } else if (brightness === 'dark') {
    r = Math.floor(Math.random() * 55); // 0-55
    g = Math.floor(Math.random() * 55); // 0-55
    b = Math.floor(Math.random() * 55); // 0-55
  } else {
    r = Math.floor(Math.random() * 155) + 50; // 50-205
    g = Math.floor(Math.random() * 155) + 50; // 50-205
    b = Math.floor(Math.random() * 155) + 50; // 50-205
  }
  
  return `rgb(${r}, ${g}, ${b})`;
}
