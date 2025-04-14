
import { create } from 'zustand';
import { RealTimeMetricData, SpeakerType } from '@/services/RealTimeMetrics.types';
import { EventsStore } from '@/services/events/store';
import { v4 as uuidv4 } from 'uuid';

// Mock implementation of calculateSilence and calculateTalkRatio
const calculateSilence = (utterances: RealTimeMetricData[]): number[] => {
  return [5, 8, 3, 12, 7]; // Mock implementation
};

const calculateTalkRatio = (utterances: RealTimeMetricData[]): { agent: number; client: number }[] => {
  return [{ agent: 60, client: 40 }, { agent: 55, client: 45 }]; // Mock implementation
};

interface CallMetricsState {
  isRecording: boolean;
  startTime: Date | null;
  endTime: Date | null;
  utterances: RealTimeMetricData[];
  currentSpeaker: SpeakerType | null;
  objectionHandlingScore: number | null;
  discoveryQuestionsRate: number | null;
  closingTechniquesScore: number | null;
  clientEngagementScore: number | null;
  followUpCommitmentRate: number | null;
  painPointIdentificationScore: number | null;
  silencePercentage: number | null;
  talkRatioData: { agent: number; client: number }[];
  silenceDistributionData: number[];
  coachingAlerts: { id: string; type: 'warning' | 'info' | 'critical'; message: string; dismissed?: boolean }[];
  
  // Added properties needed by components
  duration: number;
  talkRatio: { agent: number; client: number };
  sentiment: { agent: number; customer: number };
  isTalkingMap: Record<string, boolean>;
  keyPhrases: string[];
  callHistory: any[];
  loadPastCalls: () => void;
  updateCallMetrics: (metrics: any) => void;
  
  // Original methods
  startRecording: () => void;
  stopRecording: () => void;
  addUtterance: (utterance: RealTimeMetricData) => void;
  setCurrentSpeaker: (speaker: SpeakerType | null) => void;
  setMetricScores: (scores: {
    objectionHandlingScore: number;
    discoveryQuestionsRate: number;
    closingTechniquesScore: number;
    clientEngagementScore: number;
    followUpCommitmentRate: number;
    painPointIdentificationScore: number;
  }) => void;
  setSilencePercentage: (percentage: number | null) => void;
  addCoachingAlert: (type: 'warning' | 'info' | 'critical', message: string) => void;
  dismissAlert: (id: string) => void;
  clearAlerts: () => void;
  clearMetrics: () => void;
}

export const useCallMetricsStore = create<CallMetricsState>((set, get) => ({
  isRecording: false,
  startTime: null,
  endTime: null,
  utterances: [],
  currentSpeaker: null,
  objectionHandlingScore: null,
  discoveryQuestionsRate: null,
  closingTechniquesScore: null,
  clientEngagementScore: null,
  followUpCommitmentRate: null,
  painPointIdentificationScore: null,
  silencePercentage: null,
  talkRatioData: [],
  silenceDistributionData: [],
  coachingAlerts: [],
  
  // Added properties with default values
  duration: 0,
  talkRatio: { agent: 50, client: 50 },
  sentiment: { agent: 0.5, customer: 0.5 },
  isTalkingMap: {},
  keyPhrases: [],
  callHistory: [],
  
  // Added methods
  loadPastCalls: () => {
    // Mock implementation
    set({
      callHistory: [
        {
          id: 'call-1',
          date: new Date().toISOString(),
          duration: 300,
          sentiment: { agent: 0.7, customer: 0.6 },
          talkRatio: { agent: 60, customer: 40 },
          keyPhrases: ['pricing', 'features', 'implementation', 'timeline']
        }
      ]
    });
    console.log('Past calls loaded');
  },
  
  updateCallMetrics: (metrics) => {
    set({ ...metrics });
  },
  
  // Original methods
  startRecording: () => {
    const now = new Date();
    set({ 
      isRecording: true, 
      startTime: now, 
      endTime: null, 
      coachingAlerts: [],
      duration: 0,
      keyPhrases: []
    });
    
    // Start a timer to update duration
    const intervalId = setInterval(() => {
      const startTime = get().startTime;
      if (startTime) {
        const durationSec = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
        set({ duration: durationSec });
      }
    }, 1000);
    
    // Store the interval ID somewhere or clear it when recording stops
  },
  
  stopRecording: () => {
    set({ isRecording: false, endTime: new Date() });
    // Clear the duration update interval if you stored it
  },
  
  addUtterance: (utterance) => {
    set(state => ({ utterances: [...state.utterances, utterance] }));
    
    // Calculate talk ratio
    const newTalkRatioData = calculateTalkRatio(get().utterances);
    
    // Set the current talkRatio from the latest calculation
    const latestTalkRatio = newTalkRatioData[newTalkRatioData.length - 1] || { agent: 50, client: 50 };
    
    set({ 
      talkRatioData: newTalkRatioData,
      talkRatio: latestTalkRatio
    });
    
    // Calculate silence distribution
    const newSilenceDistributionData = calculateSilence(get().utterances);
    set({ silenceDistributionData: newSilenceDistributionData });
    
    // Update keyPhrases based on utterance
    if (utterance.keywords && utterance.keywords.length > 0) {
      set(state => ({
        keyPhrases: [...state.keyPhrases, ...utterance.keywords || []]
      }));
    }
    
    // Update sentiment
    if (typeof utterance.sentiment === 'number') {
      set(state => {
        const newSentiment = { ...state.sentiment };
        if (utterance.speaker === 'agent') {
          newSentiment.agent = (newSentiment.agent * 0.8) + (utterance.sentiment || 0.5) * 0.2;
        } else if (utterance.speaker === 'client') {
          newSentiment.customer = (newSentiment.customer * 0.8) + (utterance.sentiment || 0.5) * 0.2;
        }
        return { sentiment: newSentiment };
      });
    }
    
    // Update isTalkingMap
    set(state => ({
      isTalkingMap: {
        ...state.isTalkingMap,
        [utterance.speaker]: true
      }
    }));
    
    // After 2 seconds, set talking to false
    setTimeout(() => {
      set(state => ({
        isTalkingMap: {
          ...state.isTalkingMap,
          [utterance.speaker]: false
        }
      }));
    }, 2000);
  },
  
  setCurrentSpeaker: (speaker) => {
    set({ currentSpeaker: speaker });
  },
  
  setMetricScores: (scores) => {
    set({
      objectionHandlingScore: scores.objectionHandlingScore,
      discoveryQuestionsRate: scores.discoveryQuestionsRate,
      closingTechniquesScore: scores.closingTechniquesScore,
      clientEngagementScore: scores.clientEngagementScore,
      followUpCommitmentRate: scores.followUpCommitmentRate,
      painPointIdentificationScore: scores.painPointIdentificationScore,
    });
  },
  
  setSilencePercentage: (percentage) => {
    set({ silencePercentage: percentage });
  },
  
  addCoachingAlert: (type, message) => {
    const id = uuidv4();
    set(state => ({
      coachingAlerts: [...state.coachingAlerts, { id, type, message }]
    }));
  },
  
  dismissAlert: (id) => {
    set(state => ({
      coachingAlerts: state.coachingAlerts.map(alert =>
        alert.id === id ? { ...alert, dismissed: true } : alert
      )
    }));
  },
  
  clearAlerts: () => {
    set({ coachingAlerts: [] });
  },
  
  clearMetrics: () => {
    set({
      utterances: [],
      currentSpeaker: null,
      objectionHandlingScore: null,
      discoveryQuestionsRate: null,
      closingTechniquesScore: null,
      clientEngagementScore: null,
      followUpCommitmentRate: null,
      painPointIdentificationScore: null,
      silencePercentage: null,
      talkRatioData: [],
      silenceDistributionData: [],
      coachingAlerts: [],
      duration: 0,
      talkRatio: { agent: 50, client: 50 },
      sentiment: { agent: 0.5, customer: 0.5 },
      isTalkingMap: {},
      keyPhrases: []
    });
  },
}));
