import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { EmailLoginForm } from "./EmailLoginForm";
import { WalletLoginSection } from "./WalletLoginSection";
import { SocialLoginButtons } from "./SocialLoginButtons";
import { LoginHeader } from "./LoginHeader";
import { useToast } from "@/hooks/use-toast";

export const LoginCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleEmailLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Implementiere Email-Login-Logik hier
      toast({
        title: "Erfolgreich angemeldet",
        description: "Willkommen zurück!",
      });
    } catch (error) {
      toast({
        title: "Fehler beim Anmelden",
        description: "Bitte überprüfe deine Eingaben.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletLogin = async () => {
    setIsLoading(true);
    try {
      // Implementiere Wallet-Login-Logik hier
      toast({
        title: "Wallet verbunden",
        description: "Du bist jetzt mit deinem Wallet verbunden.",
      });
    } catch (error) {
      toast({
        title: "Fehler beim Verbinden",
        description: "Bitte versuche es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    try {
      // Implementiere Social-Login-Logik hier
      toast({
        title: `Mit ${provider} angemeldet`,
        description: "Du bist jetzt angemeldet.",
      });
    } catch (error) {
      toast({
        title: "Fehler beim Anmelden",
        description: "Bitte versuche es später erneut.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <LoginHeader 
          title="Willkommen zurück" 
          subtitle="Melde dich mit deinem Account an" 
        />
      </CardHeader>
      <CardContent className="space-y-6">
        <EmailLoginForm onSubmit={handleEmailLogin} isLoading={isLoading} />
        
        <div className="relative">
          <Separator className="my-4" />
          <div className="absolute inset-x-0 -top-2 flex justify-center">
            <span className="bg-white dark:bg-[#0c1427] px-2 text-sm text-gray-500">
              oder
            </span>
          </div>
        </div>

        <WalletLoginSection 
          onWalletLogin={handleWalletLogin}
          isLoading={isLoading}
        />
        
        <div className="relative">
          <Separator className="my-4" />
          <div className="absolute inset-x-0 -top-2 flex justify-center">
            <span className="bg-white dark:bg-[#0c1427] px-2 text-sm text-gray-500">
              Social Login
            </span>
          </div>
        </div>

        <SocialLoginButtons 
          onGithubLogin={() => handleSocialLogin('GitHub')}
          onTwitterLogin={() => handleSocialLogin('Twitter')}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};
