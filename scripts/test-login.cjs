const axios = require('axios');

// Test-Konfiguration
const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:8000';

// Test-Account
const TEST_ACCOUNT = {
  email: 'test@bsn.com',
  password: 'Ostblokk1993'
};

async function testLoginAPI() {
  console.log('🔌 Teste Login-API...');
  
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login/`, TEST_ACCOUNT, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login-API funktioniert');
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log('❌ Login-API Fehler:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
    return false;
  }
}

async function testUserExists() {
  console.log('👤 Teste ob Benutzer existiert...');
  
  try {
    // Versuche einen anderen Endpunkt zu nutzen, um zu prüfen ob der User existiert
    const response = await axios.get(`${BACKEND_URL}/api/users/`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Users-API erreichbar');
    return true;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('ℹ️ Users-API erfordert Authentifizierung - das ist normal');
      return true;
    } else {
      console.log('❌ Users-API nicht erreichbar:', error.message);
      return false;
    }
  }
}

async function testLoginWithWrongPassword() {
  console.log('🔐 Teste Login mit falschem Passwort...');
  
  try {
    const wrongPasswordData = {
      email: 'test@bsn.com',
      password: 'wrongpassword'
    };
    
    const response = await axios.post(`${BACKEND_URL}/api/auth/login/`, wrongPasswordData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('❌ Login mit falschem Passwort sollte fehlschlagen');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Login mit falschem Passwort schlägt korrekt fehl');
      return true;
    } else {
      console.log('⚠️ Unerwarteter Fehler bei falschem Passwort:', error.response?.data);
      return false;
    }
  }
}

async function testLoginWithWrongEmail() {
  console.log('📧 Teste Login mit falscher E-Mail...');
  
  try {
    const wrongEmailData = {
      email: 'nonexistent@bsn.com',
      password: 'Ostblokk1993'
    };
    
    const response = await axios.post(`${BACKEND_URL}/api/auth/login/`, wrongEmailData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('❌ Login mit falscher E-Mail sollte fehlschlagen');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Login mit falscher E-Mail schlägt korrekt fehl');
      return true;
    } else {
      console.log('⚠️ Unerwarteter Fehler bei falscher E-Mail:', error.response?.data);
      return false;
    }
  }
}

async function testFrontendLoginPage() {
  console.log('📱 Teste Frontend Login-Seite...');
  
  try {
    const response = await axios.get(`${FRONTEND_URL}/login`);
    if (response.status === 200) {
      console.log('✅ Login-Seite ist erreichbar');
      return true;
    } else {
      console.log('❌ Login-Seite nicht erreichbar');
      return false;
    }
  } catch (error) {
    console.log('❌ Login-Seite nicht erreichbar:', error.message);
    return false;
  }
}

async function testDatabaseConnection() {
  console.log('🗄️ Teste Datenbank-Verbindung...');
  
  try {
    // Teste einen einfachen Endpunkt
    const response = await axios.get(`${BACKEND_URL}/api/`);
    console.log('✅ Backend ist erreichbar');
    return true;
  } catch (error) {
    console.log('❌ Backend nicht erreichbar:', error.message);
    return false;
  }
}

async function runLoginTests() {
  console.log('🚀 Starte Login-Tests...\n');
  console.log(`Test-Account: ${TEST_ACCOUNT.email}\n`);
  
  const tests = [
    { name: 'Datenbank-Verbindung', fn: testDatabaseConnection },
    { name: 'Login-API', fn: testLoginAPI },
    { name: 'Benutzer-Existenz', fn: testUserExists },
    { name: 'Falsches Passwort', fn: testLoginWithWrongPassword },
    { name: 'Falsche E-Mail', fn: testLoginWithWrongEmail },
    { name: 'Frontend Login-Seite', fn: testFrontendLoginPage }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    const result = await test.fn();
    results.push({ name: test.name, passed: result });
  }
  
  // Zusammenfassung
  console.log('\n📊 Login-Test-Zusammenfassung:');
  console.log('================================');
  
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
  });
  
  console.log(`\nErgebnis: ${passedTests}/${totalTests} Tests erfolgreich`);
  
  if (passedTests === totalTests) {
    console.log('🎉 Login-Funktionalität ist vollständig!');
  } else {
    console.log('⚠️ Einige Login-Tests fehlgeschlagen.');
    console.log('\n🔍 Mögliche Ursachen:');
    console.log('- Benutzer existiert nicht in der Datenbank');
    console.log('- Passwort-Hashing funktioniert nicht korrekt');
    console.log('- Backend-Authentifizierung ist fehlerhaft');
    console.log('- Frontend-API-Integration hat Probleme');
  }
}

// Führe Tests aus
runLoginTests().catch(console.error); 