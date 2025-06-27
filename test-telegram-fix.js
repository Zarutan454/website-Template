// Test script for Telegram URL with double format
console.log('=== Testing Telegram URL with Double Format ===');

function extractTelegramInfo(text) {
  const patterns = [
    // Öffentlicher Kanal: t.me/username/123
    /(?:https?:\/\/)?(?:www\.)?t\.me\/([a-zA-Z0-9_]+)\/(\d+)/i,
    // Öffentlicher Kanal mit doppeltem Format: t.me/username/123/456
    /(?:https?:\/\/)?(?:www\.)?t\.me\/([a-zA-Z0-9_]+)\/(\d+)\/(\d+)/i,
    // Privater Kanal: t.me/c/1234567890/123
    /(?:https?:\/\/)?(?:www\.)?t\.me\/c\/(\d+)\/(\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let videoId;
      let fallbackUrl;
      let title;

      if (match[1] === 'c') {
        // Privater Kanal
        videoId = `${match[1]}_${match[2]}`;
        fallbackUrl = `https://t.me/c/${match[1]}/${match[2]}`;
        title = `Telegram Private Channel - Message ${match[2]}`;
      } else if (match.length === 4) {
        // Öffentlicher Kanal mit doppeltem Format: t.me/username/123/456
        const username = match[1];
        const messageId = match[2];
        const subId = match[3];
        videoId = `${username}_${messageId}_${subId}`;
        fallbackUrl = `https://t.me/${username}/${messageId}/${subId}`;
        title = `Telegram Channel @${username} - Message ${messageId}/${subId}`;
      } else {
        // Öffentlicher Kanal Standard: t.me/username/123
        videoId = `${match[1]}_${match[2]}`;
        fallbackUrl = `https://t.me/${match[1]}/${match[2]}`;
        title = `Telegram Channel @${match[1]} - Message ${match[2]}`;
      }

      return {
        platform: 'telegram',
        videoId,
        embedUrl: fallbackUrl,
        fallbackUrl,
        title
      };
    }
  }

  return null;
}

// Test URLs
const testUrls = [
  'https://t.me/animezaru/31769/33036', // Das Problem-Format
  'https://t.me/durov/123', // Standard-Format
  'https://t.me/c/1234567890/456', // Privater Kanal
  'https://t.me/username/123/456', // Doppeltes Format
  'Keine Telegram URL hier'
];

console.log('Testing Telegram URL extraction:');
console.log('');

testUrls.forEach((url, index) => {
  const videoInfo = extractTelegramInfo(url);
  console.log(`Test ${index + 1}: "${url}"`);
  
  if (videoInfo) {
    console.log(`  ✅ Platform: ${videoInfo.platform}`);
    console.log(`  ✅ Video ID: ${videoInfo.videoId}`);
    console.log(`  ✅ Embed URL: ${videoInfo.embedUrl}`);
    console.log(`  ✅ Fallback URL: ${videoInfo.fallbackUrl}`);
    console.log(`  ✅ Title: ${videoInfo.title}`);
  } else {
    console.log(`  ❌ No Telegram video detected`);
  }
  console.log('');
});

console.log('=== Telegram Fix Test Complete ==='); 