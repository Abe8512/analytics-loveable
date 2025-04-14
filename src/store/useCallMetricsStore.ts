
import { create } from 'zustand';

export interface TalkRatio {
  agent: number;
  customer: number;
}

export interface CallMetricsState {
  sentiment: number | string | null;
  duration: number;
  talkRatio: TalkRatio;
  callScore: number;
  keywords: string[];
  callHistory: any[];
  isRecording: boolean;
}

export const useCallMetricsStore = create<CallMetricsState & {
  setSentiment: (sentiment: number | string | null) => void;
  setDuration: (duration: number) => void;
  setTalkRatio: (talkRatio: TalkRatio) => void;
  setCallScore: (score: number) => void;
  setKeywords: (keywords: string[]) => void;
  setIsRecording: (isRecording: boolean) => void;
  addCallToHistory: (call: any) => void;
  loadPastCalls: () => void;
  clearMetrics: () => void;
}>((set) => ({
  sentiment: null,
  duration: 0,
  talkRatio: { agent: 50, customer: 50 },
  callScore: 0,
  keywords: [],
  callHistory: [],
  isRecording: false,

  setSentiment: (sentiment) => set({ sentiment }),
  setDuration: (duration) => set({ duration }),
  setTalkRatio: (talkRatio) => set({ talkRatio }),
  setCallScore: (callScore) => set({ callScore }),
  setKeywords: (keywords) => set({ keywords }),
  setIsRecording: (isRecording) => set({ isRecording }),
  
  addCallToHistory: (call) => set((state) => ({ 
    callHistory: [call, ...state.callHistory] 
  })),
  
  loadPastCalls: () => {
    // In a real app, this would call an API
    // For now, we'll just generate some fake data
    set({
      callHistory: [
        {
          id: 'call-1',
          date: new Date().toISOString(),
          duration: 300,
          sentiment: 0.8,
          talkRatio: { agent: 60, customer: 40 },
          keyPhrases: [
            { text: "pricing", sentiment: 0.6 },
            { text: "features", sentiment: 0.9 }
          ]
        },
        {
          id: 'call-2',
          date: new Date(Date.now() - 86400000).toISOString(), // yesterday
          duration: 480,
          sentiment: 0.4,
          talkRatio: { agent: 50, customer: 50 },
          keyPhrases: [
            { text: "support", sentiment: 0.3 },
            { text: "competitive", sentiment: 0.7 }
          ]
        }
      ]
    });
  },
  
  clearMetrics: () => set({
    sentiment: null,
    duration: 0,
    talkRatio: { agent: 50, customer: 50 },
    callScore: 0,
    keywords: []
  })
}));
