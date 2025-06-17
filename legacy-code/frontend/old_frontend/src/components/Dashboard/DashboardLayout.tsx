
import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="bg-card rounded-lg shadow-sm border p-6">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
