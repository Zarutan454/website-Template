
import { Button } from "@/components/ui/button";
import { Github, Twitter } from "lucide-react";

interface SocialLoginButtonsProps {
  onGithubLogin: () => void;
  onTwitterLogin: () => void;
  isLoading: boolean;
}

export const SocialLoginButtons = ({ 
  onGithubLogin, 
  onTwitterLogin, 
  isLoading 
}: SocialLoginButtonsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Button
        onClick={onGithubLogin}
        disabled={isLoading}
        variant="outline"
      >
        <Github className="mr-2 h-4 w-4" />
        GitHub
      </Button>
      <Button
        onClick={onTwitterLogin}
        disabled={isLoading}
        variant="outline"
      >
        <Twitter className="mr-2 h-4 w-4" />
        Twitter
      </Button>
    </div>
  );
};
