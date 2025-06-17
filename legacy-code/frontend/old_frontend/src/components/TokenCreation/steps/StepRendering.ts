
/**
 * Definition der Schritte im Token-Erstellungsprozess
 */

// Enumeration der verfügbaren Schritte
export enum CreationStep {
  Network = 0,
  TokenType = 1,
  BasicSettings = 2,
  AdvancedSettings = 3,
  Review = 4,
  Deploying = 5,
  Success = 6
}

// Interface für Schritt-Konfiguration
export interface StepConfig {
  id: CreationStep;
  title: string;
  description: string;
  icon: string;
}

// Vollständige Konfiguration aller Schritte
export const CREATION_STEPS: StepConfig[] = [
  {
    id: CreationStep.Network,
    title: 'Netzwerk auswählen',
    description: 'Wähle das Blockchain-Netzwerk für deinen Token',
    icon: 'network'
  },
  {
    id: CreationStep.TokenType,
    title: 'Token-Typ',
    description: 'Wähle die Art des Tokens, den du erstellen möchtest',
    icon: 'token'
  },
  {
    id: CreationStep.BasicSettings,
    title: 'Grundeinstellungen',
    description: 'Konfiguriere die grundlegenden Eigenschaften deines Tokens',
    icon: 'settings'
  },
  {
    id: CreationStep.AdvancedSettings,
    title: 'Erweiterte Einstellungen',
    description: 'Konfiguriere fortgeschrittene Token-Funktionen',
    icon: 'advanced'
  },
  {
    id: CreationStep.Review,
    title: 'Überprüfung',
    description: 'Überprüfe deine Token-Konfiguration vor dem Deployment',
    icon: 'check'
  },
  {
    id: CreationStep.Deploying,
    title: 'Deployment',
    description: 'Dein Token wird auf die Blockchain deployed',
    icon: 'rocket'
  },
  {
    id: CreationStep.Success,
    title: 'Erfolg',
    description: 'Dein Token wurde erfolgreich erstellt',
    icon: 'success'
  }
];

// Hilfsfunktion zum Abrufen der Schrittinformationen
export function getStepConfig(step: CreationStep): StepConfig {
  return CREATION_STEPS[step];
}

// Hilfsfunktion zum Ermitteln, ob ein Schritt abgeschlossen ist
export function isStepCompleted(currentStep: CreationStep, step: CreationStep): boolean {
  return currentStep > step;
}

// Hilfsfunktion zum Ermitteln, ob ein Schritt aktiv ist
export function isStepActive(currentStep: CreationStep, step: CreationStep): boolean {
  return currentStep === step;
}
