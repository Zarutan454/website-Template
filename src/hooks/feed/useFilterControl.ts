
import { useState } from 'react';

export type UiFilterType = string | null;

/**
 * Hook for managing feed filter controls
 */
export const useFilterControl = (initialFilter: UiFilterType = "Neueste") => {
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<UiFilterType>(initialFilter);
  
  const toggleFilters = () => setShowFilterMenu(!showFilterMenu);
  
  const handleFilterSelect = (filter: UiFilterType) => {
    setSelectedFilter(filter);
    setShowFilterMenu(false);
  };
  
  return {
    showFilterMenu,
    selectedFilter,
    toggleFilters,
    handleFilterSelect
  };
};
