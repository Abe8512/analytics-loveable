
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { EventsService } from './EventsService';
import { EventType } from '@/services/events/types';
import { RealTimeMetricData, MetricUpdate, MetricUpdateType, MetricValue, SpeakerType } from './RealTimeMetrics.types';

class RealTimeMetricsService {
  private metrics$ = new Subject<MetricUpdate>();
  private isActive = false;
  private metricHistory: MetricUpdate[] = [];
  
  constructor() {
    // Initialize the service
    this.setupEventListeners();
  }
  
  private setupEventListeners() {
    // Listen for relevant events from the events service
    EventsService.addEventListener('call-started' as EventType, () => {
      this.startSession();
    });
    
    EventsService.addEventListener('call-ended' as EventType, () => {
      this.endSession();
    });
  }
  
  public startSession() {
    this.isActive = true;
    this.metricHistory = [];
    this.publishMetric('speech', { text: 'Call recording started', speaker: 'agent' as SpeakerType });
  }
  
  public endSession() {
    this.isActive = false;
    this.publishMetric('speech', { text: 'Call recording ended', speaker: 'agent' as SpeakerType });
  }
  
  public publishMetric(type: MetricUpdateType, value: MetricValue) {
    if (!this.isActive) return;
    
    const update: MetricUpdate = {
      type,
      timestamp: Date.now(),
      value
    };
    
    this.metricHistory.push(update);
    this.metrics$.next(update);
  }
  
  public getMetricStream(): Observable<MetricUpdate> {
    return this.metrics$.asObservable();
  }
  
  public getFilteredStream(type: MetricUpdateType): Observable<MetricValue> {
    return this.metrics$.pipe(
      filter(update => update.type === type),
      map(update => update.value)
    );
  }
  
  public getSpeechStream(): Observable<MetricValue> {
    return this.getFilteredStream('speech');
  }
  
  public getSentimentStream(): Observable<MetricValue> {
    return this.getFilteredStream('sentiment');
  }
}

// Export singleton instance
export const realTimeMetricsService = new RealTimeMetricsService();
