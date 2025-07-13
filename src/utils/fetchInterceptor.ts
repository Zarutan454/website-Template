// Global Fetch Interceptor to fix media_url array issues
// This ensures that media_url is never sent as an array to the API

const originalFetch = window.fetch;

// Override fetch to intercept and fix media_url arrays
window.fetch = function(url: string, options?: RequestInit) {
  // Only intercept POST requests to posts endpoint
  if (url.includes('/api/posts/') && options?.method === 'POST' && options?.body) {
    try {
      // Parse the request body
      const body = JSON.parse(options.body as string);
      
      // Fix media_url if it's an array
      if (body.media_url && Array.isArray(body.media_url)) {
        console.warn('🚨 GLOBAL FIX: Intercepted media_url array, converting to string:', body.media_url);
        body.media_url = body.media_url[0] || null;
        console.log('✅ GLOBAL FIX: Fixed media_url:', body.media_url);
      }
      
      // Update the request body with fixed data
      options.body = JSON.stringify(body);
      console.log('✅ GLOBAL FIX: Request body sanitized:', body);
      
    } catch (error) {
      console.log('⚠️ GLOBAL FIX: Could not parse request body, skipping sanitization');
    }
  }
  
  // Call the original fetch
  return originalFetch.apply(this, [url, options]);
};

console.log('✅ GLOBAL FIX: Fetch interceptor activated - media_url arrays will be automatically fixed!'); 
