const axios = require('axios');

// Test-Konfiguration
const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:8000';

// Test-Funktionen
async function testBackendAPI() {
  console.log('🔌 Teste Backend-API...');
  
  try {
    // Teste Posts-Endpoint (sollte 401 zurückgeben ohne Auth)
    const response = await axios.get(`${BACKEND_URL}/api/posts/`);
    console.log('❌ Backend-API sollte 401 zurückgeben');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Backend-API funktioniert (Authentifizierung erforderlich)');
      return true;
    } else {
      console.log('❌ Backend-API nicht erreichbar:', error.message);
      return false;
    }
  }
}

async function testFrontendAvailability() {
  console.log('📱 Teste Frontend-Verfügbarkeit...');
  
  try {
    const response = await axios.get(FRONTEND_URL);
    if (response.status === 200) {
      console.log('✅ Frontend ist erreichbar');
      return true;
    } else {
      console.log('❌ Frontend nicht erreichbar');
      return false;
    }
  } catch (error) {
    console.log('❌ Frontend nicht erreichbar:', error.message);
    return false;
  }
}

async function testLoginPage() {
  console.log('🔐 Teste Login-Seite...');
  
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

async function testRegisterPage() {
  console.log('📝 Teste Register-Seite...');
  
  try {
    const response = await axios.get(`${FRONTEND_URL}/register`);
    if (response.status === 200) {
      console.log('✅ Register-Seite ist erreichbar');
      return true;
    } else {
      console.log('❌ Register-Seite nicht erreichbar');
      return false;
    }
  } catch (error) {
    console.log('❌ Register-Seite nicht erreichbar:', error.message);
    return false;
  }
}

async function testComponentFiles() {
  console.log('📁 Teste Komponenten-Dateien...');
  
  const fs = require('fs');
  const path = require('path');
  
  const requiredFiles = [
    'src/components/landing/Login3D.tsx',
    'src/components/landing/Register3D.tsx',
    'src/hooks/feed/useLikePost.ts',
    'src/components/Feed/CommentSection.tsx',
    'src/pages/ProfilePage.tsx'
  ];
  
  let allFilesExist = true;
  
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} existiert`);
    } else {
      console.log(`❌ ${file} fehlt`);
      allFilesExist = false;
    }
  }
  
  return allFilesExist;
}

async function testPackageDependencies() {
  console.log('📦 Teste Package-Dependencies...');
  
  try {
    const packageJson = require('../package.json');
    const requiredDeps = [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'framer-motion',
      'tailwindcss'
    ];
    
    let allDepsPresent = true;
    
    for (const dep of requiredDeps) {
      if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
        console.log(`✅ ${dep} ist installiert`);
      } else {
        console.log(`❌ ${dep} fehlt`);
        allDepsPresent = false;
      }
    }
    
    return allDepsPresent;
  } catch (error) {
    console.log('❌ package.json nicht gefunden');
    return false;
  }
}

// Haupttest-Funktion
async function runQuickTests() {
  console.log('🚀 Starte Schnell-Tests...\n');
  
  const tests = [
    { name: 'Backend-API', fn: testBackendAPI },
    { name: 'Frontend-Verfügbarkeit', fn: testFrontendAvailability },
    { name: 'Login-Seite', fn: testLoginPage },
    { name: 'Register-Seite', fn: testRegisterPage },
    { name: 'Komponenten-Dateien', fn: testComponentFiles },
    { name: 'Package-Dependencies', fn: testPackageDependencies }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    const result = await test.fn();
    results.push({ name: test.name, passed: result });
  }
  
  // Zusammenfassung
  console.log('\n📊 Test-Zusammenfassung:');
  console.log('========================');
  
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
  });
  
  console.log(`\nErgebnis: ${passedTests}/${totalTests} Tests erfolgreich`);
  
  if (passedTests === totalTests) {
    console.log('🎉 Alle Tests erfolgreich! Die Anwendung ist bereit.');
  } else {
    console.log('⚠️ Einige Tests fehlgeschlagen. Bitte überprüfen Sie die Konfiguration.');
  }
}

// Führe Tests aus
runQuickTests().catch(console.error); 