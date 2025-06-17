
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface EmptyLockStateProps {
  type: 'token' | 'liquidity';
  onCreateNew?: () => void;
}

export const EmptyLockState: React.FC<EmptyLockStateProps> = ({ type, onCreateNew }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-dashed border-2 bg-muted/30">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Lock className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
          </motion.div>
          <h3 className="font-medium text-lg">
            {type === 'token' ? 'Keine Token-Locks gefunden' : 'Keine Liquiditäts-Locks gefunden'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {type === 'token' 
              ? 'Ein Token-Lock sperrt deine Tokens für einen bestimmten Zeitraum und schafft dadurch Vertrauen bei deinen Investoren.' 
              : 'Ein Liquiditäts-Lock sperrt deine LP-Tokens und verhindert, dass die Liquidität aus dem Pool entfernt werden kann.'}
          </p>
          
          {onCreateNew && (
            <Button 
              onClick={onCreateNew}
              className="mt-2"
              variant="outline"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              {type === 'token' ? 'Token Lock erstellen' : 'Liquiditäts-Lock erstellen'}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EmptyLockState;
