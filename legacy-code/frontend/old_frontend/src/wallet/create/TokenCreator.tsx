
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TokenCreator = () => {
  const { isConnected } = useAccount();
  const navigate = useNavigate();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Token erstellen</CardTitle>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Erstelle deinen eigenen Token auf der Blockchain ohne Programmierkenntnisse.
              Wähle zwischen verschiedenen Token-Typen und passe die Funktionen an deine Bedürfnisse an.
            </p>
            <Button 
              onClick={() => navigate('/create-token')} 
              className="w-full"
              variant="default"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Neuen Token erstellen
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground">Verbinde deine Wallet, um Token zu erstellen.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default TokenCreator;
