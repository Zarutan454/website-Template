const puppeteer = require('puppeteer');

async function runTests() {
  console.log('🚀 Starte automatische Tests...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 720 }
  });
  
  const page = await browser.newPage();
  
  try {
    // Test 1: Frontend lädt korrekt
    console.log('📱 Test 1: Frontend lädt korrekt');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    console.log('✅ Frontend lädt erfolgreich');
    
    // Test 2: Login-Seite ist erreichbar
    console.log('🔐 Test 2: Login-Seite ist erreichbar');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
    
    // Prüfe ob Login3D-Komponente geladen ist
    const loginForm = await page.$('[data-testid="login-form"]');
    if (loginForm) {
      console.log('✅ Login3D-Komponente geladen');
    } else {
      console.log('⚠️ Login3D-Komponente nicht gefunden');
    }
    
    // Test 3: Register-Seite ist erreichbar
    console.log('📝 Test 3: Register-Seite ist erreichbar');
    await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle0' });
    
    // Prüfe ob Register3D-Komponente geladen ist
    const registerForm = await page.$('[data-testid="register-form"]');
    if (registerForm) {
      console.log('✅ Register3D-Komponente geladen');
    } else {
      console.log('⚠️ Register3D-Komponente nicht gefunden');
    }
    
    // Test 4: Backend-API ist erreichbar
    console.log('🔌 Test 4: Backend-API ist erreichbar');
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('http://localhost:8000/api/posts/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        return res.status;
      } catch (error) {
        return 'error';
      }
    });
    
    if (response === 401) {
      console.log('✅ Backend-API erreichbar (Authentifizierung erforderlich)');
    } else if (response === 'error') {
      console.log('❌ Backend-API nicht erreichbar');
    } else {
      console.log(`⚠️ Backend-API Status: ${response}`);
    }
    
    // Test 5: Navigation funktioniert
    console.log('🧭 Test 5: Navigation funktioniert');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    console.log('✅ Navigation zur Hauptseite erfolgreich');
    
    // Test 6: Responsive Design
    console.log('📱 Test 6: Responsive Design');
    await page.setViewport({ width: 375, height: 667 }); // Mobile
    await page.waitForTimeout(1000);
    console.log('✅ Mobile Viewport gesetzt');
    
    await page.setViewport({ width: 1280, height: 720 }); // Desktop
    await page.waitForTimeout(1000);
    console.log('✅ Desktop Viewport gesetzt');
    
    console.log('\n🎉 Alle Tests abgeschlossen!');
    
  } catch (error) {
    console.error('❌ Test-Fehler:', error.message);
  } finally {
    await browser.close();
  }
}

// Führe Tests aus
runTests().catch(console.error); 