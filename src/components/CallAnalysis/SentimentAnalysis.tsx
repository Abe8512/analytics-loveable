
import React, { useContext } from "react";
import { ThemeContext } from "@/App";
import { Progress } from "@/components/ui/progress";
import { Info } from "lucide-react";

const SentimentAnalysis = () => {
  const { isDarkMode } = useContext(ThemeContext);
  
  // Dummy data - in a real application, this would come from a proper source
  const sentimentScore = 68; // Out of 100
  const hasData = true; // Flag to determine if we have sentiment data
  
  const getSentimentColor = (score: number) => {
    if (score >= 70) return "bg-green-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-red-500";
  };
  
  const getSentimentText = (score: number) => {
    if (score >= 70) return "Positive";
    if (score >= 40) return "Neutral";
    return "Negative";
  };

  return (
    <div className="h-full">
      {hasData ? (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <span className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                {sentimentScore}%
              </span>
              <span className={`ml-2 text-sm ${
                sentimentScore >= 70 ? "text-green-500" : 
                sentimentScore >= 40 ? "text-amber-500" : 
                "text-red-500"
              }`}>
                {getSentimentText(sentimentScore)}
              </span>
            </div>
            <button className="text-muted-foreground hover:text-foreground">
              <Info className="h-4 w-4" />
            </button>
          </div>
          
          <Progress 
            value={sentimentScore} 
            className="h-2" 
            indicatorClassName={getSentimentColor(sentimentScore)}
          />
          
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Agent</div>
              <Progress value={72} className="h-1.5" indicatorClassName="bg-neon-blue" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Customer</div>
              <Progress value={64} className="h-1.5" indicatorClassName="bg-neon-pink" />
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center">
          <p className="text-muted-foreground text-sm">No sentiment data available</p>
        </div>
      )}
    </div>
  );
};

export default SentimentAnalysis;
