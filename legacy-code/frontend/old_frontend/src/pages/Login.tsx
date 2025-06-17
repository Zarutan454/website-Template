
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginForm } from '@/hooks/useLoginForm';
import { useAuthSession } from '@/hooks/useAuthSession';
import { ConnectWalletButton } from '@/wallet/auth/ConnectWalletButton';
import { Separator } from '@/components/ui/separator';

const Login = () => {
  const { formState, updateFormState, togglePasswordVisibility, handleLogin } = useLoginForm();
  const { sessionChecked } = useAuthSession();

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark-300 via-dark-200 to-dark-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Überprüfe Anmeldestatus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-300 via-dark-200 to-dark-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Zurück zur Startseite
          </Link>
        </div>
        
        <div className="bg-dark-100 rounded-xl border border-gray-800 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Willkommen zurück</h1>
            <p className="text-gray-400">Melde dich bei deinem BSN-Konto an</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="deine@email.de"
                  value={formState.email}
                  onChange={(e) => updateFormState('email', e.target.value)}
                  className="bg-dark-200 border-gray-700 focus:border-primary-500 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Passwort</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={formState.showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formState.password}
                    onChange={(e) => updateFormState('password', e.target.value)}
                    className="bg-dark-200 border-gray-700 focus:border-primary-500 text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {formState.showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="text-right">
                  <Link to="/reset-password" className="text-sm text-primary-400 hover:text-primary-300">
                    Passwort vergessen?
                  </Link>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700"
                disabled={formState.isLoading}
              >
                {formState.isLoading ? "Anmeldung läuft..." : "Anmelden"}
              </Button>
            </div>
          </form>

          <div className="relative my-6">
            <Separator className="my-4" />
            <div className="absolute inset-x-0 -top-2 flex justify-center">
              <span className="bg-dark-100 px-2 text-sm text-gray-500">oder</span>
            </div>
          </div>

          <ConnectWalletButton 
            className="w-full" 
            buttonText="Mit Wallet anmelden"
            loginAfterConnect={true}
            redirectPath="/feed"
          />
          
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Noch kein Konto?{" "}
              <Link to="/register" className="text-primary-400 hover:text-primary-300">
                Jetzt registrieren
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
