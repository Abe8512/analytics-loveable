
import React, { useContext, useEffect, useState } from "react";
import { Copy, Flag, Play, User, Mic, Download } from "lucide-react";
import AIWaveform from "../ui/AIWaveform";
import { ThemeContext } from "@/App";
import WhisperButton from "../Whisper/WhisperButton";
import SpeechToTextRecorder from "../Whisper/SpeechToTextRecorder";
import { getStoredTranscriptions, StoredTranscription } from "@/services/WhisperService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CallTranscript as CallTranscriptType } from "@/types/call";

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

interface CallTranscriptProps {
  transcriptId?: string;
}

const CallTranscript: React.FC<CallTranscriptProps> = ({ transcriptId }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const { toast } = useToast();
  const [transcript, setTranscript] = useState<StoredTranscription | CallTranscriptType | null>(null);
  const [parsedMessages, setParsedMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchTranscript = async () => {
      if (transcriptId) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('call_transcripts')
            .select('*')
            .eq('id', transcriptId)
            .single();
            
          if (error) {
            throw error;
          }
          
          setTranscript(data as CallTranscriptType);
          processTranscriptData(data as CallTranscriptType);
        } catch (err) {
          console.error('Error fetching transcript:', err);
          // Fallback to local storage
          loadLocalTranscription();
        } finally {
          setLoading(false);
        }
      } else {
        // No transcriptId provided, try to load from local storage
        loadLocalTranscription();
      }
    };
    
    fetchTranscript();
  }, [transcriptId]);
  
  const loadLocalTranscription = () => {
    const transcriptions = getStoredTranscriptions();
    if (transcriptions.length > 0) {
      const latest = [...transcriptions].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
      
      setTranscript(latest);
      processTranscriptData(latest);
    }
  };
  
  const processTranscriptData = (transcriptData: any) => {
    if (transcriptData.transcript_segments && transcriptData.transcript_segments.length > 0) {
      const messages = transcriptData.transcript_segments.map((segment: any) => {
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
        const text = transcriptData.text;
        
        // Check if this is a real transcript or a simulated one
        const isSimulated = text && text.toLowerCase().includes("simulated") && text.toLowerCase().includes("transcript");
        
        if (isSimulated) {
          // Create a more realistic transcript for demo purposes
          const demoMessages = [
            {
              id: 1,
              sender: "agent",
              content: "Hi there! This is Sarah from Future Sentiment Analytics. How can I help you today?",
              timestamp: "00:00",
              flagged: false,
              highlight: false
            },
            {
              id: 2,
              sender: "customer",
              content: "Hi Sarah, I'm calling about your sentiment analysis product. I saw it online and wanted to learn more.",
              timestamp: "00:08",
              flagged: false,
              highlight: false
            },
            {
              id: 3,
              sender: "agent",
              content: "Great! I'd be happy to tell you about our sentiment analysis tools. What kind of business do you run?",
              timestamp: "00:16",
              flagged: false,
              highlight: false
            },
            {
              id: 4,
              sender: "customer",
              content: "I manage a customer support team for a SaaS company. We're looking to analyze customer interactions.",
              timestamp: "00:24",
              flagged: false,
              highlight: false
            },
            {
              id: 5,
              sender: "agent",
              content: "Perfect! Our tool is designed exactly for that use case. It analyzes calls and provides real-time feedback on sentiment, helping your team adjust their approach during conversations.",
              timestamp: "00:32",
              flagged: false,
              highlight: false
            }
          ];
          setParsedMessages(demoMessages);
          return;
        }
        
        // If it's not a simulated transcript, try to parse it
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
          content: transcript?.text || "No transcript content available",
          timestamp: "00:00"
        }]);
      }
    }
  };
  
  const handleCopy = () => {
    if (transcript) {
      const textToCopy = transcript.text || 
        parsedMessages.map(msg => `${msg.sender}: ${msg.content}`).join('\n');
        
      navigator.clipboard.writeText(textToCopy);
      toast({
        title: "Copied to clipboard",
        description: "Transcript text has been copied to your clipboard"
      });
    }
  };
  
  const handleSpeechInput = (text: string) => {
    if (text) {
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
    
    // Try different properties based on object type
    const customer = 
      (transcript as CallTranscriptType).customer_name ||
      (transcript as StoredTranscription).speakerName || 
      "Customer";
      
    let duration = 0;
    
    if ((transcript as CallTranscriptType).duration) {
      duration = (transcript as CallTranscriptType).duration;
    } else if ((transcript as StoredTranscription).duration) {
      duration = (transcript as StoredTranscription).duration;
    }
    
    const formattedDuration = duration 
      ? `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`
      : "Unknown duration";
      
    return `Call with ${customer} • ${formattedDuration}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-center">
          <p className="text-muted-foreground">Loading transcript...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-2">
        <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          {getCallInfo()}
        </p>
        
        <div className="flex items-center gap-2">
          {transcript && <WhisperButton recordingId={transcriptId || (transcript as StoredTranscription).id} />}
          
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
          
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            disabled={!transcript}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      </div>
      
      {transcript ? (
        <div className="flex-1 overflow-y-auto px-4 my-3 divide-y divide-border">
          {parsedMessages.length > 0 ? (
            parsedMessages.map((message) => (
              <Message
                key={message.id}
                sender={message.sender}
                content={message.content}
                timestamp={message.timestamp}
                flagged={message.flagged}
                highlight={message.highlight}
                isDarkMode={isDarkMode}
              />
            ))
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              <p>No conversation segments available</p>
              <p className="text-sm mt-2">This transcript doesn't contain detailed conversation data</p>
            </div>
          )}
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
