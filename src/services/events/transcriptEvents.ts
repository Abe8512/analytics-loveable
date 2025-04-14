
import { EventsService } from "@/services/EventsService";
import { CallTranscript } from "@/types/call";
import { EventType } from "@/services/events/types";

/**
 * Dispatches a transcript selected event
 * @param transcript The selected transcript
 */
export const dispatchTranscriptSelected = (transcript: CallTranscript | null) => {
  EventsService.dispatchEvent('transcript-selected' as EventType, { transcript });
};

/**
 * Registers a listener for transcript selection events
 * @param callback The callback function to execute when a transcript is selected
 * @returns A function to remove the event listener
 */
export const onTranscriptSelected = (callback: (transcript: CallTranscript | null) => void) => {
  return EventsService.addEventListener('transcript-selected' as EventType, (data) => {
    callback(data?.transcript || null);
  });
};

/**
 * Dispatches a transcript sentiment updated event
 * @param transcriptId The ID of the updated transcript
 * @param sentiment The new sentiment value
 */
export const dispatchSentimentUpdated = (transcriptId: string, sentiment: string) => {
  EventsService.dispatchEvent('sentiment-updated' as EventType, { 
    transcriptId, 
    sentiment,
    timestamp: new Date().toISOString()
  });
};

/**
 * Registers a listener for sentiment updated events
 * @param callback The callback function to execute when sentiment is updated
 * @returns A function to remove the event listener
 */
export const onSentimentUpdated = (callback: (data: { transcriptId: string, sentiment: string }) => void) => {
  return EventsService.addEventListener('sentiment-updated' as EventType, (data) => {
    if (data?.transcriptId && data?.sentiment) {
      callback({
        transcriptId: data.transcriptId,
        sentiment: data.sentiment
      });
    }
  });
};

/**
 * Dispatches a transcripts updated event
 * @param changedTranscripts Optional array of changed transcripts
 */
export const dispatchTranscriptsUpdated = (changedTranscripts?: CallTranscript[]) => {
  EventsService.dispatchEvent('transcripts-updated' as EventType, { 
    changedTranscripts,
    timestamp: new Date().toISOString()
  });
};

/**
 * Registers a listener for transcripts updated events
 * @param callback The callback function to execute when transcripts are updated
 * @returns A function to remove the event listener
 */
export const onTranscriptsUpdated = (callback: (data: { changedTranscripts?: CallTranscript[], timestamp: string }) => void) => {
  return EventsService.addEventListener('transcripts-updated' as EventType, (data) => {
    callback({
      changedTranscripts: data?.changedTranscripts,
      timestamp: data?.timestamp || new Date().toISOString()
    });
  });
};
