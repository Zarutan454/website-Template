
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ProfileErrorProps {
  error: Error | null;
  onRetry: () => void;
}

const ProfileError: React.FC<ProfileErrorProps> = ({ error, onRetry }) => {
  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        
        <h2 className="text-xl font-semibold">Profil konnte nicht geladen werden</h2>
        
        <p className="text-muted-foreground">
          {error?.message || 'Es ist ein unbekannter Fehler aufgetreten beim Laden des Profils.'}
        </p>
        
        <Button onClick={onRetry} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Erneut versuchen
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileError;
