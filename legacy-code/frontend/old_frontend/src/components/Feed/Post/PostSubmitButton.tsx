
import React from 'react';
import { SendHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PostSubmitButtonProps {
  onSubmit: () => void;
  isSubmitting: boolean;
  disabled: boolean;
  theme: string;
}

const PostSubmitButton: React.FC<PostSubmitButtonProps> = ({
  onSubmit,
  isSubmitting,
  disabled,
  theme
}) => {
  return (
    <Button 
      variant="default"
      size="sm"
      onClick={onSubmit}
      disabled={isSubmitting || disabled}
      className="bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-full"
      data-theme={theme}
    >
      {isSubmitting ? (
        <span className="flex items-center">
          <span className="mr-2">Posten...</span>
        </span>
      ) : (
        <span className="flex items-center">
          <SendHorizontal size={16} className="mr-2" />
          Posten
        </span>
      )}
    </Button>
  );
};

export default PostSubmitButton;
