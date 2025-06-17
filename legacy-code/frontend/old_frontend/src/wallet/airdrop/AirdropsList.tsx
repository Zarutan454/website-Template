
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AirdropsList = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Verfügbare Airdrops</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">Keine Airdrops verfügbar.</p>
      </CardContent>
    </Card>
  );
};

export default AirdropsList;
