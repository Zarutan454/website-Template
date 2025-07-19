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
            <div className="mb-4">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={formState.email}
                onChange={e => updateFormState('email', e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="password">Passwort</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={formState.showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formState.password}
                  onChange={e => updateFormState('password', e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400"
                  onClick={togglePasswordVisibility}
                  tabIndex={-1}
                >
                  {formState.showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={formState.isLoading}>
              {formState.isLoading ? 'Anmelden...' : 'Anmelden'}
            </Button>
          </form>
          <Separator className="my-6" />
          <ConnectWalletButton />
        </div>
      </div>
    </div>
  );
};

export default Login;
