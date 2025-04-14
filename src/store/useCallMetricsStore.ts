import { create } from 'zustand';
import { RealTimeMetricData, SpeakerType } from '@/services/RealTimeMetrics.types';
import { calculateSilence, calculateTalkRatio } from '@/utils/metricCalculations';
import { v4 as uuidv4 } from 'uuid';
import { produce } from 'immer';
import { EventsStore } from '@/services/events/store';

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
  
  startRecording: () => {
    set({ isRecording: true, startTime: new Date(), endTime: null, coachingAlerts: [] });
  },
  stopRecording: () => {
    set({ isRecording: false, endTime: new Date() });
  },
  addUtterance: (utterance) => {
    set(state => ({ utterances: [...state.utterances, utterance] }));
    
    // Calculate talk ratio
    const newTalkRatioData = calculateTalkRatio(get().utterances);
    set({ talkRatioData: newTalkRatioData });
    
    // Calculate silence distribution
    const newSilenceDistributionData = calculateSilence(get().utterances);
    set({ silenceDistributionData: newSilenceDistributionData });
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
    set(produce((state: CallMetricsState) => {
      const alert = state.coachingAlerts.find(alert => alert.id === id);
      if (alert) {
        alert.dismissed = true;
      }
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
    });
  },
}));
