
import React, { ReactNode } from 'react';
import { useTheme } from '@/components/ThemeProvider';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen" data-theme={theme}>
      {children}
    </div>
  );
};

export default Layout;
