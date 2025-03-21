import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Activity, 
  BarChart3, 
  Bot, 
  FileText, 
  Home, 
  LineChart, 
  MessageSquare, 
  Settings, 
  Users, 
  GitCompare, 
  Brain, 
  X,
  ChevronRight,
  Wand2
} from "lucide-react";
import { ThemeContext } from "@/App";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetOverlay } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  path: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  path,
  active = false,
  collapsed = false,
  onClick
}: SidebarItemProps) => {
  const { isDarkMode } = useContext(ThemeContext);
  
  return (
    <li className="px-2">
      <Link
        to={path}
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group overflow-hidden",
          active 
            ? isDarkMode 
              ? "bg-white/[0.06] text-white" 
              : "bg-primary/5 text-primary"
            : isDarkMode
              ? "text-white/70 hover:text-white hover:bg-white/[0.03]"
              : "text-gray-700 hover:text-primary hover:bg-primary/5"
        )}
      >
        <div className={cn(
          "relative transition-colors",
          active && "text-ai-blue"
        )}>
          <Icon 
            size={18}
            className={cn(
              "transition-colors",
              active 
                ? "text-ai-blue" 
                : isDarkMode
                  ? "text-white/70 group-hover:text-ai-blue"
                  : "text-gray-500 group-hover:text-primary"
            )} 
          />
          
          {active && (
            <motion.div 
              layoutId="sidebar-active-indicator"
              className="absolute -left-1 top-1/2 -translate-y-1/2 w-[3px] h-[70%] bg-ai-blue rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </div>
        
        {!collapsed && (
          <span className={cn(
            "text-sm font-medium transition-opacity duration-200",
            collapsed ? "opacity-0" : "opacity-100"
          )}>
            {label}
          </span>
        )}
        
        {active && !collapsed && (
          <div className="ml-auto">
            <ChevronRight className="h-4 w-4 text-ai-blue/50" />
          </div>
        )}
      </Link>
    </li>
  );
};

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  collapsed?: boolean;
}

const Sidebar = ({ isOpen = false, setIsOpen = () => {}, collapsed = false }: SidebarProps) => {
  const { isDarkMode } = useContext(ThemeContext);
  const isMobile = useIsMobile();
  const location = useLocation();
  const path = location.pathname;
  
  const navigationItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: Activity, label: "Call Activity", path: "/call-activity" },
    { icon: LineChart, label: "Performance", path: "/performance" },
    { icon: FileText, label: "Transcripts", path: "/transcripts" },
    { icon: Brain, label: "AI Coaching", path: "/ai-coaching" },
    { icon: BarChart3, label: "Analytics", path: "/analytics" },
    { icon: Users, label: "Team", path: "/team" },
    { icon: GitCompare, label: "Call Comparison", path: "/call-comparison" },
    { icon: MessageSquare, label: "Messaging", path: "/messaging" },
  ];

  const sidebarContent = (
    <div className={cn(
      "h-full flex flex-col transition-all duration-300 ease-in-out",
      isDarkMode 
        ? "bg-surface-dark border-r border-white/5" 
        : "bg-white border-r border-gray-100"
    )}>
      <div className="p-4">
        <div className="flex items-center gap-2 px-2 py-3">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-ai-blue/10 animate-pulse-slow" />
                <Bot className="h-5 w-5 text-ai-blue relative z-10" />
              </div>
              <div>
                <h1 className={cn(
                  "text-lg font-semibold flex items-center",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}>
                  <span className="text-animated-gradient">AI</span>
                  <span className="opacity-90">nalyzer</span>
                </h1>
              </div>
            </div>
          ) : (
            <div className="relative w-8 h-8 flex items-center justify-center mx-auto">
              <div className="absolute inset-0 rounded-full bg-ai-blue/10 animate-pulse-slow" />
              <Bot className="h-5 w-5 text-ai-blue relative z-10" />
            </div>
          )}
          
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-auto -mr-2" 
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      
      <div className={cn(
        "mt-4 px-2 mx-2 py-1.5 rounded-lg bg-gradient-to-r",
        isDarkMode 
          ? "from-ai-indigo/10 to-ai-blue/10 border border-white/5" 
          : "from-ai-indigo/5 to-ai-blue/5 border border-black/5"
      )}>
        <div className="flex items-center gap-3 px-3 py-2">
          <Wand2 className="h-4 w-4 text-ai-purple" />
          {!collapsed && <span className="text-xs font-medium">AI Features Enabled</span>}
        </div>
      </div>
      
      <nav className="mt-6 flex-1 space-y-1 overflow-y-auto">
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <SidebarItem 
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              active={path === item.path}
              collapsed={collapsed}
              onClick={isMobile ? () => setIsOpen(false) : undefined}
            />
          ))}
        </ul>
      </nav>
      
      <div className={cn(
        "p-4 mt-auto",
        isDarkMode ? "border-t border-white/5" : "border-t border-gray-100"
      )}>
        <SidebarItem 
          icon={Settings}
          label="Settings"
          path="/settings"
          active={path === "/settings"}
          collapsed={collapsed}
          onClick={isMobile ? () => setIsOpen(false) : undefined}
        />
      </div>
    </div>
  );
  
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent 
          side="left" 
          className="p-0 w-[280px] sm:max-w-xs"
        >
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }
  
  return (
    <div className={cn(
      "sticky top-0 h-screen transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {sidebarContent}
    </div>
  );
};

export default Sidebar;
