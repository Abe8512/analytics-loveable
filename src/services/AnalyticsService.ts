
import { supabase } from "@/integrations/supabase/client";
import { CallMetrics, RepMetrics } from "@/types/analytics";

// Define the date range type
export type DateRange = { from: Date; to: Date } | null;

// AnalyticsService class for handling analytics data
export class AnalyticsService {
  /**
   * Get call metrics from the database for the specified date range
   */
  public async getCallMetrics(dateRange: DateRange): Promise<CallMetrics> {
    try {
      // Default metrics
      const defaultMetrics: CallMetrics = {
        totalCalls: 0,
        totalDuration: 0,
        avgDuration: 0,
        avgSentiment: 0.5,
        positiveCalls: 0,
        neutralCalls: 0,
        negativeCalls: 0,
        dailyMetrics: []
      };
      
      // If no date range, return defaults
      if (!dateRange) {
        return defaultMetrics;
      }
      
      // Format dates for query
      const fromDate = dateRange.from.toISOString();
      const toDate = dateRange.to.toISOString();
      
      // First try the call_metrics_summary table for aggregated data
      const { data: summaryData, error: summaryError } = await supabase
        .from('call_metrics_summary')
        .select('*')
        .gte('report_date', dateRange.from.toISOString().split('T')[0])
        .lte('report_date', dateRange.to.toISOString().split('T')[0])
        .order('report_date', { ascending: true });
      
      if (summaryError) {
        console.error('Error fetching call metrics summary:', summaryError);
        // Fallback to raw calls data
        return this.getCallMetricsFromCalls(dateRange);
      }
      
      // If we have summary data, use it
      if (summaryData && summaryData.length > 0) {
        let totalCalls = 0;
        let totalDuration = 0;
        const sentimentSum = { 
          total: 0, 
          positive: 0, 
          negative: 0, 
          neutral: 0 
        };
        
        // Map the data to our metrics format and calculate totals
        const dailyMetrics = summaryData.map(day => {
          totalCalls += day.total_calls || 0;
          totalDuration += day.total_duration || 0;
          sentimentSum.positive += day.positive_sentiment_count || 0;
          sentimentSum.negative += day.negative_sentiment_count || 0;
          sentimentSum.neutral += day.neutral_sentiment_count || 0;
          sentimentSum.total += day.total_calls || 0;
          
          return {
            date: new Date(day.report_date),
            calls: day.total_calls || 0,
            duration: day.total_duration || 0,
            avgDuration: day.avg_duration || 0,
            sentiment: day.avg_sentiment || 0.5,
            positiveCalls: day.positive_sentiment_count || 0,
            negativeCalls: day.negative_sentiment_count || 0,
            neutralCalls: day.neutral_sentiment_count || 0
          };
        });
        
        // Calculate averages and return
        return {
          totalCalls,
          totalDuration,
          avgDuration: totalCalls > 0 ? totalDuration / totalCalls : 0,
          avgSentiment: sentimentSum.total > 0 ? 
            ((sentimentSum.positive * 0.8) + (sentimentSum.neutral * 0.5) + (sentimentSum.negative * 0.2)) / sentimentSum.total : 0.5,
          positiveCalls: sentimentSum.positive,
          neutralCalls: sentimentSum.neutral,
          negativeCalls: sentimentSum.negative,
          dailyMetrics
        };
      } else {
        // If no summary data, calculate from raw calls
        return this.getCallMetricsFromCalls(dateRange);
      }
    } catch (error) {
      console.error('Error in getCallMetrics:', error);
      return {
        totalCalls: 0,
        totalDuration: 0,
        avgDuration: 0,
        avgSentiment: 0.5,
        positiveCalls: 0,
        neutralCalls: 0,
        negativeCalls: 0,
        dailyMetrics: []
      };
    }
  }
  
  /**
   * Calculate call metrics directly from calls table
   */
  private async getCallMetricsFromCalls(dateRange: DateRange): Promise<CallMetrics> {
    try {
      // Format dates for query
      const fromDate = dateRange?.from.toISOString() || '';
      const toDate = dateRange?.to.toISOString() || '';
      
      // Get all calls in date range
      const { data: calls, error } = await supabase
        .from('calls')
        .select('*')
        .gte('created_at', fromDate)
        .lte('created_at', toDate)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching calls:', error);
        throw error;
      }
      
      if (!calls || calls.length === 0) {
        return {
          totalCalls: 0,
          totalDuration: 0,
          avgDuration: 0,
          avgSentiment: 0.5,
          positiveCalls: 0,
          neutralCalls: 0,
          negativeCalls: 0,
          dailyMetrics: []
        };
      }
      
      // Group by day
      const callsByDay = calls.reduce((acc, call) => {
        const date = new Date(call.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(call);
        return acc;
      }, {} as Record<string, any[]>);
      
      // Calculate daily metrics
      const dailyMetrics = Object.entries(callsByDay).map(([dateStr, dayCalls]) => {
        const positiveCalls = dayCalls.filter(c => (c.sentiment_agent || 0.5) > 0.66).length;
        const negativeCalls = dayCalls.filter(c => (c.sentiment_agent || 0.5) < 0.33).length;
        const neutralCalls = dayCalls.length - positiveCalls - negativeCalls;
        
        const totalDuration = dayCalls.reduce((sum, call) => sum + (call.duration || 0), 0);
        
        return {
          date: new Date(dateStr),
          calls: dayCalls.length,
          duration: totalDuration,
          avgDuration: dayCalls.length > 0 ? totalDuration / dayCalls.length : 0,
          sentiment: dayCalls.reduce((sum, call) => sum + (call.sentiment_agent || 0.5), 0) / dayCalls.length,
          positiveCalls,
          negativeCalls,
          neutralCalls
        };
      });
      
      // Sort by date
      dailyMetrics.sort((a, b) => a.date.getTime() - b.date.getTime());
      
      // Calculate totals
      const totalCalls = calls.length;
      const totalDuration = calls.reduce((sum, call) => sum + (call.duration || 0), 0);
      const positiveCalls = calls.filter(c => (c.sentiment_agent || 0.5) > 0.66).length;
      const negativeCalls = calls.filter(c => (c.sentiment_agent || 0.5) < 0.33).length;
      const neutralCalls = totalCalls - positiveCalls - negativeCalls;
      
      return {
        totalCalls,
        totalDuration,
        avgDuration: totalCalls > 0 ? totalDuration / totalCalls : 0,
        avgSentiment: calls.reduce((sum, call) => sum + (call.sentiment_agent || 0.5), 0) / totalCalls,
        positiveCalls,
        neutralCalls,
        negativeCalls,
        dailyMetrics
      };
    } catch (error) {
      console.error('Error in getCallMetricsFromCalls:', error);
      return {
        totalCalls: 0,
        totalDuration: 0,
        avgDuration: 0,
        avgSentiment: 0.5,
        positiveCalls: 0,
        neutralCalls: 0,
        negativeCalls: 0,
        dailyMetrics: []
      };
    }
  }
  
  /**
   * Get sentiment trends from the database
   */
  public async getSentimentTrends(dateRange: DateRange): Promise<any[]> {
    try {
      // Default empty array
      if (!dateRange) {
        return [];
      }
      
      // Format dates for query
      const fromDate = dateRange.from.toISOString();
      const toDate = dateRange.to.toISOString();
      
      // Query the sentiment_trends table directly
      const { data, error } = await supabase
        .from('sentiment_trends')
        .select('*')
        .gte('recorded_at', fromDate)
        .lte('recorded_at', toDate)
        .order('recorded_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching sentiment trends:', error);
        return [];
      }
      
      // Group by day and sentiment
      const trendsByDay = data?.reduce((acc, trend) => {
        const date = new Date(trend.recorded_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = {
            date,
            positive: 0,
            negative: 0,
            neutral: 0,
            average: 0,
            total: 0
          };
        }
        
        acc[date][trend.sentiment_label] += 1;
        acc[date].total += 1;
        
        // Calculate sentiment value
        const value = trend.sentiment_label === 'positive' ? 0.8 : 
                     trend.sentiment_label === 'negative' ? 0.2 : 0.5;
        acc[date].average += value;
        
        return acc;
      }, {} as Record<string, any>);
      
      // Calculate averages and convert to array
      return Object.values(trendsByDay || {}).map(day => ({
        ...day,
        average: day.total > 0 ? day.average / day.total : 0.5
      }));
    } catch (error) {
      console.error('Error in getSentimentTrends:', error);
      return [];
    }
  }
  
  /**
   * Get keyword analysis data
   */
  public async getKeywordAnalysis(dateRange: DateRange): Promise<any[]> {
    try {
      // Default empty array
      if (!dateRange) {
        return [];
      }
      
      // Format dates for query
      const fromDate = dateRange.from.toISOString();
      const toDate = dateRange.to.toISOString();
      
      // Query the keyword_trends table directly
      const { data, error } = await supabase
        .from('keyword_trends')
        .select('keyword, category, count, last_used')
        .gte('last_used', fromDate)
        .lte('last_used', toDate)
        .order('count', { ascending: false })
        .limit(30);
      
      if (error) {
        console.error('Error fetching keyword analysis:', error);
        return [];
      }
      
      // Group by keyword and calculate totals
      const keywordMap = (data || []).reduce((acc, item) => {
        if (!acc[item.keyword]) {
          acc[item.keyword] = {
            keyword: item.keyword,
            total: 0,
            positive: 0,
            neutral: 0, 
            negative: 0,
            first_seen: item.last_used,
            last_seen: item.last_used
          };
        }
        
        acc[item.keyword].total += item.count;
        acc[item.keyword][item.category] += item.count;
        
        // Update first/last seen
        if (new Date(item.last_used) < new Date(acc[item.keyword].first_seen)) {
          acc[item.keyword].first_seen = item.last_used;
        }
        if (new Date(item.last_used) > new Date(acc[item.keyword].last_seen)) {
          acc[item.keyword].last_seen = item.last_used;
        }
        
        return acc;
      }, {} as Record<string, any>);
      
      // Convert to array and sort by total
      return Object.values(keywordMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, 20);
    } catch (error) {
      console.error('Error in getKeywordAnalysis:', error);
      return [];
    }
  }
  
  /**
   * Get rep metrics from the database
   */
  public async getRepMetrics(dateRange: DateRange): Promise<RepMetrics[]> {
    try {
      // Default empty array
      if (!dateRange) {
        return [];
      }
      
      // Query rep_metrics_summary table
      const { data, error } = await supabase
        .from('rep_metrics_summary')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error || !data) {
        console.error('Error fetching rep metrics:', error);
        return [];
      }
      
      // Map the data to our metrics format
      return data.map(rep => ({
        repId: rep.rep_id,
        repName: rep.rep_name || `Rep ${rep.rep_id.substring(0, 5)}`,
        callVolume: rep.call_volume || 0,
        sentimentScore: rep.sentiment_score || 0.5,
        successRate: rep.success_rate || 0,
        topKeywords: rep.top_keywords || [],
        insights: rep.insights || []
      }));
    } catch (error) {
      console.error('Error in getRepMetrics:', error);
      return [];
    }
  }
}

export const analyticsService = new AnalyticsService();
