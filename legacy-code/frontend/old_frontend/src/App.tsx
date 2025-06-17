
import React, { useEffect } from 'react';
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

const queryClient = new QueryClient();

function App() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    initializeAchievements().catch(() => {
    });
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <NotificationProvider>
            <FriendshipProvider>
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
            </FriendshipProvider>
          </NotificationProvider>
        </QueryClientProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
