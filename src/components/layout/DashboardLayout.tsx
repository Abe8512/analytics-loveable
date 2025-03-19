
import React, { useContext, useState, useMemo } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { ThemeContext } from "@/App";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Optimize classes with useMemo to prevent recalculation on every render
  const layoutClasses = useMemo(() => 
    cn("flex min-h-screen", isDarkMode ? 'bg-dark-purple' : 'bg-white'),
    [isDarkMode]
  );
  
  const mainClasses = useMemo(() => 
    cn(
      "flex-1 p-6 pt-16 overflow-y-auto transition-colors duration-200 hardware-accelerated",
      isDarkMode ? 
        'bg-dark-purple bg-[radial-gradient(at_top_left,rgba(139,92,246,0.05)_0%,rgba(0,240,255,0.05)_100%)]' : 
        'bg-gray-50 bg-[radial-gradient(at_top_left,rgba(139,92,246,0.02)_0%,rgba(0,240,255,0.02)_100%)]'
    ),
    [isDarkMode]
  );

  return (
    <div className={layoutClasses}>
      <Sidebar isDarkMode={isDarkMode} />
      <div className="flex flex-col flex-1">
        <TopBar setSidebarOpen={setSidebarOpen} />
        <main className={mainClasses}>
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-bl from-blue-900/5 via-purple-900/5 to-transparent backdrop-blur-[2px] rounded-xl p-4 md:p-6 border border-white/5 shadow-2xl shadow-blue-500/5">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default React.memo(DashboardLayout);
