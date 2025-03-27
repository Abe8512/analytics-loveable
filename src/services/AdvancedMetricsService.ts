
import { supabase } from "@/integrations/supabase/client";

export interface AdvancedMetric {
  name: string;
  callVolume: number;
  sentiment: number;
  conversion: number;
}

export class AdvancedMetricsService {
  /**
   * Get advanced metrics for charting and deeper analysis
   */
  static async getAdvancedMetrics(options?: {
    period?: 'day' | 'week' | 'month' | 'year';
    groupBy?: 'day' | 'week' | 'month';
    limit?: number;
  }): Promise<AdvancedMetric[]> {
    try {
      // Default options
      const period = options?.period || 'month';
      const groupBy = options?.groupBy || 'month';
      const limit = options?.limit || 6;
      
      // Build date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case 'day':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }
      
      // Query call_metrics_summary
      const { data, error } = await supabase
        .from('call_metrics_summary')
        .select('*')
        .gte('report_date', startDate.toISOString().split('T')[0])
        .lte('report_date', endDate.toISOString().split('T')[0])
        .order('report_date', { ascending: false })
        .limit(limit);
        
      if (error) {
        console.error('Error fetching advanced metrics:', error);
        return this.generateDemoAdvancedMetrics(limit);
      }
      
      if (!data || data.length === 0) {
        console.log('No advanced metrics data available, using demo values');
        return this.generateDemoAdvancedMetrics(limit);
      }
      
      // Transform data for charting
      const metrics: AdvancedMetric[] = data.map(record => {
        // Format date based on groupBy
        let name = '';
        const date = new Date(record.report_date);
        
        switch (groupBy) {
          case 'day':
            name = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            break;
          case 'week':
            // Get the week number
            const weekNum = Math.ceil((date.getDate() + 
              new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
            name = `Week ${weekNum}`;
            break;
          case 'month':
          default:
            name = date.toLocaleDateString(undefined, { month: 'short' });
            break;
        }
        
        return {
          name,
          callVolume: record.total_calls || 0,
          sentiment: Math.round((record.avg_sentiment || 0.5) * 100),
          conversion: Math.round((record.conversion_rate || 0) * 100)
        };
      });
      
      // Reverse to show oldest to newest (left to right on chart)
      return metrics.reverse();
      
    } catch (error) {
      console.error('Error in getAdvancedMetrics:', error);
      return this.generateDemoAdvancedMetrics();
    }
  }
  
  /**
   * Generate demo advanced metrics for display when no real data is available
   */
  static generateDemoAdvancedMetrics(count: number = 6): AdvancedMetric[] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return Array.from({ length: count }, (_, i) => {
      const monthIndex = (currentMonth - count + i + 1 + 12) % 12;
      return {
        name: months[monthIndex],
        callVolume: 100 + Math.floor(Math.random() * 80),
        sentiment: 65 + Math.floor(Math.random() * 20),
        conversion: 25 + Math.floor(Math.random() * 20)
      };
    });
  }
}
