
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';

// HOC to protect routes based on user role
export function withRoleProtection<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRole: string = 'user'
) {
  return function WithRoleProtection(props: P) {
    const { profile, isLoading } = useProfile();
    const navigate = useNavigate();

    useEffect(() => {
      if (!isLoading && profile) {
        // Safely access role properties with TypeScript
        const userRole = 
          typeof profile === 'object' && 
          ('role_name' in profile ? profile.role_name : 
           'role' in profile ? profile.role : 'user');
        
        if (userRole !== requiredRole && requiredRole === 'admin') {
          // Redirect to unauthorized page if role doesn't match
          navigate('/unauthorized');
        }
      } else if (!isLoading && !profile) {
        // Redirect to login if not authenticated
        navigate('/login');
      }
    }, [profile, isLoading, navigate]);

    if (isLoading) {
      return <div>Loading...</div>; // Show loading state
    }

    if (!profile) {
      return null; // Will redirect in useEffect
    }

    // Render the wrapped component if authorized
    return <WrappedComponent {...props} />;
  };
}

export default withRoleProtection;
