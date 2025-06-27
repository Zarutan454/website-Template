// Test script to check comments API
async function testCommentsAPI() {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    console.error('No access token found. Please login first.');
    return;
  }
  
  try {
    console.log('🔍 Testing comments API for post 16...');
    
    const response = await fetch('http://127.0.0.1:8000/api/comments/?post=16', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API Response:', data);
    console.log('✅ Comments count:', data.results?.length || 0);
    
    if (data.results && data.results.length > 0) {
      console.log('✅ Comments found:');
      data.results.forEach((comment, index) => {
        console.log(`  ${index + 1}. ID: ${comment.id}, Content: "${comment.content}", Author: ${comment.author?.username}`);
      });
    } else {
      console.log('❌ No comments found in results');
    }
    
  } catch (error) {
    console.error('❌ Fetch error:', error);
  }
}

// Run the test
testCommentsAPI(); 