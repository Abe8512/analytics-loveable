
import React, { useContext } from "react";
import { ThemeContext } from "@/App";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import UserDropdown from "./UserDropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import NotificationCenter from "../NotificationCenter/NotificationCenter";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface TopBarProps {
  setSidebarOpen: (open: boolean) => void;
}

const TopBar = ({ setSidebarOpen }: TopBarProps) => {
  const { isDarkMode } = useContext(ThemeContext);
  const isMobile = useIsMobile();

  return (
    <div className="fixed top-0 right-0 z-10 p-4">
      <div className="flex items-center gap-2">
        {isMobile && (
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setSidebarOpen(true)}
            className="bg-card/50 backdrop-blur-md border-white/10 text-foreground"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        <ThemeToggle variant="icon" className="bg-card/50 backdrop-blur-md border border-white/10" />
        
        <NotificationCenter />
        
        <UserDropdown />
      </div>
    </div>
  );
};

export default TopBar;
