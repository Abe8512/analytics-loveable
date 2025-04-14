
import { create } from 'zustand';
import { RealTimeMetricData, SpeakerType } from '@/services/RealTimeMetrics.types';
import { calculateSilence } from '@/utils/metricCalculations';
import { EventsService } from '@/services/EventsService';
import { produce } from 'immer';

// Define the state interface
interface CallMetricsState {
  isRecording: boolean;
  callDuration: number;
  speakerActivity: Record<string, boolean>;
  talkRatioData: { agent: number; client: number };
  sentimentData: { agent: number; client: number };
  keyPhrasesList: any[];
  timeSegments: { start: number; end: number; speaker: SpeakerType }[];
  callHistory: any[];
  
  // Actions
  startRecording: () => void;
  stopRecording: () => void;
  updateCallDuration: (seconds: number) => void;
  updateSpeakerActivity: (speakerId: string, isActive: boolean) => void;
  updateTalkRatio: (agentPercentage: number, clientPercentage: number) => void;
  updateSentiment: (agent: number, client: number) => void;
  addKeyPhrase: (phrase: string) => void;
  recordSpeechSegment: (segment: { start: number; end: number; speaker: SpeakerType }) => void;
  loadPastCalls: () => void;
  addPastCall: (call: any) => void;
}

// Create the store
export const useCallMetricsStore = create<CallMetricsState>((set, get) => ({
  // State
  isRecording: false,
  callDuration: 0,
  speakerActivity: { agent: false, client: false },
  talkRatioData: { agent: 50, client: 50 },
  sentimentData: { agent: 0.5, client: 0.5 },
  keyPhrasesList: [],
  timeSegments: [],
  callHistory: [],
  
  // Actions
  startRecording: () => set({ isRecording: true, callDuration: 0 }),
  
  stopRecording: () => set({ isRecording: false }),
  
  updateCallDuration: (seconds) => {
    if (get().isRecording) {
      set({ callDuration: seconds });
    }
  },
  
  updateSpeakerActivity: (speakerId, isActive) => set(state => ({
    speakerActivity: {
      ...state.speakerActivity,
      [speakerId]: isActive
    }
  })),
  
  updateTalkRatio: (agentPercentage, clientPercentage) => set({
    talkRatioData: { agent: agentPercentage, client: clientPercentage }
  }),
  
  updateSentiment: (agent, client) => set({
    sentimentData: { agent, client }
  }),
  
  addKeyPhrase: (phrase) => set(state => ({
    keyPhrasesList: [...state.keyPhrasesList, phrase]
  })),
  
  recordSpeechSegment: (segment) => set(state => ({
    timeSegments: [...state.timeSegments, segment]
  })),
  
  loadPastCalls: () => {
    // Mock implementation to avoid errors
    set({ callHistory: [
      {
        id: 'call-1',
        date: new Date().toISOString(),
        duration: 120,
        sentiment: { agent: 0.7, customer: 0.6 },
        talkRatio: { agent: 60, customer: 40 },
        keyPhrases: ['feature request', 'pricing question']
      }
    ]});
  },
  
  addPastCall: (call) => set(state => ({
    callHistory: [...state.callHistory, call]
  }))
}));
