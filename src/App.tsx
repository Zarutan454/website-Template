import * as React from 'react';
import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster"
import { FloatingMiningButton } from './components/mining';
import Navbar from './components/Navbar'; 
import routes from './routes';
import { initializeAchievements } from './hooks/mining/achievements/initAchievements';
import { NotificationProvider } from './components/ui/notification-system';
import { LanguageProvider } from './components/LanguageProvider';
import { FriendshipProvider } from './context/FriendshipContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext.utils';
import { PostProvider } from './context/PostContext';
import { WebSocketStatus } from './components/realtime/WebSocketStatus';
import { DebugUtils } from './utils/debugUtils';

const queryClient = new QueryClient();

// Global fetch interceptor to fix media_url array issues
const originalFetch = window.fetch;

window.fetch = function(url: string | URL, options?: RequestInit) {
  // Only intercept POST requests to posts endpoint
  if (typeof url === 'string' && url.includes('/api/posts/') && options?.method === 'POST' && options?.body) {
    try {
      // Parse the request body
      const body = JSON.parse(options.body as string);
      
      // Fix media_url if it's an array
      if (body.media_url && Array.isArray(body.media_url)) {
        if (import.meta.env.DEV) {
          console.warn('🚨 GLOBAL FIX: Intercepted media_url array, converting to string:', body.media_url);
        }
        body.media_url = body.media_url[0] || null;
        if (import.meta.env.DEV) {
          console.log('✅ GLOBAL FIX: Fixed media_url:', body.media_url);
        }
      }
      
      // Update the request body with fixed data
      options.body = JSON.stringify(body);
      if (import.meta.env.DEV) {
        console.log('✅ GLOBAL FIX: Request body sanitized:', body);
      }
      
    } catch (error) {
      if (import.meta.env.DEV) {
        console.log('⚠️ GLOBAL FIX: Could not parse request body, skipping sanitization');
      }
    }
  }
  
  // Call the original fetch
  return originalFetch.apply(this, [url, options]);
};

if (import.meta.env.DEV) {
  console.log('✅ GLOBAL FIX: Fetch interceptor activated - media_url arrays will be automatically fixed!');
}

function AppContent() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Only initialize achievements if user is logged in
    if (isAuthenticated) {
      initializeAchievements().catch(() => {
        // Silently handle errors
      });
    }
  }, [isAuthenticated]);

  // Safe Error Logger Integration
  useEffect(() => {
    if (import.meta.env.DEV) {
      // Log app startup safely
      setTimeout(() => {
        DebugUtils.logInfo('Application started safely', 'App', {
          version: import.meta.env.VITE_APP_VERSION || '1.0.0',
          environment: import.meta.env.MODE,
          pathname: location.pathname
        });
      }, 1000);
    }
  }, [location.pathname]);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <NotificationProvider>
            <FriendshipProvider>
              <PostProvider>
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <main className={`flex-1 ${isLandingPage ? '' : 'pt-14'}`}>
                    <Routes>
                      {routes.map((route, index) => (
                        <Route key={index} path={route.path} element={route.element} />
                      ))}
                    </Routes>
                  </main>
                </div>
                <Toaster />
                {!isLandingPage && <FloatingMiningButton />}
                {import.meta.env.DEV && <WebSocketStatus />}
              </PostProvider>
            </FriendshipProvider>
          </NotificationProvider>
        </QueryClientProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
