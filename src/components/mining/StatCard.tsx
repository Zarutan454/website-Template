import React from 'react';

export const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <div className="bg-dark-100 p-4 rounded-lg border border-gray-800 text-center">
    <p className="text-sm text-gray-400">{label}</p>
    <p className="text-xl font-bold text-white">{value}</p>
  </div>
); 