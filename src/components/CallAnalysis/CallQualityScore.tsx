
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, BarChart, ArrowRight, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface CallQualityScoreProps {
  transcript: any;
  onReanalyze: () => void;
  isAnalyzing?: boolean;
}

const CallQualityScore: React.FC<CallQualityScoreProps> = ({ 
  transcript, 
  onReanalyze,
  isAnalyzing = false
}) => {
  const callScore = transcript?.call_score || 0;
  const [animatedScore, setAnimatedScore] = useState(0);
  
  // Animate score when it changes
  useEffect(() => {
    let startCount = 0;
    const duration = 1000; // 1 second
    const interval = 20; // 20ms intervals
    const steps = duration / interval;
    const increment = callScore / steps;
    let timer: NodeJS.Timeout;
    
    // Reset to 0 first if score changes
    setAnimatedScore(0);
    
    const animate = () => {
      timer = setInterval(() => {
        startCount += increment;
        if (startCount >= callScore) {
          setAnimatedScore(callScore);
          clearInterval(timer);
        } else {
          setAnimatedScore(Math.round(startCount));
        }
      }, interval);
    };
    
    // Small delay to show the animation effect
    setTimeout(animate, 300);
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callScore]);
  
  // Determine score category
  const getScoreCategory = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-500' };
    if (score >= 60) return { label: 'Good', color: 'text-emerald-500' };
    if (score >= 40) return { label: 'Average', color: 'text-yellow-500' };
    if (score >= 20) return { label: 'Below Average', color: 'text-amber-500' };
    return { label: 'Poor', color: 'text-red-500' };
  };
  
  const scoreCategory = getScoreCategory(animatedScore);
  
  const handleReanalyze = () => {
    toast.loading("Analyzing call quality...");
    onReanalyze();
  };
  
  return (
    <Card className="overflow-hidden border border-muted/40 shadow-sm transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/10">
        <div>
          <CardTitle className="text-sm font-medium">Call Quality Score</CardTitle>
          <CardDescription>AI-powered evaluation of call performance</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleReanalyze}
          disabled={isAnalyzing}
          className="flex items-center gap-1"
        >
          <RefreshCcw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analyzing...' : 'Reanalyze'}
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <div className="absolute inset-0 border-8 border-muted rounded-full"></div>
            <motion.div 
              className="absolute inset-0 border-8 rounded-full border-transparent"
              style={{
                borderLeftColor: 'rgb(34 197 94)', // Tailwind green-500
                borderTopColor: 'rgb(34 197 94)',
              }}
              animate={{ 
                transform: `rotate(${animatedScore * 1.8}deg)` 
              }}
              transition={{ 
                duration: 1,
                ease: "easeOut"
              }}
            ></motion.div>
            <div className="text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={animatedScore}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-5xl font-bold"
                >
                  {animatedScore}
                </motion.div>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.div
                  key={scoreCategory.label}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className={`text-sm font-medium ${scoreCategory.color}`}
                >
                  {scoreCategory.label}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full">
            <motion.div 
              className="flex items-center gap-2 border rounded-md p-3 hover:bg-muted/10 transition-colors"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <BarChart className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Talking Points</div>
                <div className="text-lg font-bold">{transcript?.keywords_hit || 0}/10</div>
              </div>
            </motion.div>
            <motion.div 
              className="flex items-center gap-2 border rounded-md p-3 hover:bg-muted/10 transition-colors"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <LineChart className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Engagement</div>
                <div className="text-lg font-bold">{transcript?.engagement_score || 0}/10</div>
              </div>
            </motion.div>
          </div>
          
          <Button variant="default" size="sm" className="w-full">
            View Detailed Analysis <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CallQualityScore;
