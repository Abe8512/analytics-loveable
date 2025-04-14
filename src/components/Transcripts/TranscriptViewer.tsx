
import React from 'react';

// Create a simple stub for TranscriptViewer
const TranscriptViewer = ({ transcript, error }) => {
  return (
    <div className="transcript-viewer">
      {error ? (
        <div className="error-message">
          {error.toString()}
        </div>
      ) : (
        <div className="transcript-content">
          {transcript ? (
            <pre>{JSON.stringify(transcript, null, 2)}</pre>
          ) : (
            <div>No transcript selected</div>
          )}
        </div>
      )}
    </div>
  );
};

export default TranscriptViewer;
