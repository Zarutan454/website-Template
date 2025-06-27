// EMERGENCY FIX for media_url array issue
// Copy and paste this into your browser console before creating a post

console.log('🔧 APPLYING EMERGENCY FIX for media_url array issue...');

// Override the original fetch function to sanitize media_url
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  if (url.includes('/api/posts/') && options && options.method === 'POST') {
    try {
      const body = JSON.parse(options.body);
      
      // Fix media_url if it's an array
      if (body.media_url && Array.isArray(body.media_url)) {
        console.warn('🚨 EMERGENCY FIX: Converting media_url array to string:', body.media_url);
        body.media_url = body.media_url[0] || null;
        console.log('✅ EMERGENCY FIX: Fixed media_url:', body.media_url);
      }
      
      // Update the request body
      options.body = JSON.stringify(body);
      console.log('📤 EMERGENCY FIX: Sanitized post data:', body);
    } catch (e) {
      console.log('⚠️ EMERGENCY FIX: Could not parse body, skipping sanitization');
    }
  }
  
  return originalFetch.apply(this, arguments);
};

// Also override localStorage to auto-login
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUwNjM0MDExLCJpYXQiOjE3NTA2MzA0MTEsImp0aSI6ImM0YjA4YzhmMWM5ZjQ4MmY4MmU0ZjU0MWM1ZGQ0NTU4IiwidXNlcl9pZCI6NX0.Hl8E6YWbmYaTJeIGcQi6Ud8_LFRUSYBl2RzqRBAheGc';
localStorage.setItem('access_token', testToken);

console.log('✅ EMERGENCY FIX: Applied successfully!');
console.log('✅ EMERGENCY FIX: Auto-login token set!');
console.log('🎉 Now try creating a post with media - the array issue should be fixed!');
console.log('');
console.log('If you still see errors, check the network tab for the exact request being sent.'); 