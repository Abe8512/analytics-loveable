
import { create } from 'zustand';
import { produce } from 'immer';
import { SpeakerType, TalkRatio, KeyPhrase } from '@/services/RealTimeMetrics.types';

interface CoachingAlert {
  id: string;
  message: string;
  type: 'warning' | 'info' | 'success';
  timestamp: number;
  dismissed?: boolean;
}

export interface CallHistory {
  id: string;
  date: string;
  duration: number;
  sentiment: number;
  prospect: string;
  transcript?: string;
}

export interface CallMetricsState {
  isRecording: boolean;
  recordingStartTime: number | null;
  duration: number;
  talkRatio: TalkRatio;
  sentiment: number;
  isTalkingMap: {
    agent: boolean;
    customer: boolean;
  };
  keyPhrases: KeyPhrase[];
  callHistory: CallHistory[];
  coachingAlerts: CoachingAlert[];
  startRecording: () => void;
  stopRecording: () => void;
  updateCallMetrics: (updates: Partial<CallMetricsUpdates>) => void;
  addKeyPhrase: (phrase: string, sentiment?: number) => void;
  dismissAlert: (id: string) => void;
  loadPastCalls: () => Promise<void>;
}

interface CallMetricsUpdates {
  duration: number;
  talkRatio: TalkRatio;
  sentiment: number;
  isTalkingMap: {
    agent: boolean;
    customer: boolean;
  };
  keyPhrases: KeyPhrase[];
}

// Create a store for call metrics
export const useCallMetricsStore = create<CallMetricsState>((set, get) => ({
  isRecording: false,
  recordingStartTime: null,
  duration: 0,
  talkRatio: { agent: 50, client: 50 },
  sentiment: 0.5,
  isTalkingMap: {
    agent: false,
    customer: false,
  },
  keyPhrases: [],
  callHistory: [],
  coachingAlerts: [
    {
      id: '1',
      message: 'Try using more open-ended questions',
      type: 'info',
      timestamp: Date.now() - 30000,
    },
    {
      id: '2',
      message: 'Customer objection detected, address concerns',
      type: 'warning',
      timestamp: Date.now() - 15000,
    },
  ],

  startRecording: () => {
    // Start recording and set the initial recording time
    set({
      isRecording: true,
      recordingStartTime: Date.now(),
      duration: 0,
      keyPhrases: [],
    });

    // Set up a timer to update the duration
    const interval = setInterval(() => {
      const { recordingStartTime } = get();
      if (recordingStartTime) {
        const duration = Math.floor((Date.now() - recordingStartTime) / 1000);
        set({ duration });
      }
    }, 1000);

    // Store the interval ID so we can clear it later
    (window as any).recordingInterval = interval;
  },

  stopRecording: () => {
    // Stop recording and clean up
    set({ isRecording: false });

    // Clear the duration update interval
    if ((window as any).recordingInterval) {
      clearInterval((window as any).recordingInterval);
      (window as any).recordingInterval = null;
    }

    // Add the recording to call history
    const { duration, sentiment } = get();
    const newCallHistory: CallHistory = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      duration,
      sentiment,
      prospect: 'Prospect ' + Math.floor(Math.random() * 100),
    };

    set((state) => ({
      callHistory: [newCallHistory, ...state.callHistory],
    }));
  },

  updateCallMetrics: (updates) => {
    set((state) =>
      produce(state, (draft) => {
        if (updates.duration !== undefined) {
          draft.duration = updates.duration;
        }
        if (updates.talkRatio !== undefined) {
          draft.talkRatio = updates.talkRatio;
        }
        if (updates.sentiment !== undefined) {
          draft.sentiment = updates.sentiment;
        }
        if (updates.isTalkingMap !== undefined) {
          draft.isTalkingMap = updates.isTalkingMap;
        }
        if (updates.keyPhrases !== undefined) {
          draft.keyPhrases = updates.keyPhrases;
        }
      })
    );
  },

  addKeyPhrase: (phrase, sentiment = 0.5) => {
    set((state) =>
      produce(state, (draft) => {
        draft.keyPhrases.push({
          text: phrase,
          sentiment,
          timestamp: Date.now(),
        });
      })
    );
  },

  dismissAlert: (id) => {
    set((state) =>
      produce(state, (draft) => {
        const alert = draft.coachingAlerts.find((a) => a.id === id);
        if (alert) {
          alert.dismissed = true;
        }
      })
    );
  },

  loadPastCalls: async () => {
    try {
      // In a real implementation, fetch from database
      // For this demo, we'll add some static data if the history is empty
      set((state) => {
        if (state.callHistory.length === 0) {
          return {
            callHistory: [
              {
                id: '1',
                date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                duration: 420,
                sentiment: 0.75,
                prospect: 'Acme Corp',
              },
              {
                id: '2',
                date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                duration: 310,
                sentiment: 0.62,
                prospect: 'Globex Industries',
              },
              {
                id: '3',
                date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
                duration: 510,
                sentiment: 0.48,
                prospect: 'Initech',
              },
            ],
          };
        }
        return {};
      });
    } catch (error) {
      console.error('Error loading past calls:', error);
    }
  },
}));
