
import React, { useContext } from "react";
import { ThemeContext } from "@/App";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";

const CallRating = () => {
  const { isDarkMode } = useContext(ThemeContext);
  
  // Dummy data for call rating - in a real application this would come from API or state
  const overallScore = 74;
  const hasData = true; // Flag to determine if we have rating data
  
  const performanceCategories = [
    { name: "Discovery", score: 85 },
    { name: "Solution Presentation", score: 78 },
    { name: "Objection Handling", score: 65 },
    { name: "Closing", score: 68 }
  ];
  
  const achievedCriteria = [
    "Used discovery questions",
    "Maintained positive tone",
    "Listened actively",
    "Used social proof",
    "Confirmed next steps"
  ];
  
  const improvementAreas = [
    "Work on active listening skills and avoid interrupting customers",
    "Increase effectiveness of objection handling by acknowledging customer concerns",
    "Work on stronger closing techniques to improve conversion rates"
  ];
  
  const getCategoryColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 70) return "bg-cyan-500"; 
    if (score >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="h-full overflow-auto">
      {hasData ? (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-base font-medium ${isDarkMode ? "text-white" : "text-gray-800"}`}>
              {overallScore}/100
            </h3>
            <span className="text-xs text-muted-foreground">Performance by Category</span>
          </div>
          
          <div className="space-y-2 mb-3">
            {performanceCategories.map((category, index) => (
              <div key={index}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{category.name}</span>
                  <span className={isDarkMode ? "text-white" : "text-gray-800"}>
                    {category.score}%
                  </span>
                </div>
                <Progress 
                  value={category.score} 
                  className="h-1.5" 
                  indicatorClassName={getCategoryColor(category.score)} 
                />
              </div>
            ))}
          </div>
          
          <div className="mt-3">
            <h4 className="text-xs font-medium mb-2">Improvement Areas</h4>
            <ul className="space-y-1.5">
              {improvementAreas.map((area, index) => (
                <li key={index} className="text-xs flex">
                  <span className="text-rose-500 mr-1.5">•</span>
                  <span className="text-muted-foreground">{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center">
          <p className="text-muted-foreground text-sm">No rating data available</p>
        </div>
      )}
    </div>
  );
};

export default CallRating;
