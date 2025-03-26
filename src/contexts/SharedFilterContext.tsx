
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { addDays, subDays, startOfDay, endOfDay } from 'date-fns';

export interface DataFilters {
  dateRange: {
    from: Date;
    to: Date;
  };
  repIds: string[];
  sentimentRange: { min: number; max: number };
  keywords: string[];
  customerId?: string;
  productLines?: string[];
  callTypes?: string[];
}

interface SharedFilterContextType {
  filters: DataFilters;
  updateDateRange: (range: { from: Date; to: Date }) => void;
  updateRepIds: (ids: string[]) => void;
  updateSentimentRange: (range: { min: number; max: number }) => void;
  updateKeywords: (keywords: string[]) => void;
  updateCustomerId: (id: string | null) => void;
  updateProductLines: (productLines: string[]) => void;
  updateCallTypes: (callTypes: string[]) => void;
  resetFilters: () => void;
  clearAllFilters: () => void;
}

const defaultFilters: DataFilters = {
  dateRange: {
    from: subDays(startOfDay(new Date()), 30), // Last 30 days
    to: endOfDay(new Date()),
  },
  repIds: [],
  sentimentRange: { min: 0, max: 1 },
  keywords: [],
  customerId: undefined,
  productLines: [],
  callTypes: [],
};

const SharedFilterContext = createContext<SharedFilterContextType | undefined>(undefined);

export const SharedFilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<DataFilters>(defaultFilters);

  const updateDateRange = (range: { from: Date; to: Date }) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: range,
    }));
  };

  const updateRepIds = (ids: string[]) => {
    setFilters((prev) => ({
      ...prev,
      repIds: ids,
    }));
  };

  const updateSentimentRange = (range: { min: number; max: number }) => {
    setFilters((prev) => ({
      ...prev,
      sentimentRange: range,
    }));
  };

  const updateKeywords = (keywords: string[]) => {
    setFilters((prev) => ({
      ...prev,
      keywords,
    }));
  };

  const updateCustomerId = (id: string | null) => {
    setFilters((prev) => ({
      ...prev,
      customerId: id || undefined,
    }));
  };

  const updateProductLines = (productLines: string[]) => {
    setFilters((prev) => ({
      ...prev,
      productLines,
    }));
  };

  const updateCallTypes = (callTypes: string[]) => {
    setFilters((prev) => ({
      ...prev,
      callTypes,
    }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const clearAllFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <SharedFilterContext.Provider
      value={{
        filters,
        updateDateRange,
        updateRepIds,
        updateSentimentRange,
        updateKeywords,
        updateCustomerId,
        updateProductLines,
        updateCallTypes,
        resetFilters,
        clearAllFilters,
      }}
    >
      {children}
    </SharedFilterContext.Provider>
  );
};

export const useSharedFilters = () => {
  const context = useContext(SharedFilterContext);
  if (context === undefined) {
    throw new Error('useSharedFilters must be used within a SharedFilterProvider');
  }
  return context;
};
