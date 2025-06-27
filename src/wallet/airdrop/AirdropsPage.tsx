
import React from 'react';
import { Card } from '@/components/ui/card';
import AirdropsList from './AirdropsList';
import AirdropDetails from './AirdropDetails';

export const AirdropsPage = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <AirdropsList />
      </div>
      <div>
        <AirdropDetails />
      </div>
    </div>
  );
};

export default AirdropsPage;
