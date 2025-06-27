// Testet die Django-API /api/posts/ und gibt die Ergebnisse aus
// Benötigt: node-fetch (installieren mit: npm install node-fetch@2)

const fetch = require('node-fetch');

const API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000/api';
const EMAIL = process.env.TEST_EMAIL || 'test@example.com';
const PASSWORD = process.env.TEST_PASSWORD || 'testpassword';

async function getToken() {
  const res = await fetch(`${API_URL}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD })
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Login failed: ' + JSON.stringify(data));
  return data.access;
}

async function getPosts(token) {
  const res = await fetch(`${API_URL}/posts/?page=1&page_size=20`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  return { status: res.status, data };
}

(async () => {
  try {
    const token = await getToken();
    console.log('JWT Token:', token);
    const postsRes = await getPosts(token);
    console.log('Status:', postsRes.status);
    console.log('Response:', JSON.stringify(postsRes.data, null, 2));
    if (postsRes.data && postsRes.data.results && postsRes.data.results.length > 0) {
      console.log('Erfolg: Es wurden Posts geladen!');
    } else {
      console.log('Warnung: Keine Posts gefunden!');
    }
  } catch (err) {
    console.error('Fehler beim Testen der API:', err);
  }
})(); 