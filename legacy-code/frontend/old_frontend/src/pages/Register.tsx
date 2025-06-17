
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabase';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const registerUser = async (email: string, password: string, username: string) => {
    try {
      // 1. Register the user with auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (authError) throw authError;

      // 2. If auth successful, create profile 
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            username,
            display_name: username,
          });

        if (profileError) throw profileError;
      }

      return { data: authData, error: null };
    } catch (error: unknown) {
      const typedError = error instanceof Error ? error : new Error(String(error));
      return { data: null, error: typedError };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    // Validate input
    if (!email || !password || !username) {
      setError('Bitte fülle alle Felder aus.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await registerUser(email, password, username);
      
      setIsLoading(false);
      
      if (result.error) {
        setError(result.error.message || 'Registrierung fehlgeschlagen. Bitte versuche es erneut.');
        return;
      }
      
      setSuccess('Registrierung erfolgreich! Du kannst dich jetzt anmelden.');
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: unknown) {
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten.';
      setError(errorMessage);
    }
  };

  return (
    <>
      <Helmet>
        <title>Registrieren | BSN</title>
      </Helmet>
      
      <div className="container mx-auto flex justify-center items-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Registrieren</CardTitle>
            <CardDescription>Erstelle ein neues Konto um fortzufahren.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username">Benutzername</Label>
                <Input 
                  id="username" 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="Dein Benutzername" 
                  disabled={isLoading} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="deine.email@beispiel.de" 
                  disabled={isLoading} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Passwort (mind. 6 Zeichen)" 
                  disabled={isLoading} 
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Registriere...' : 'Registrieren'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Bereits registriert?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Hier anmelden
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default Register;
