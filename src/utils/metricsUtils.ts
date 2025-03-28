
import { supabase } from '@/integrations/supabase/client';
import { generateDemoCallMetrics, generateDemoRepMetricsData } from '@/services/DemoDataService';
import { RawMetricsRecord, FormattedMetrics } from '@/types/metrics';
import { createDemoMetricsData, formatMetricsForDisplay as formatMetrics } from './metricsProcessor';

/**
 * Checks if metrics data is available in the database
 * @returns {Promise<boolean>} True if metrics data exists
 */
export const checkMetricsAvailability = async (): Promise<boolean> => {
  try {
    console.log('Checking for metrics data availability...');
    const { data, error } = await supabase
      .from('call_metrics_summary')
      .select('count(*)', { count: 'exact' })
      .limit(1);
      
    if (error) {
      console.error('Error checking metrics availability:', error);
      return false;
    }
    
    // Use count if available, otherwise check if data array has length
    const count = (data as any)?.count ?? (Array.isArray(data) ? data.length : 0);
    console.log(`Found ${count} metrics records`);
    return count > 0;
  } catch (err) {
    console.error('Exception in checkMetricsAvailability:', err);
    return false;
  }
};

/**
 * Gets metrics data from the database
 * @param {number} days Number of days to retrieve
 * @returns {Promise<RawMetricsRecord[]>} Metrics data array
 */
export const getMetricsData = async (days = 7): Promise<RawMetricsRecord[]> => {
  try {
    console.log(`Fetching metrics data for last ${days} days...`);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('call_metrics_summary')
      .select('*')
      .gte('report_date', startDate.toISOString().split('T')[0])
      .order('report_date', { ascending: false });
      
    if (error) {
      console.error('Error fetching metrics data:', error);
      console.log('Falling back to demo data');
      return generateDemoCallMetrics() as RawMetricsRecord[];
    }
    
    if (!data || data.length === 0) {
      console.log('No metrics data found, using demo data');
      return generateDemoCallMetrics() as RawMetricsRecord[];
    }
    
    console.log(`Successfully retrieved ${data.length} metrics records`);
    return data as RawMetricsRecord[];
  } catch (err) {
    console.error('Exception in getMetricsData:', err);
    console.log('Falling back to demo data');
    return generateDemoCallMetrics() as RawMetricsRecord[];
  }
};

/**
 * Gets rep metrics data or falls back to demo data
 * @param {number} count Number of reps to retrieve
 * @returns {Promise<any[]>} Rep metrics data array
 */
export const getRepMetricsData = async (count = 5) => {
  try {
    console.log('Fetching rep metrics data...');
    const { data, error } = await supabase
      .from('rep_metrics_summary')
      .select('*')
      .order('call_volume', { ascending: false })
      .limit(count);
      
    if (error) {
      console.error('Error fetching rep metrics data:', error);
      console.log('Falling back to demo rep data');
      return generateDemoRepMetricsData(count);
    }
    
    if (!data || data.length === 0) {
      console.log('No rep metrics data found, using demo data');
      return generateDemoRepMetricsData(count);
    }
    
    console.log(`Successfully retrieved ${data.length} rep metrics records`);
    return data;
  } catch (err) {
    console.error('Exception in getRepMetricsData:', err);
    console.log('Falling back to demo rep data');
    return generateDemoRepMetricsData(count);
  }
};

/**
 * Formats metrics for display
 * @param {RawMetricsRecord} metrics Raw metrics data
 * @returns {FormattedMetrics | null} Formatted metrics
 */
export const formatMetricsForDisplay = formatMetrics;
