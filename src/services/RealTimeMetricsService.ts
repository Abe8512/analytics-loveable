
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSharedTeamMetrics, useSharedRepMetrics, DataFilters, TeamMetricsData, RepMetricsData } from "@/services/SharedDataService";

// Re-export the types from SharedDataService
export type { TeamMetricsData, RepMetricsData };

/**
 * Service for real-time metrics updates
 */
export const realTimeMetricsService = {
  /**
   * Subscribe to real-time updates for a table
   */
  subscribeToTable(
    tableName: string,
    callback: (payload: any) => void
  ): () => void {
    try {
      const channel = supabase
        .channel('table-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: tableName,
          },
          (payload) => {
            console.log(`Real-time update from ${tableName}:`, payload);
            callback(payload);
          }
        )
        .subscribe();

      // Return unsubscribe function
      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error(`Error subscribing to ${tableName}:`, error);
      return () => {}; // Empty cleanup function
    }
  },

  /**
   * Enable real-time updates for a table
   */
  async enableRealTimeForTable(tableName: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc(
        'add_table_to_realtime_publication',
        { table_name: tableName }
      );

      if (error) {
        console.error(`Error enabling real-time for ${tableName}:`, error);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Exception enabling real-time for ${tableName}:`, error);
      return false;
    }
  },
};

/**
 * Hook for real-time team metrics
 */
export const useTeamMetrics = (filters: DataFilters = {}) => {
  // Use the shared team metrics hook from SharedDataService
  return useSharedTeamMetrics(filters);
};

/**
 * Hook for real-time rep metrics
 */
export const useRepMetrics = (filters: DataFilters = {}) => {
  // Use the shared rep metrics hook from SharedDataService
  return useSharedRepMetrics(filters);
};
