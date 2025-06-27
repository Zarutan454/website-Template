// Debug script to test feed data loading
console.log('=== BSN Feed Debug ===');

// Check if we're in the browser
if (typeof window !== 'undefined') {
  // Check authentication tokens
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  const user = localStorage.getItem('user');
  
  console.log('Auth Status:');
  console.log(`- Access Token: ${accessToken ? 'EXISTS' : 'MISSING'}`);
  console.log(`- Refresh Token: ${refreshToken ? 'EXISTS' : 'MISSING'}`);
  console.log(`- User Data: ${user ? 'EXISTS' : 'MISSING'}`);
  
  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log(`- User: ${userData.username} (ID: ${userData.id})`);
    } catch (e) {
      console.log('- Error parsing user data:', e.message);
    }
  }
  
  // Test API connectivity
  if (accessToken) {
    console.log('\nTesting API connectivity...');
    
    // Test posts endpoint
    fetch('http://localhost:8000/api/posts/', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      console.log(`Posts API Response: ${response.status} ${response.statusText}`);
      return response.json();
    })
    .then(data => {
      console.log(`Posts loaded: ${data.results ? data.results.length : 0}`);
      if (data.results && data.results.length > 0) {
        console.log('First post:', data.results[0]);
      }
    })
    .catch(error => {
      console.error('Posts API Error:', error);
    });
    
    // Test profile endpoint
    fetch('http://localhost:8000/api/users/profile/', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      console.log(`Profile API Response: ${response.status} ${response.statusText}`);
      return response.json();
    })
    .then(data => {
      console.log('Profile data:', data);
    })
    .catch(error => {
      console.error('Profile API Error:', error);
    });
  } else {
    console.log('\nNo access token found - user not authenticated');
  }
} 