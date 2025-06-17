
import React from 'react';
import { CreationStep } from './steps/StepRendering';
import { 
  Network, 
  TagIcon, 
  Settings, 
  FileSpreadsheet, 
  Layers, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardStepperProps {
  currentStep: CreationStep;
}

interface Step {
  label: string;
  icon: React.ReactNode;
  description: string;
}

export const WizardStepper: React.FC<WizardStepperProps> = ({ currentStep }) => {
  const steps: Step[] = [
    {
      label: 'Netzwerk',
      icon: <Network className="h-5 w-5" />,
      description: 'Wähle die Blockchain'
    },
    {
      label: 'Token-Typ',
      icon: <TagIcon className="h-5 w-5" />,
      description: 'Wähle den Token-Typ'
    },
    {
      label: 'Grundeinstellungen',
      icon: <FileSpreadsheet className="h-5 w-5" />,
      description: 'Name, Symbol, Angebot'
    },
    {
      label: 'Erweitert',
      icon: <Settings className="h-5 w-5" />,
      description: 'Features, Sicherheit'
    },
    {
      label: 'Überprüfung',
      icon: <Layers className="h-5 w-5" />,
      description: 'Prüfe alle Einstellungen'
    },
    {
      label: 'Deployment',
      icon: <Loader2 className="h-5 w-5" />,
      description: 'Token wird erstellt'
    },
    {
      label: 'Abgeschlossen',
      icon: <CheckCircle2 className="h-5 w-5" />,
      description: 'Token erfolgreich erstellt'
    }
  ];

  return (
    <div className="flex flex-col space-y-2">
      <div className="text-lg font-medium mb-2">Token-Erstellung</div>
      
      {steps.map((step, index) => (
        <div 
          key={index} 
          className={cn(
            "p-3 rounded-md border transition-all",
            currentStep === index 
              ? "bg-primary/10 border-primary/50" 
              : currentStep > index 
                ? "bg-muted border-muted-foreground/30" 
                : "bg-background border-border"
          )}
        >
          <div className="flex items-center space-x-3">
            <div className={cn(
              "p-1.5 rounded-full",
              currentStep === index 
                ? "bg-primary text-primary-foreground" 
                : currentStep > index 
                  ? "bg-muted-foreground text-background" 
                  : "bg-muted text-muted-foreground"
            )}>
              {step.icon}
            </div>
            
            <div>
              <div className={cn(
                "font-medium",
                currentStep === index 
                  ? "text-primary" 
                  : currentStep > index 
                    ? "text-muted-foreground" 
                    : "text-foreground/70"
              )}>
                {step.label}
              </div>
              <div className="text-xs text-muted-foreground">
                {step.description}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
