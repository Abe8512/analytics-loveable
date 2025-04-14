
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { EventsService } from "./EventsService";
import { EventType } from "./events/types";
import { useBulkUploadStore } from "@/store/useBulkUploadStore";
import { BulkUploadFilter } from "@/types/teamTypes";

export interface BulkUploadFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: "pending" | "uploading" | "processing" | "complete" | "error";
  error?: string;
  transcriptId?: string;
  assignedTo?: string;
}

export const useBulkUploadService = () => {
  // Use our custom store for bulk upload state
  const {
    files,
    isProcessing,
    uploadHistory,
    hasLoadedHistory,
    processQueue,
    addFiles,
    refreshTranscripts,
    progress,
    uploadState,
    transcripts,
    fileCount,
    complete,
    start,
    setProgress,
    addTranscript,
    setFileCount,
  } = useBulkUploadStore();

  // Load upload history on component mount
  useEffect(() => {
    if (!hasLoadedHistory) {
      loadUploadHistory();
    }
  }, [hasLoadedHistory]);

  // Function to load upload history
  const loadUploadHistory = async () => {
    try {
      const { data: transcripts, error } = await supabase
        .from("call_transcripts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      // Update store with history
      if (transcripts) {
        useBulkUploadStore.getState().setUploadHistory(transcripts);
      }
    } catch (error) {
      console.error("Error loading upload history:", error);
    }
  };

  // Process files with assigned users
  const processFilesWithAssignedUsers = async (
    files: File[],
    assignedTo?: string
  ) => {
    // Add files to the queue
    const fileObjects = files.map((file) => ({
      id: uuidv4(),
      name: file.name,
      size: file.size,
      progress: 0,
      status: "pending" as const,
      assignedTo,
    }));

    addFiles(fileObjects);
    setFileCount(files.length);

    // Start processing
    start();

    try {
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileObject = fileObjects[i];

        // Update progress
        setProgress(fileObject.id, 5, "uploading");

        // Create FormData for file upload
        const formData = new FormData();
        formData.append("file", file);
        formData.append("assigned_to", assignedTo || "");

        // Upload the file (you'll need to implement this endpoint)
        try {
          const response = await fetch("/api/upload-transcript", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
          }

          const result = await response.json();

          // Add the transcript to the list
          addTranscript({
            id: result.id,
            text: result.text,
            filename: file.name,
            created_at: new Date().toISOString(),
            status: "complete",
          });

          // Update progress
          setProgress(fileObject.id, 100, "complete", result.id);

          // Dispatch event for other components
          const unsubscribe = EventsService.addEventListener(
            "bulk-upload-progress" as EventType,
            {
              file: fileObject.name,
              progress: 100,
              status: "complete",
              timestamp: Date.now(),
            }
          );
          if (typeof unsubscribe === "function") unsubscribe();
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          setProgress(
            fileObject.id,
            0,
            "error",
            undefined,
            error instanceof Error ? error.message : "Upload failed"
          );

          // Dispatch error event
          const unsubscribe = EventsService.addEventListener(
            "bulk-upload-progress" as EventType,
            {
              file: fileObject.name,
              progress: 0,
              status: "error",
              error: error instanceof Error ? error.message : "Upload failed",
              timestamp: Date.now(),
            }
          );
          if (typeof unsubscribe === "function") unsubscribe();
        }
      }
    } catch (error) {
      console.error("Error in bulk upload process:", error);
    } finally {
      // Mark processing as complete
      complete();

      // Refresh transcripts
      await refreshTranscripts();

      // Dispatch completed event
      const unsubscribe = EventsService.addEventListener(
        "bulk-upload-completed" as EventType,
        { timestamp: Date.now() }
      );
      if (typeof unsubscribe === "function") unsubscribe();
    }
  };

  return {
    files,
    isProcessing,
    uploadHistory,
    hasLoadedHistory,
    progress,
    uploadState,
    transcripts,
    fileCount,
    processQueue,
    addFiles,
    refreshTranscripts,
    processFilesWithAssignedUsers,
    loadUploadHistory,
    setFileCount,
  };
};
