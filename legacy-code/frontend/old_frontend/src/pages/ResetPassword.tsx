
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Fehler",
        description: "Bitte gib deine E-Mail-Adresse ein.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Hier würde später die tatsächliche Supabase-Integration stattfinden
      setTimeout(() => {
        setResetSent(true);
        setIsLoading(false);
        toast({
          title: "E-Mail gesendet",
          description: "Eine Anleitung zum Zurücksetzen deines Passworts wurde an deine E-Mail-Adresse gesendet.",
        });
      }, 1500);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Es ist ein Fehler aufgetreten. Bitte versuche es erneut.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-300 via-dark-200 to-dark-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link to="/login" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Zurück zum Login
          </Link>
        </div>
        
        <div className="bg-dark-100 rounded-xl border border-gray-800 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Passwort zurücksetzen</h1>
            <p className="text-gray-400">Gib deine E-Mail-Adresse ein, um dein Passwort zurückzusetzen</p>
          </div>
          
          {!resetSent ? (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="deine@email.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-dark-200 border-gray-700 focus:border-primary-500 text-white"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Wird gesendet..." : "Passwort zurücksetzen"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center p-6 bg-dark-200/50 rounded-lg border border-gray-700">
              <div className="text-green-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">E-Mail gesendet</h3>
              <p className="text-gray-400 mb-4">
                Wir haben eine E-Mail mit einem Link zum Zurücksetzen deines Passworts an {email} gesendet.
              </p>
              <p className="text-sm text-gray-500">
                Solltest du keine E-Mail erhalten, überprüfe bitte deinen Spam-Ordner oder 
                <button 
                  onClick={() => setResetSent(false)} 
                  className="text-primary-400 hover:text-primary-300 ml-1"
                >
                  versuche es erneut
                </button>
              </p>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              <Link to="/login" className="text-primary-400 hover:text-primary-300">
                Zurück zum Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
