
import React, { useRef } from "react";
import CallTranscript from "../CallAnalysis/CallTranscript";
import SentimentAnalysis from "../CallAnalysis/SentimentAnalysis";
import KeywordInsights from "../CallAnalysis/KeywordInsights";
import CallRating from "../CallAnalysis/CallRating";
import ContentLoader from "../ui/ContentLoader";
import { useContext } from "react";
import { ThemeContext } from "@/App";
import { Card } from "@/components/ui/card";
import { Maximize2, Copy, Play, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CallAnalysisSectionProps {
  isLoading: boolean;
}

const CallAnalysisSection = ({ isLoading }: CallAnalysisSectionProps) => {
  const { isDarkMode } = useContext(ThemeContext);
  const callAnalysisSectionRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 md:col-span-7">
        <ContentLoader 
          isLoading={isLoading} 
          height={600}
          skeletonCount={1}
          preserveHeight={true}
        >
          <Card className="bg-slate-800/50 backdrop-blur-sm overflow-hidden shadow-lg border-white/5 h-full">
            <div className="p-4 flex justify-between items-center border-b border-white/10">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                Call Transcript
              </h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                  <Play className="h-4 w-4 mr-1" />
                  Play Audio
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              <CallTranscript />
            </div>
          </Card>
        </ContentLoader>
      </div>
      
      <div className="col-span-12 md:col-span-5 grid grid-rows-3 gap-6">
        <ContentLoader 
          isLoading={isLoading} 
          height={180}
          skeletonCount={1}
          preserveHeight={true}
        >
          <Card className="bg-indigo-900/30 backdrop-blur-sm shadow-lg border-white/5 h-full">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Sentiment Analysis</h3>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white p-1">
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <SentimentAnalysis />
            </div>
          </Card>
        </ContentLoader>
        
        <ContentLoader 
          isLoading={isLoading} 
          height={180}
          skeletonCount={1}
          preserveHeight={true}
        >
          <Card className="bg-emerald-900/20 backdrop-blur-sm shadow-lg border-white/5 h-full">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Keyword Insights</h3>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white p-1">
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <KeywordInsights />
            </div>
          </Card>
        </ContentLoader>
        
        <ContentLoader 
          isLoading={isLoading} 
          height={180}
          skeletonCount={1}
          preserveHeight={true}
        >
          <Card className="bg-purple-900/30 backdrop-blur-sm shadow-lg border-white/5 h-full">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Call Rating</h3>
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10">
                <span className="text-sm font-medium text-cyan-400">
                  76/100
                </span>
              </div>
            </div>
            <div className="p-4">
              <CallRating />
            </div>
          </Card>
        </ContentLoader>
      </div>
    </div>
  );
};

export default CallAnalysisSection;
