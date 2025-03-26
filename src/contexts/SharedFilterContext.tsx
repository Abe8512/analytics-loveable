
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { addDays, subDays, startOfDay, endOfDay } from 'date-fns';
import type { DataFilters } from '@/services/SharedDataService';

interface SharedFilterContextType {
  filters: DataFilters;
  updateDateRange: (range: { from: Date; to: Date }) => void;
  updateRepIds: (ids: string[]) => void;
  updateSentimentRange: (range: { min: number; max: number }) => void;
  updateKeywords: (keywords: string[]) => void;
  updateCustomerId: (id: string | null) => void;
  resetFilters: () => void;
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

  const resetFilters = () => {
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
        resetFilters,
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
