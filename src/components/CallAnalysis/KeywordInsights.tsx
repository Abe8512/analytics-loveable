
import React, { useContext } from "react";
import { ThemeContext } from "@/App";
import { Badge } from "@/components/ui/badge";

const KeywordInsights = () => {
  const { isDarkMode } = useContext(ThemeContext);
  
  const positiveKeywords = [
    "solution", "benefits", "value", "interested", "agree", 
    "understand", "absolutely", "perfect", "great"
  ];
  
  const neutralKeywords = [
    "price", "cost", "time", "change", "demo", 
    "features", "contract", "question", "explain", "call"
  ];
  
  const negativeKeywords = [
    "expensive", "issue", "problem", "no", "not", "wait"
  ];

  const hasData = true; // Flag to determine if we have keyword data

  return (
    <div className="h-full">
      {hasData ? (
        <div>
          <div className="mb-2">
            <div className="flex items-center text-xs mb-1">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span className="font-medium">Positive Keywords</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {positiveKeywords.slice(0, 6).map((keyword, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className={`text-xs ${isDarkMode ? "border-green-500/40 text-green-400" : "border-green-500/40 text-green-700 bg-green-50"}`}
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="mb-2">
            <div className="flex items-center text-xs mb-1">
              <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
              <span className="font-medium">Neutral Keywords</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {neutralKeywords.slice(0, 6).map((keyword, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className={`text-xs ${isDarkMode ? "border-gray-500/40 text-gray-300" : "border-gray-400/40 text-gray-700 bg-gray-50"}`}
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex items-center text-xs mb-1">
              <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
              <span className="font-medium">Negative Keywords</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {negativeKeywords.map((keyword, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className={`text-xs ${isDarkMode ? "border-red-500/40 text-red-400" : "border-red-500/40 text-red-700 bg-red-50"}`}
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center">
          <p className="text-muted-foreground text-sm">No keyword data available</p>
        </div>
      )}
    </div>
  );
};

export default KeywordInsights;
