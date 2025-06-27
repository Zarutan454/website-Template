
import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { profile, isLoading } = useProfile();
  const location = useLocation();

  // Wenn wir auf der Landing Page sind, lassen wir den Zugriff ohne Authentifizierung zu
  if (location.pathname === '/') {
    return children ? <>{children}</> : <Outlet />;
  }

  // Zugriffsausnahmen für Seiten, die ohne Authentifizierung zugänglich sein sollen
  const publicRoutes = ['/login', '/register', '/reset-password'];
  if (publicRoutes.includes(location.pathname)) {
    return children ? <>{children}</> : <Outlet />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-dark-300 via-dark-200 to-dark-100">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Lade Profil...</p>
        </div>
      </div>
    );
  }

  // Wenn kein Profil existiert und wir nicht auf einer öffentlichen Route sind, leiten wir zur Login-Seite weiter
  if (!profile) {
    // Wichtig: state übergeben, um nach dem Login zurückzuleiten
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
