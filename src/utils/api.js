// src/utils/api.js
// Zentraler API-Client für alle Backend-Requests (Django)
// Best Practices: fetch, JWT, Error-Handling, automatische Token-Erneuerung

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1/';

// Debug-Logging für Entwicklung
const DEBUG = import.meta.env.DEV;

// Token-Handling (LocalStorage)
function getToken() {
  return localStorage.getItem('access_token');
}

function setToken(token) {
  localStorage.setItem('access_token', token);
}

function removeToken() {
  localStorage.removeItem('access_token');
}

// Zentrale Fetch-Funktion mit Fehlerbehandlung
async function apiFetch(endpoint, { method = 'GET', body, headers = {}, auth = true } = {}) {
  const url = API_BASE_URL + endpoint;
  const fetchHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };
  if (auth) {
    const token = getToken();
    if (token) {
      fetchHeaders['Authorization'] = `Bearer ${token}`;
    }
  }
  const options = {
    method,
    headers: fetchHeaders,
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  if (DEBUG) {
    console.log(`🚀 API Call: ${method} ${url}`, { body, headers: fetchHeaders });
  }
  
  let response;
  try {
    response = await fetch(url, options);
  } catch (err) {
    if (DEBUG) console.error('❌ Network Error:', err);
    throw new Error('Netzwerkfehler: ' + err.message);
  }
  
  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }
  
  if (DEBUG) {
    console.log(`📡 API Response: ${response.status}`, data);
  }
  
  if (!response.ok) {
    // Automatisches Logout bei 401
    if (response.status === 401) {
      removeToken();
    }
    throw new Error(data?.detail || data?.error || 'API-Fehler (' + response.status + ')');
  }
  return data;
}

// Auth-API
export async function login(username, password) {
  const data = await apiFetch('users/login/', {
    method: 'POST',
    body: { username, password },
    auth: false,
  });
  setToken(data.access_token);
  return data;
}

export async function logout() {
  await apiFetch('users/logout/', { method: 'POST' });
  removeToken();
}

export async function register(userData) {
  return apiFetch('users/register/', {
    method: 'POST',
    body: userData,
    auth: false,
  });
}

// Token-Reservierung
export async function createTokenReservation(reservationData) {
  return apiFetch('landing/reservations/', {
    method: 'POST',
    body: reservationData,
  });
}

export async function getTokenReservations() {
  return apiFetch('landing/reservations/');
}

// Faucet
export async function createFaucetRequest(faucetData) {
  return apiFetch('landing/faucet/', {
    method: 'POST',
    body: faucetData,
  });
}

export async function getFaucetRequests() {
  return apiFetch('landing/faucet/');
}

// Referral
export async function getReferralCode() {
  return apiFetch('landing/referral/code/');
}

export async function getReferralProgram() {
  return apiFetch('landing/referral/program/');
}

// Newsletter
export async function subscribeNewsletter(data) {
  return apiFetch('landing/newsletter/subscribe/', {
    method: 'POST',
    body: data,
    auth: false,
  });
}

export async function unsubscribeNewsletter(email) {
  return apiFetch('landing/newsletter/unsubscribe/', {
    method: 'POST',
    body: { email },
    auth: false,
  });
}

// Kontakt
export async function sendContactForm(data) {
  return apiFetch('landing/contact/', {
    method: 'POST',
    body: data,
    auth: false,
  });
}

// ICO Stats
export async function getIcoOverview() {
  return apiFetch('landing/ico/overview/', { auth: false });
}

export async function getIcoStats() {
  return apiFetch('landing/ico/stats/', { auth: false });
}

export async function getTokenInfo() {
  return apiFetch('landing/ico/token-info/', { auth: false });
}

// Token-Handling für andere Komponenten exportieren
export { getToken, setToken, removeToken }; 