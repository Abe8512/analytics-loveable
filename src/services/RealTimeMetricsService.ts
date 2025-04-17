
import { supabase } from '@/integrations/supabase/client';
import { TeamPerformance } from '@/types/teamTypes';
import { createEmptyTeamPerformance, createEmptyCallVolume, createEmptyKeywordTrends, createEmptySentimentTrends } from '@/utils/emptyStateUtils';

export interface CallVolumeDataPoint {
  date: string;
  calls: number;
}

export interface KeywordTrend {
  keyword: string;
  count: number;
  category: string;
}

export interface SentimentTrend {
  date: string;
  avg_agent_sentiment: number;
  avg_customer_sentiment: number;
  positive_agent_calls: number;
  negative_agent_calls: number;
  total_calls: number;
}

export class RealTimeMetricsService {
  private teamPerformanceCache: TeamPerformance | null = null;
  private teamPerformanceCacheExpiry: Date | null = null;
  
  private callVolumeCache: CallVolumeDataPoint[] | null = null;
  private callVolumeCacheExpiry: Date | null = null;
  
  private keywordTrendsCache: KeywordTrend[] | null = null;
  private keywordTrendsCacheExpiry: Date | null = null;
  
  private sentimentTrendsCache: SentimentTrend[] | null = null;
  private sentimentTrendsCacheExpiry: Date | null = null;
  
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
  
  constructor() {
    this.setupRealtimeSubscriptions();
  }

  private setupRealtimeSubscriptions() {
    // Subscribe to call_metrics_summary table changes
    try {
      const channel = supabase.channel('public:call_metrics_summary')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'call_metrics_summary' 
        }, () => {
          console.log('RealTimeMetricsService: call_metrics_summary table changed');
          this.clearAllCaches();
        })
        .subscribe();
        
      console.log('Subscribed to call_metrics_summary changes');
      
      // Clean up on service destroy (if needed)
      window.addEventListener('beforeunload', () => {
        supabase.removeChannel(channel);
      });
    } catch (err) {
      console.error('Error setting up realtime subscriptions:', err);
    }
  }
  
  private clearAllCaches() {
    console.log('Clearing all metrics caches');
    this.teamPerformanceCache = null;
    this.teamPerformanceCacheExpiry = null;
    this.callVolumeCache = null;
    this.callVolumeCacheExpiry = null;
    this.keywordTrendsCache = null;
    this.keywordTrendsCacheExpiry = null;
    this.sentimentTrendsCache = null;
    this.sentimentTrendsCacheExpiry = null;
  }
  
  /**
   * Refresh all metrics data
   */
  public async refreshAll(force = false): Promise<void> {
    console.log('Refreshing all metrics data');
    
    await Promise.all([
      this.refreshTeamPerformanceImpl(force),
      this.refreshCallVolumeImpl(force),
      this.refreshKeywordTrendsImpl(force),
      this.refreshSentimentTrendsImpl(force)
    ]);
  }
  
  /**
   * Get team performance metrics
   */
  public async getTeamPerformance(force = false): Promise<TeamPerformance> {
    // Check cache first
    const now = new Date();
    if (!force && this.teamPerformanceCache && this.teamPerformanceCacheExpiry && this.teamPerformanceCacheExpiry > now) {
      return this.teamPerformanceCache;
    }
    
    try {
      console.log('Fetching team performance metrics...');
      
      // Try to get from DB - using call_metrics_summary instead since team_performance might not exist
      const { data, error } = await supabase
        .from('call_metrics_summary')
        .select('*')
        .single();
      
      if (error) {
        console.warn('Error fetching team performance:', error.message);
        return this.fallbackTeamPerformance();
      }
      
      if (!data) {
        console.log('No team performance data found');
        return this.fallbackTeamPerformance();
      }
      
      // Cache the result by mapping call_metrics_summary fields to TeamPerformance
      const teamPerformanceData: TeamPerformance = {
        active_reps: 0, // Not available in call_metrics_summary
        total_calls: data.total_calls || 0,
        avg_sentiment: data.avg_sentiment || 0.5,
        avg_duration: data.avg_duration || 0,
        positive_calls: data.positive_sentiment_count || 0,
        negative_calls: data.negative_sentiment_count || 0
      };
      
      this.teamPerformanceCache = teamPerformanceData;
      
      // Set cache expiry
      const expiry = new Date();
      expiry.setTime(expiry.getTime() + this.CACHE_TTL_MS);
      this.teamPerformanceCacheExpiry = expiry;
      
      return teamPerformanceData;
    } catch (err) {
      console.error('Exception in getTeamPerformance:', err);
      return this.fallbackTeamPerformance();
    }
  }
  
  /**
   * Get call volume by day
   */
  public async getCallVolume(days = 7, force = false): Promise<CallVolumeDataPoint[]> {
    // Check cache first
    const now = new Date();
    if (!force && this.callVolumeCache && this.callVolumeCacheExpiry && this.callVolumeCacheExpiry > now) {
      return this.callVolumeCache;
    }
    
    try {
      console.log(`Fetching call volume for ${days} days...`);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);
      
      // Since call_volume_by_day might not exist, let's use call_metrics_summary with a date filter
      const { data, error } = await supabase
        .from('call_metrics_summary')
        .select('report_date, total_calls')
        .gte('report_date', startDate.toISOString().split('T')[0])
        .lte('report_date', endDate.toISOString().split('T')[0])
        .order('report_date');
      
      if (error) {
        console.warn('Error fetching call volume:', error.message);
        return this.fallbackCallVolume(days);
      }
      
      if (!data || data.length === 0) {
        console.log('No call volume data found');
        return this.fallbackCallVolume(days);
      }
      
      // Map to required format
      const callVolumeData: CallVolumeDataPoint[] = data.map(item => ({
        date: item.report_date,
        calls: item.total_calls || 0
      }));
      
      // Cache the result
      this.callVolumeCache = callVolumeData;
      
      // Set cache expiry
      const expiry = new Date();
      expiry.setTime(expiry.getTime() + this.CACHE_TTL_MS);
      this.callVolumeCacheExpiry = expiry;
      
      return callVolumeData;
    } catch (err) {
      console.error('Exception in getCallVolume:', err);
      return this.fallbackCallVolume(days);
    }
  }
  
  /**
   * Get trending keywords
   */
  public async getKeywordTrends(limit = 10, force = false): Promise<KeywordTrend[]> {
    // Check cache first
    const now = new Date();
    if (!force && this.keywordTrendsCache && this.keywordTrendsCacheExpiry && this.keywordTrendsCacheExpiry > now) {
      return this.keywordTrendsCache;
    }
    
    try {
      console.log(`Fetching keyword trends (limit: ${limit})...`);
      
      // Try to get from DB
      const { data, error } = await supabase
        .from('keyword_trends')
        .select('*')
        .order('count', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.warn('Error fetching keyword trends:', error.message);
        return this.fallbackKeywordTrends();
      }
      
      if (!data || data.length === 0) {
        console.log('No keyword trends data found');
        return this.fallbackKeywordTrends();
      }
      
      // Map to required format
      const keywordTrendsData: KeywordTrend[] = data.map(item => ({
        keyword: item.keyword || 'Unknown',
        count: item.count || 0,
        category: item.category || 'misc'
      }));
      
      // Cache the result
      this.keywordTrendsCache = keywordTrendsData;
      
      // Set cache expiry
      const expiry = new Date();
      expiry.setTime(expiry.getTime() + this.CACHE_TTL_MS);
      this.keywordTrendsCacheExpiry = expiry;
      
      return keywordTrendsData;
    } catch (err) {
      console.error('Exception in getKeywordTrends:', err);
      return this.fallbackKeywordTrends();
    }
  }
  
  /**
   * Get sentiment trends over time
   */
  public async getSentimentTrends(days = 7, force = false): Promise<SentimentTrend[]> {
    // Check cache first
    const now = new Date();
    if (!force && this.sentimentTrendsCache && this.sentimentTrendsCacheExpiry && this.sentimentTrendsCacheExpiry > now) {
      return this.sentimentTrendsCache;
    }
    
    try {
      console.log(`Fetching sentiment trends for ${days} days...`);
      
      // Generate demo data since the table might not exist
      return this.fallbackSentimentTrends(days);
    } catch (err) {
      console.error('Exception in getSentimentTrends:', err);
      return this.fallbackSentimentTrends(days);
    }
  }
  
  // Fallback methods for when DB queries fail
  private fallbackTeamPerformance(): TeamPerformance {
    console.log('Using fallback team performance data');
    return createEmptyTeamPerformance();
  }
  
  private fallbackCallVolume(days = 7): CallVolumeDataPoint[] {
    console.log('Using fallback call volume data');
    return createEmptyCallVolume(days);
  }
  
  private fallbackKeywordTrends(): KeywordTrend[] {
    console.log('Using fallback keyword trends data');
    return createEmptyKeywordTrends();
  }
  
  private fallbackSentimentTrends(days = 7): SentimentTrend[] {
    console.log('Using fallback sentiment trends data');
    return createEmptySentimentTrends(days);
  }
  
  // Implementation methods for refresh functions referenced in refreshAll
  private async refreshTeamPerformanceImpl(force = false): Promise<void> {
    console.log('Refreshing team performance data');
    await this.getTeamPerformance(force);
  }
  
  private async refreshCallVolumeImpl(force = false): Promise<void> {
    console.log('Refreshing call volume data');
    await this.getCallVolume(7, force);
  }
  
  private async refreshKeywordTrendsImpl(force = false): Promise<void> {
    console.log('Refreshing keyword trends data');
    await this.getKeywordTrends(10, force);
  }
  
  private async refreshSentimentTrendsImpl(force = false): Promise<void> {
    console.log('Refreshing sentiment trends data');
    await this.getSentimentTrends(7, force);
  }
}

// Create and export a singleton instance
export const realTimeMetricsService = new RealTimeMetricsService();
