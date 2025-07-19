
import * as React from 'react';
import { ReactNode } from 'react';
import { useTheme } from '@/components/ThemeProvider.utils';

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
