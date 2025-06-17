
import { useState } from 'react';
import { TokenFormValues } from '../types/TokenFormTypes';

export const useTokenFormValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateForm = (formData: Partial<TokenFormValues>): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    
    // Validate the name
    if (!formData.name?.trim()) {
      newErrors.name = 'Token name is required';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Token name must not exceed 50 characters';
    }
    
    // Validate the symbol
    if (!formData.symbol?.trim()) {
      newErrors.symbol = 'Token symbol is required';
    } else if (formData.symbol.length > 6) {
      newErrors.symbol = 'Token symbol must not exceed 6 characters';
    }
    
    // Validate the supply
    if (!formData.supply) {
      newErrors.supply = 'Initial supply is required';
    } else if (isNaN(Number(formData.supply)) || Number(formData.supply) <= 0) {
      newErrors.supply = 'Supply must be a positive number';
    }
    
    // Validate decimals
    if (formData.decimals && (isNaN(Number(formData.decimals)) || Number(formData.decimals) < 0 || Number(formData.decimals) > 18)) {
      newErrors.decimals = 'Decimals must be a number between 0 and 18';
    }
    
    // Validate maxSupply if provided
    if (formData.maxSupply && formData.supply && Number(formData.maxSupply) < Number(formData.supply)) {
      newErrors.maxSupply = 'Max supply cannot be less than initial supply';
    }
    
    // Validate tax values if provided (for marketing tokens)
    if (formData.tokenType === 'marketing') {
      if (formData.buyTax && (isNaN(Number(formData.buyTax)) || Number(formData.buyTax) < 0 || Number(formData.buyTax) > 25)) {
        newErrors.buyTax = 'Buy tax must be between 0 and 25%';
      }
      
      if (formData.sellTax && (isNaN(Number(formData.sellTax)) || Number(formData.sellTax) < 0 || Number(formData.sellTax) > 25)) {
        newErrors.sellTax = 'Sell tax must be between 0 and 25%';
      }
    }
    
    // Set the errors state
    setErrors(newErrors);
    
    return newErrors;
  };
  
  const hasErrors = Object.keys(errors).length > 0;
  
  const clearErrors = () => {
    setErrors({});
  };
  
  const setError = (field: string, message: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: message
    }));
  };
  
  return {
    errors,
    validateForm,
    hasErrors,
    clearErrors,
    setError
  };
};
