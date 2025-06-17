
import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TokenWizardStepperProps {
  steps: string[];
  currentStep: number;
}

const TokenWizardStepper: React.FC<TokenWizardStepperProps> = ({ steps, currentStep }) => {
  return (
    <>
      {/* Desktop stepper - horizontal with all steps visible */}
      <div className="hidden md:flex items-center justify-between space-x-2 overflow-x-auto py-2">
        {steps.map((step, index) => {
          // Determine if step is active, completed, or upcoming
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isUpcoming = index > currentStep;
          
          return (
            <React.Fragment key={index}>
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div 
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                    isActive && "border-primary bg-primary/10",
                    isCompleted && "border-primary bg-primary text-white",
                    isUpcoming && "border-gray-300 dark:border-gray-600"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className={isActive ? "text-primary" : "text-muted-foreground"}>
                      {index + 1}
                    </span>
                  )}
                </div>
                
                {/* Step label */}
                <span 
                  className={cn(
                    "text-xs mt-1 whitespace-nowrap",
                    isActive && "text-primary font-medium",
                    isCompleted && "text-primary",
                    isUpcoming && "text-muted-foreground"
                  )}
                >
                  {step}
                </span>
              </div>
              
              {/* Connector line between steps */}
              {index < steps.length - 1 && (
                <div 
                  className={cn(
                    "h-0.5 w-8 flex-shrink-0",
                    isCompleted && index + 1 <= currentStep ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Mobile stepper - only shows current step with prev/next indicators */}
      <div className="flex md:hidden items-center justify-between px-2 py-3 bg-muted/20 rounded-md">
        <div className="flex items-center space-x-2">
          <div 
            className={cn(
              "flex items-center justify-center w-7 h-7 rounded-full border-2 transition-colors",
              "border-primary bg-primary/10"
            )}
          >
            <span className="text-primary text-xs font-medium">
              {currentStep + 1}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm font-medium text-primary">
              {steps[currentStep]}
            </span>
            <span className="text-xs text-muted-foreground">
              Schritt {currentStep + 1} von {steps.length}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          {currentStep > 0 && (
            <div className="text-xs text-muted-foreground">
              {steps[currentStep - 1]}
            </div>
          )}
          
          {currentStep < steps.length - 1 && (
            <>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <div className="text-xs text-muted-foreground">
                {steps[currentStep + 1]}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default TokenWizardStepper;
