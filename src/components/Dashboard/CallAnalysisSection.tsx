
import React, { useRef } from "react";
import CallTranscript from "../CallAnalysis/CallTranscript";
import SentimentAnalysis from "../CallAnalysis/SentimentAnalysis";
import KeywordInsights from "../CallAnalysis/KeywordInsights";
import CallRating from "../CallAnalysis/CallRating";
import ContentLoader from "../ui/ContentLoader";
import { useContext } from "react";
import { ThemeContext } from "@/App";
import { BarChart2, BookText, LineChart, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface CallAnalysisSectionProps {
  isLoading: boolean;
}

const CallAnalysisSection = ({ isLoading }: CallAnalysisSectionProps) => {
  const { isDarkMode } = useContext(ThemeContext);
  const callAnalysisSectionRef = useRef<HTMLDivElement>(null);
  
  return (
    <div 
      className={cn(
        "h-full rounded-xl p-5 border",
        isDarkMode 
          ? "bg-surface-dark/80 border-white/10 backdrop-blur-sm" 
          : "bg-white border-slate-200/80 shadow-sm"
      )}
    >
      <h2 
        ref={callAnalysisSectionRef}
        className={cn(
          "text-xl font-semibold mb-4 flex items-center",
          isDarkMode ? "text-white" : "text-gray-800"
        )}
      >
        <Layers className="h-5 w-5 mr-2 text-neon-purple" />
        Call Analysis
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Call Transcript - Takes 7/12 of the space on md screens */}
        <div className="col-span-1 md:col-span-7">
          <div className={cn(
            "rounded-lg overflow-hidden h-full min-h-[280px]",
            isDarkMode 
              ? "bg-surface-dark border border-white/5" 
              : "bg-gray-50 border border-gray-100"
          )}>
            <ContentLoader 
              isLoading={isLoading} 
              height={280}
              skeletonCount={1}
              preserveHeight={true}
            >
              <div className="h-full flex flex-col">
                <div className={cn(
                  "flex items-center justify-between px-4 py-3 border-b",
                  isDarkMode ? "border-white/5" : "border-gray-100"
                )}>
                  <div className="flex items-center">
                    <BookText className="h-4 w-4 mr-2 text-neon-blue" />
                    <h3 className={cn(
                      "text-base font-medium",
                      isDarkMode ? "text-white" : "text-gray-800"
                    )}>
                      Call Transcript
                    </h3>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto max-h-[280px] p-1">
                  <CallTranscript />
                </div>
              </div>
            </ContentLoader>
          </div>
        </div>
        
        {/* Analysis Widgets - Takes 5/12 of the space on md screens */}
        <div className="col-span-1 md:col-span-5 grid grid-rows-3 gap-3">
          {/* Sentiment Analysis */}
          <div className={cn(
            "rounded-lg overflow-hidden",
            isDarkMode 
              ? "bg-surface-dark border border-white/5" 
              : "bg-gray-50 border border-gray-100"
          )}>
            <ContentLoader 
              isLoading={isLoading} 
              height={85}
              skeletonCount={1}
              preserveHeight={true}
            >
              <div className="h-full">
                <div className={cn(
                  "flex items-center justify-between px-3 py-2 border-b",
                  isDarkMode ? "border-white/5" : "border-gray-100"
                )}>
                  <div className="flex items-center">
                    <LineChart className="h-4 w-4 mr-2 text-neon-pink" />
                    <h3 className={cn(
                      "text-sm font-medium",
                      isDarkMode ? "text-white" : "text-gray-800"
                    )}>
                      Sentiment Analysis
                    </h3>
                  </div>
                </div>
                <div className="p-3">
                  <SentimentAnalysis />
                </div>
              </div>
            </ContentLoader>
          </div>
          
          {/* Keyword Insights */}
          <div className={cn(
            "rounded-lg overflow-hidden",
            isDarkMode 
              ? "bg-surface-dark border border-white/5" 
              : "bg-gray-50 border border-gray-100"
          )}>
            <ContentLoader 
              isLoading={isLoading} 
              height={85}
              skeletonCount={1}
              preserveHeight={true}
            >
              <div className="h-full">
                <div className={cn(
                  "flex items-center justify-between px-3 py-2 border-b",
                  isDarkMode ? "border-white/5" : "border-gray-100"
                )}>
                  <div className="flex items-center">
                    <BarChart2 className="h-4 w-4 mr-2 text-neon-green" />
                    <h3 className={cn(
                      "text-sm font-medium",
                      isDarkMode ? "text-white" : "text-gray-800"
                    )}>
                      Keyword Insights
                    </h3>
                  </div>
                </div>
                <div className="p-3">
                  <KeywordInsights />
                </div>
              </div>
            </ContentLoader>
          </div>
          
          {/* Call Rating */}
          <div className={cn(
            "rounded-lg overflow-hidden",
            isDarkMode 
              ? "bg-surface-dark border border-white/5" 
              : "bg-gray-50 border border-gray-100"
          )}>
            <ContentLoader 
              isLoading={isLoading} 
              height={85}
              skeletonCount={1}
              preserveHeight={true}
            >
              <div className="h-full">
                <div className={cn(
                  "flex items-center justify-between px-3 py-2 border-b",
                  isDarkMode ? "border-white/5" : "border-gray-100"
                )}>
                  <div className="flex items-center">
                    <BarChart2 className="h-4 w-4 mr-2 text-neon-blue" />
                    <h3 className={cn(
                      "text-sm font-medium",
                      isDarkMode ? "text-white" : "text-gray-800"
                    )}>
                      Call Rating
                    </h3>
                  </div>
                </div>
                <div className="p-3">
                  <CallRating />
                </div>
              </div>
            </ContentLoader>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallAnalysisSection;
