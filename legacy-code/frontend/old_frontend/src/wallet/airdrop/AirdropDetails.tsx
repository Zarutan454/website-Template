
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AirdropDetails = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Airdrop Details</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">Keine Details verfügbar.</p>
      </CardContent>
    </Card>
  );
};

export default AirdropDetails;
