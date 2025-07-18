import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import { apiClient } from '@/lib/django-api-new';
import { CheckCircle, XCircle, Mail, Clock } from 'lucide-react';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);

  // Get token from URL params if available
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
      handleVerification(urlToken);
    }
  }, [searchParams]);

  const handleVerification = async (verificationToken: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/api/users/verify-email/', {
        token: verificationToken
      });

      setIsVerified(true);
      toast.success('E-Mail erfolgreich verifiziert! Du kannst dich jetzt anmelden.');
      
      // Redirect to login after successful verification
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Verifikation fehlgeschlagen';
      
      if (errorMessage.includes('expired') || errorMessage.includes('ungültig')) {
        setIsExpired(true);
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token.trim()) {
      setError('Bitte gib den Verifikations-Code ein');
      return;
    }

    await handleVerification(token);
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    
    try {
      // This would typically require the user's email, but for now we'll show a message
      toast.info('Falls du keine E-Mail erhalten hast, überprüfe deinen Spam-Ordner oder kontaktiere den Support.');
    } catch (error: any) {
      toast.error('Fehler beim erneuten Senden der Verifikations-E-Mail');
    } finally {
      setResendLoading(false);
    }
  };

  if (isVerified) {
    return (
      <>
        <Helmet>
          <title>E-Mail verifiziert | BSN</title>
        </Helmet>
        
        <div className="container mx-auto flex justify-center items-center min-h-screen p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>E-Mail erfolgreich verifiziert!</CardTitle>
              <CardDescription>
                Dein Konto wurde erfolgreich aktiviert. Du wirst zur Anmeldeseite weitergeleitet.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button onClick={() => navigate('/login')} className="w-full">
                Zur Anmeldung
              </Button>
            </CardFooter>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>E-Mail verifizieren | BSN</title>
      </Helmet>
      
      <div className="container mx-auto flex justify-center items-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>E-Mail verifizieren</CardTitle>
            <CardDescription>
              Bitte gib den Verifikations-Code ein, den wir an deine E-Mail-Adresse gesendet haben.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {isExpired && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Der Verifikations-Code ist abgelaufen. Bitte fordere einen neuen Code an.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="token">Verifikations-Code</Label>
                <Input 
                  id="token" 
                  type="text" 
                  value={token} 
                  onChange={(e) => setToken(e.target.value)} 
                  placeholder="Verifikations-Code eingeben" 
                  disabled={isLoading}
                  className="text-center text-lg tracking-widest"
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Verifiziere...' : 'E-Mail verifizieren'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              variant="outline" 
              onClick={handleResendVerification}
              disabled={resendLoading}
              className="w-full"
            >
              {resendLoading ? 'Sende...' : 'Code erneut senden'}
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Zurück zur Anmeldung
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default EmailVerification; 