
import React, { useContext, useEffect, useState } from "react";
import { Copy, Flag, Play, User, Mic } from "lucide-react";
import AIWaveform from "../ui/AIWaveform";
import { ThemeContext } from "@/App";
import WhisperButton from "../Whisper/WhisperButton";
import SpeechToTextRecorder from "../Whisper/SpeechToTextRecorder";
import { getStoredTranscriptions, StoredTranscription } from "@/services/WhisperService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface MessageProps {
  sender: "agent" | "customer";
  content: string;
  timestamp: string;
  flagged?: boolean;
  highlight?: boolean;
  isDarkMode: boolean;
}

const Message = ({ sender, content, timestamp, flagged = false, highlight = false, isDarkMode }: MessageProps) => {
  return (
    <div className={`py-3 ${highlight ? (isDarkMode ? "bg-white/5" : "bg-gray-100") + " -mx-4 px-4 rounded" : ""}`}>
      <div className="flex gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
          sender === "agent" ? "bg-neon-blue/20" : "bg-neon-pink/20"
        }`}>
          <User className={`h-4 w-4 ${
            sender === "agent" ? "text-neon-blue" : "text-neon-pink"
          }`} />
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <h4 className={`text-sm font-medium ${
              sender === "agent" ? "text-neon-blue" : "text-neon-pink"
            }`}>
              {sender === "agent" ? "Sales Agent" : "Customer"}
            </h4>
            <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{timestamp}</span>
          </div>
          
          <p className={`text-sm ${isDarkMode ? "text-white" : "text-gray-800"}`}>
            {content}
            {flagged && (
              <span className="inline-flex items-center ml-2 text-neon-red">
                <Flag className="h-3 w-3 mr-1" />
                <span className="text-xs">Interruption</span>
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

const CallTranscript = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { toast } = useToast();
  const [transcript, setTranscript] = useState<StoredTranscription | null>(null);
  const [parsedMessages, setParsedMessages] = useState<any[]>([]);
  
  useEffect(() => {
    const transcriptions = getStoredTranscriptions();
    if (transcriptions.length > 0) {
      const latest = [...transcriptions].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
      
      setTranscript(latest);
      
      if (latest.transcript_segments && latest.transcript_segments.length > 0) {
        const messages = latest.transcript_segments.map((segment) => {
          const minutes = Math.floor(segment.start / 60);
          const seconds = Math.floor(segment.start % 60);
          const timestamp = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          
          const isInterruption = false;
          
          const text = segment.text.toLowerCase();
          const highlight = text.includes("no") || 
                           text.includes("problem") ||
                           text.includes("not interested") ||
                           text.includes("expensive");
          
          return {
            id: segment.id,
            sender: segment.speaker.toLowerCase().includes("agent") ? "agent" : "customer",
            content: segment.text,
            timestamp,
            flagged: isInterruption,
            highlight
          };
        });
        
        setParsedMessages(messages);
      } else {
        try {
          const text = latest.text;
          
          const segments = text.split(/\n|(?:Agent:|Customer:|Speaker \d+:)/g).filter(Boolean).map(s => s.trim());
          
          const messages = segments.map((content, index) => {
            const sender = index % 2 === 0 ? "agent" : "customer";
            
            const minute = Math.floor(index * 45 / segments.length);
            const second = Math.floor((index * 45 / segments.length - minute) * 60);
            const timestamp = `${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
            
            const flagged = content.toLowerCase().includes("interrupt") || 
                           (content.length < 20 && content.endsWith("--")) ||
                           index > 0 && segments[index-1].length < 15;
            
            const highlight = content.toLowerCase().includes("no") || 
                            content.toLowerCase().includes("problem") ||
                            content.toLowerCase().includes("not interested") ||
                            content.toLowerCase().includes("expensive");
            
            return {
              id: index + 1,
              sender,
              content,
              timestamp,
              flagged,
              highlight
            };
          });
          
          setParsedMessages(messages);
        } catch (error) {
          console.error("Error parsing transcript:", error);
          setParsedMessages([{
            id: 1,
            sender: "agent",
            content: latest.text,
            timestamp: "00:00"
          }]);
        }
      }
    }
  }, []);
  
  const handleCopy = () => {
    if (transcript) {
      navigator.clipboard.writeText(transcript.text);
      toast({
        title: "Copied to clipboard",
        description: "Transcript text has been copied to your clipboard"
      });
    }
  };
  
  const handleSpeechInput = (text: string) => {
    if (text && transcript) {
      const newMessage = {
        id: parsedMessages.length + 1,
        sender: "agent",
        content: text,
        timestamp: "Live",
        flagged: false,
        highlight: false
      };
      
      setParsedMessages(prev => [...prev, newMessage]);
      
      toast({
        title: "Speech Added",
        description: "Your speech has been added to the transcript"
      });
    }
  };

  const getCallInfo = () => {
    if (!transcript) return "No transcript available";
    const customer = transcript.speakerName || "Customer";
    const duration = transcript.duration 
      ? `${Math.floor(transcript.duration / 60)}:${(transcript.duration % 60).toString().padStart(2, '0')}`
      : "Unknown duration";
    return `Call with ${customer} • ${duration}`;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-2">
        <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          {getCallInfo()}
        </p>
        
        <div className="flex items-center gap-2">
          {transcript && <WhisperButton recordingId={transcript.id} />}
          
          <SpeechToTextRecorder 
            onTranscriptionComplete={handleSpeechInput}
            buttonSize="sm"
          />
          
          <Button 
            variant="outline"
            size="sm"
            className="flex items-center gap-1 h-8"
            disabled={!transcript}
          >
            <Play className="h-4 w-4" />
            <span className="hidden sm:inline">Play</span>
          </Button>
          
          <Button 
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!transcript}
            className="h-8"
          >
            <Copy className="h-4 w-4" />
            <span className="hidden sm:inline">Copy</span>
          </Button>
        </div>
      </div>
      
      {transcript ? (
        <div className="flex-1 overflow-y-auto px-4 my-3 divide-y divide-border">
          {parsedMessages.map((message) => (
            <Message
              key={message.id}
              sender={message.sender}
              content={message.content}
              timestamp={message.timestamp}
              flagged={message.flagged}
              highlight={message.highlight}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6 text-muted-foreground">
            <p>No transcript data available</p>
            <p className="text-sm mt-2">Upload audio files or record a call to see transcripts</p>
          </div>
        </div>
      )}
      
      <div className={`px-4 py-3 border-t ${isDarkMode ? "border-white/10" : "border-gray-200"}`}>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <AIWaveform color="blue" barCount={8} className="h-5" />
          <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
            {transcript ? "AI analyzing transcript patterns..." : "No transcript to analyze"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CallTranscript;
