
import { useState, useEffect } from 'react';

export const useAuth = () => {
  // For demonstration purposes, we'll hardcode isLoggedIn to true
  // In a real application, this would check the user's authentication status
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  return {
    isLoggedIn,
    user: null,
    login: () => setIsLoggedIn(true),
    logout: () => setIsLoggedIn(false)
  };
};
