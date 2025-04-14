
import React, { useContext } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Clock, MessageSquare, TrendingUp, Volume2 } from "lucide-react";
import { ThemeContext } from "@/App";
import AnimatedNumber from "../ui/AnimatedNumber";
import AIWaveform from "../ui/AIWaveform";
import GlowingCard from "../ui/GlowingCard";
import { useCallMetricsStore } from "@/store/useCallMetricsStore";
import { useSharedTeamMetrics } from "@/services/SharedDataService";
import { useSharedFilters } from "@/contexts/SharedFilterContext";
import { useTheme } from "@/hooks/use-theme";

interface LiveMetricsDisplayProps {
  isCallActive?: boolean;
}

const LiveMetricsDisplay = ({ isCallActive }: LiveMetricsDisplayProps) => {
  const { isDarkMode } = useTheme();
  const { 
    isRecording, 
    callDuration: duration, 
    talkRatioData: talkRatio, 
    sentimentData: sentiment, 
    speakerActivity: isTalkingMap, 
    keyPhrasesList: keyPhrases 
  } = useCallMetricsStore();
  
  // Use shared team metrics for consistent data across components
  const { filters } = useSharedFilters();
  const { metrics: sharedMetrics } = useSharedTeamMetrics(filters);
  
  // Check if we should display metrics
  const showMetrics = isCallActive !== undefined ? isCallActive : isRecording;
  
  // Format duration into minutes:seconds
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Call Duration */}
        <Card className={`${isDarkMode ? "border-neon-blue/20 bg-black/20" : "border-blue-100 bg-blue-50"}`}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Call Duration</p>
                <div className="text-2xl font-bold mt-1 flex items-center">
                  <Clock className={`h-5 w-5 mr-2 ${isDarkMode ? "text-neon-blue" : "text-blue-500"}`} />
                  <AnimatedNumber 
                    value={duration} 
                    formatter={formatDuration}
                  />
                </div>
              </div>
              {showMetrics && <AIWaveform color="blue" barCount={3} className="h-6" />}
            </div>
          </CardContent>
        </Card>
        
        {/* Talk Ratio */}
        <Card className={`${isDarkMode ? "border-purple-500/20 bg-black/20" : "border-purple-100 bg-purple-50"}`}>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Talk Ratio</p>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${isDarkMode ? "text-neon-blue" : "text-blue-500"}`}>Agent</span>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-neon-blue rounded-full" 
                    style={{ width: `${talkRatio.agent}%` }}
                  ></div>
                </div>
                <span className="text-xs font-semibold w-8 text-end">
                  {Math.round(talkRatio.agent)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${isDarkMode ? "text-neon-pink" : "text-pink-500"}`}>Customer</span>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-neon-pink rounded-full" 
                    style={{ width: `${talkRatio.client}%` }}
                  ></div>
                </div>
                <span className="text-xs font-semibold w-8 text-end">
                  {Math.round(talkRatio.client)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Live Sentiment */}
        <Card className={`${isDarkMode ? "border-green-500/20 bg-black/20" : "border-green-100 bg-green-50"}`}>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Live Sentiment</p>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${isDarkMode ? "text-neon-blue" : "text-blue-500"}`}>Agent</span>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${sentiment.agent > 0.7 ? "bg-green-500" : sentiment.agent > 0.4 ? "bg-yellow-500" : "bg-red-500"} rounded-full`}
                    style={{ width: `${sentiment.agent * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs font-semibold w-8 text-end">
                  {Math.round(sentiment.agent * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${isDarkMode ? "text-neon-pink" : "text-pink-500"}`}>Customer</span>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${sentiment.client > 0.7 ? "bg-green-500" : sentiment.client > 0.4 ? "bg-yellow-500" : "bg-red-500"} rounded-fu`}
                    style={{ width: `${sentiment.client * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs font-semibold w-8 text-end">
                  {Math.round(sentiment.client * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Key Phrases */}
        <Card className={`${isDarkMode ? "border-amber-500/20 bg-black/20" : "border-amber-100 bg-amber-50"}`}>
          <CardContent className="p-4">
            <div className="flex flex-col h-full">
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Key Phrases</p>
              <div className="mt-2 flex-1 overflow-hidden">
                {keyPhrases && keyPhrases.length > 0 ? (
                  <div className="text-sm space-y-1">
                    {keyPhrases.slice(0, 3).map((phrase, index) => (
                      <div 
                        key={index} 
                        className={`px-2 py-1 rounded ${
                          isDarkMode ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {phrase && typeof phrase === 'object' && 'text' in phrase ? phrase.text : String(phrase)}
                      </div>
                    ))}
                    {keyPhrases.length > 3 && (
                      <div className="text-xs text-muted-foreground mt-1 text-right">
                        +{keyPhrases.length - 3} more
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground flex items-center justify-center h-full">
                    {isRecording ? "Listening for key phrases..." : "No key phrases detected yet"}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveMetricsDisplay;
