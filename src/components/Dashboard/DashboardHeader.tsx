
import React, { useState, useEffect } from "react";
import { 
  BarChart2, Filter, Calendar, Download, RefreshCw, 
  Zap, Mic, Settings, Search, MessageSquareText, BrainCircuit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateRangeFilter } from "@/components/CallAnalysis/DateRangeFilter";
import { useSharedFilters } from "@/contexts/SharedFilterContext";
import { useCallMetricsStore } from "@/store/useCallMetricsStore";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import BulkUploadButton from "../BulkUpload/BulkUploadButton";

const DashboardHeader = ({ 
  onBulkUploadOpen,
  refreshData,
  isDashboardScreen = true
}: { 
  onBulkUploadOpen: () => void;
  refreshData: () => void;
  isDashboardScreen?: boolean;
}) => {
  const { isDark } = useTheme();
  const { filters, updateDateRange } = useSharedFilters();
  const { isRecording, startRecording, stopRecording } = useCallMetricsStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Simulate last update time
  const [lastUpdate, setLastUpdate] = useState(new Date().toISOString());
  
  useEffect(() => {
    if (isRefreshing) {
      const timer = setTimeout(() => {
        setIsRefreshing(false);
        setLastUpdate(new Date().toISOString());
        toast({
          title: "Data Refreshed",
          description: "Dashboard data has been updated",
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isRefreshing, toast]);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshData();
  };
  
  const handleRecordingToggle = () => {
    if (isRecording) {
      stopRecording();
      toast({
        title: "Recording Stopped",
        description: "Your call recording has been saved"
      });
    } else {
      startRecording();
      toast({
        title: "Recording Started",
        description: "Your call is now being recorded and analyzed"
      });
    }
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast({
        title: "Search Results",
        description: `Showing results for "${searchQuery}"`
      });
    }
  };
  
  return (
    <div className={cn(
      "relative mb-6 pb-4 border-b",
      isDark ? "border-white/10" : "border-gray-200"
    )}>
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "relative flex items-center justify-center w-12 h-12 rounded-xl",
            "bg-gradient-to-br from-neon-purple to-neon-blue"
          )}>
            <BarChart2 className="h-6 w-6 text-white" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-neon-green rounded-full flex items-center justify-center">
              <Zap className="h-3 w-3 text-white" />
            </div>
          </div>
          
          <div>
            <h1 className={cn(
              "text-2xl md:text-3xl font-bold",
              isDark ? "text-white" : "text-gray-800"
            )}>
              {isDashboardScreen ? (
                <>
                  <span className="text-gradient-blue">AI</span> Sales Dashboard
                </>
              ) : "Performance Analytics"}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Last updated: {format(parseISO(lastUpdate), 'MMM d, h:mm a')}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 rounded-full" 
                onClick={handleRefresh}
              >
                <RefreshCw 
                  className={cn(
                    "h-3 w-3", 
                    isRefreshing && "animate-spin"
                  )} 
                />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <AnimatePresence initial={false}>
            {isSearchOpen ? (
              <motion.form 
                initial={{ width: 40, opacity: 0 }}
                animate={{ width: 200, opacity: 1 }}
                exit={{ width: 40, opacity: 0 }}
                className="relative"
                onSubmit={handleSearchSubmit}
              >
                <Input
                  placeholder="Search dashboard..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 w-full"
                  autoFocus
                  onBlur={() => !searchQuery && setIsSearchOpen(false)}
                />
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              </motion.form>
            ) : (
              <motion.div
                initial={{ width: 40, opacity: 0 }}
                animate={{ width: 40, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
              >
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-9 w-9"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <DateRangeFilter 
            dateRange={filters.dateRange} 
            setDateRange={updateDateRange}
            className="min-w-[240px]"
          />
          
          <Button 
            variant={isRecording ? "destructive" : "default"}
            size="sm"
            className={cn(
              "gap-2",
              !isRecording && "bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-purple/90 hover:to-neon-blue/90"
            )}
            onClick={handleRecordingToggle}
          >
            {isRecording ? (
              <>
                <span className="flex h-2 w-2 rounded-full bg-white animate-pulse"></span>
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" />
                Record Call
              </>
            )}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/call-activity')}>
                <Calendar className="mr-2 h-4 w-4" />
                <span>Call Activity</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/performance')}>
                <BarChart2 className="mr-2 h-4 w-4" />
                <span>Performance Metrics</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/ai-coaching')}>
                <BrainCircuit className="mr-2 h-4 w-4" />
                <span>AI Coaching</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/transcripts')}>
                <MessageSquareText className="mr-2 h-4 w-4" />
                <span>Transcripts</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="h-9 w-9"
            onClick={handleRefresh}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
          
          <BulkUploadButton onClick={onBulkUploadOpen} />
          
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => {
            toast({
              title: "Report Downloaded",
              description: "Your dashboard report has been downloaded"
            });
          }}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
