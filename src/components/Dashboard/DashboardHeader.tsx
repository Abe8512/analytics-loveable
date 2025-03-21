
import React, { useState, useEffect } from "react";
import { 
  BarChart2, Filter, Calendar, Download, RefreshCw, 
  Zap, Mic, Settings, Search, MessageSquareText, BrainCircuit,
  Command
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
      "relative mb-6 pb-5 border-b",
      isDark ? "border-white/10" : "border-gray-200"
    )}>
      <div className="flex flex-col md:flex-row justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className={cn(
            "relative flex items-center justify-center w-14 h-14 rounded-xl",
            "bg-gradient-to-br from-ai-indigo via-ai-purple to-ai-blue shadow-md"
          )}>
            <BarChart2 className="h-7 w-7 text-white" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-ai-teal rounded-full flex items-center justify-center shadow-sm">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
          
          <div>
            <h1 className={cn(
              "text-2xl md:text-3xl font-bold",
              isDark ? "text-white" : "text-gray-800"
            )}>
              {isDashboardScreen ? (
                <>
                  <span className="bg-gradient-to-r from-ai-indigo to-ai-blue bg-clip-text text-transparent">AI</span> Sales Dashboard
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
        
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center mr-1 text-xs text-muted-foreground">
            <Command className="h-3.5 w-3.5 mr-1 opacity-70" /> 
            <span className="hidden sm:inline-block">Press</span> <kbd className="ml-1 px-1.5 py-0.5 rounded bg-muted border border-border">K</kbd>
          </div>
          
          <AnimatePresence initial={false}>
            {isSearchOpen ? (
              <motion.form 
                initial={{ width: 40, opacity: 0 }}
                animate={{ width: 220, opacity: 1 }}
                exit={{ width: 40, opacity: 0 }}
                className="relative"
                onSubmit={handleSearchSubmit}
              >
                <Input
                  placeholder="Search dashboard..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 w-full focus-visible:ring-ai-blue/40"
                  autoFocus
                  onBlur={() => !searchQuery && setIsSearchOpen(false)}
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                  className="h-10 w-10"
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
            className="min-w-[250px]"
          />
          
          <Button 
            variant={isRecording ? "destructive" : "default"}
            size="sm"
            className={cn(
              "h-10 gap-2 shadow-sm",
              !isRecording && "bg-gradient-to-r from-ai-purple to-ai-blue hover:from-ai-purple/90 hover:to-ai-blue/90"
            )}
            onClick={handleRecordingToggle}
          >
            {isRecording ? (
              <>
                <span className="flex h-2.5 w-2.5 rounded-full bg-white animate-pulse"></span>
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
              <Button variant="outline" size="icon" className="h-10 w-10">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
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
            className="h-10 w-10"
            onClick={handleRefresh}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
          
          <BulkUploadButton onClick={onBulkUploadOpen} />
          
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10" 
            onClick={() => {
              toast({
                title: "Report Downloaded",
                description: "Your dashboard report has been downloaded"
              });
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
