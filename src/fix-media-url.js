// EMERGENCY FIX for media_url array issue
// Execute this in browser console before creating a post

// Override the original fetch function to sanitize media_url
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  if (url.includes('/api/posts/') && options && options.method === 'POST') {
    try {
      const body = JSON.parse(options.body);
      
      // Fix media_url if it's an array
      if (body.media_url && Array.isArray(body.media_url)) {
        console.warn('EMERGENCY FIX: Converting media_url array to string:', body.media_url);
        body.media_url = body.media_url[0] || null;
      }
      
      // Update the request body
      options.body = JSON.stringify(body);
      console.log('EMERGENCY FIX: Sanitized post data:', body);
    } catch (e) {
      console.log('EMERGENCY FIX: Could not parse body, skipping sanitization');
    }
  }
  
  return originalFetch.apply(this, arguments);
};

console.log('EMERGENCY FIX: media_url sanitization activated!');
console.log('Now try creating a post with media - the array issue should be fixed.');
