
import React from 'react';
import { Check, Network, Settings, ChevronRight } from 'lucide-react';
import { CreationStep } from './StepRendering';

interface WizardStepperProps {
  currentStep: CreationStep;
}

export const WizardStepper: React.FC<WizardStepperProps> = ({ currentStep }) => {
  const steps = [
    { id: CreationStep.Network, name: 'Netzwerk', icon: <Network className="h-5 w-5" /> },
    { id: CreationStep.TokenType, name: 'Token Typ', icon: <Settings className="h-5 w-5" /> },
    { id: CreationStep.BasicSettings, name: 'Grundeinstellungen', icon: <Settings className="h-5 w-5" /> },
    { id: CreationStep.AdvancedSettings, name: 'Erweitert', icon: <Settings className="h-5 w-5" /> },
    { id: CreationStep.Review, name: 'Überprüfen', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="my-8">
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isUpcoming = step.id > currentStep;
          
          return (
            <React.Fragment key={step.id}>
              <li className={`flex items-center ${isCurrent ? 'text-primary' : isCompleted ? 'text-green-500' : 'text-gray-500'}`}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  isCompleted 
                    ? 'bg-green-100 dark:bg-green-900'
                    : isCurrent
                      ? 'bg-primary/20'
                      : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{step.icon}</span>
                  )}
                </div>
                <span className={`hidden sm:inline-block ml-2 text-sm ${
                  isCurrent ? 'font-medium' : isUpcoming ? 'text-gray-400' : ''
                }`}>
                  {step.name}
                </span>
              </li>
              
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${
                  steps[index + 1].id <= currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}></div>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </div>
  );
};
