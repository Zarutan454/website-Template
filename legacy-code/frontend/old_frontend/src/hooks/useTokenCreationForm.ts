
import { useState } from 'react';
import { TokenFormData, TokenFeatures } from '@/components/TokenCreation/types';
import { toast } from 'sonner';

/**
 * Hook für das Formular zur Token-Erstellung
 * Vereinfachte Version des useTokenCreation Hooks, fokussiert auf Formularmanagement
 */
export const useTokenCreationForm = () => {
  const [formData, setFormData] = useState<TokenFormData>({
    network: 'ethereum',
    tokenType: 'standard',
    name: '',
    symbol: '',
    decimals: '18',
    supply: '1000000',
    features: {
      burnable: true,
      pausable: false,
      mintable: true,
      shareable: false
    },
    description: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  /**
   * Aktualisiert ein einzelnes Feld im Formular
   */
  const handleInputChange = (field: string, value: string | number | boolean) => {
    // Besondere Behandlung für verschachtelte Feature-Objekte
    if (field.startsWith('features.')) {
      const featureKey = field.split('.')[1] as keyof TokenFeatures;
      setFormData(prev => ({
        ...prev,
        features: {
          ...prev.features,
          [featureKey]: value
        }
      }));
      return;
    }
    
    // Normale Feldaktualisierung
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Fehler für dieses Feld zurücksetzen, wenn es geändert wurde
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  /**
   * Validiert das Formular und gibt ein Objekt mit Fehlern zurück
   */
  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Token-Name ist erforderlich';
    }
    
    if (!formData.symbol.trim()) {
      errors.symbol = 'Token-Symbol ist erforderlich';
    } else if (formData.symbol.length > 6) {
      errors.symbol = 'Symbol darf maximal 6 Zeichen lang sein';
    }
    
    if (!formData.supply || isNaN(Number(formData.supply)) || Number(formData.supply) <= 0) {
      errors.supply = 'Bitte gib einen gültigen Anfangsbestand ein';
    }
    
    if (!formData.network) {
      errors.network = 'Bitte wähle ein Netzwerk aus';
    }
    
    if (!formData.tokenType) {
      errors.tokenType = 'Bitte wähle einen Token-Typ aus';
    }
    
    return errors;
  };
  
  /**
   * Behandelt die Formularübermittlung
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Formular validieren
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Bitte korrigiere die Fehler im Formular');
      return false;
    }
    
    try {
      setIsSubmitting(true);
      
      // Hier würde normalerweise die Speicherlogik erfolgen
      // Für jetzt simulieren wir nur einen erfolgreichen Speichervorgang
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Token-Informationen gespeichert');
      return true;
    } catch (error) {
      console.error('Error saving token:', error);
      toast.error('Fehler beim Speichern der Token-Informationen');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  /**
   * Setzt das Formular auf die Standardwerte zurück
   */
  const resetForm = () => {
    setFormData({
      network: 'ethereum',
      tokenType: 'standard',
      name: '',
      symbol: '',
      decimals: '18',
      supply: '1000000',
      features: {
        burnable: true,
        pausable: false,
        mintable: true,
        shareable: false
      },
      description: ''
    });
    setFormErrors({});
  };
  
  return {
    formData,
    isSubmitting,
    formErrors,
    handleInputChange,
    handleSubmit,
    resetForm,
    setFormData
  };
};
