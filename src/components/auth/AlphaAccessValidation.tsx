import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { apiClient } from '@/lib/django-api-new';
import { Shield, Key, Users, Star } from 'lucide-react';

interface AlphaAccessValidationProps {
  onValidationSuccess: (accessCode: string) => void;
  onCancel: () => void;
}

const AlphaAccessValidation: React.FC<AlphaAccessValidationProps> = ({
  onValidationSuccess,
  onCancel
}) => {
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAccessCode = async () => {
    if (!accessCode.trim()) {
      setError('Bitte gib einen Alpha-Access-Code ein');
      return;
    }

    if (accessCode.length < 6) {
      setError('Alpha-Access-Code muss mindestens 6 Zeichen haben');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, this would validate against the backend
      // For now, we'll simulate the validation
      const response = await apiClient.post('/api/users/validate-alpha-access/', {
        access_code: accessCode
      });

      toast.success('Alpha-Access-Code erfolgreich validiert!');
      onValidationSuccess(accessCode);

    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Ungültiger Alpha-Access-Code';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateAccessCode();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
            <Shield className="h-6 w-6 text-purple-600" />
          </div>
          <CardTitle>Alpha-Access erforderlich</CardTitle>
          <CardDescription>
            BSN befindet sich derzeit in der Alpha-Phase. Du benötigst einen Alpha-Access-Code, um dich zu registrieren.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="alpha_access_code">Alpha-Access-Code</Label>
              <Input 
                id="alpha_access_code" 
                type="text" 
                value={accessCode} 
                onChange={(e) => setAccessCode(e.target.value)} 
                placeholder="Alpha-Access-Code eingeben" 
                disabled={isLoading}
                className="text-center tracking-wider"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4" />
                <span>Exklusiver Zugang zur Alpha-Version</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Begrenzte Anzahl von Nutzern</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Key className="h-4 w-4" />
                <span>Früher Zugang zu neuen Features</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isLoading}
              >
                {isLoading ? 'Validiere...' : 'Code validieren'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isLoading}
              >
                Abbrechen
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlphaAccessValidation; 