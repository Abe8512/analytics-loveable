
import React, { useContext, useState, useMemo } from "react";
import Sidebar from "./SideBar"; // Ensure correct casing matches the actual filename
import TopBar from "./TopBar";
import { ThemeContext } from "@/App";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Optimize classes with useMemo to prevent recalculation on every render
  const layoutClasses = useMemo(() => 
    cn("flex min-h-screen transition-colors duration-300", 
      isDarkMode ? 'bg-surface-darker' : 'bg-gray-50'),
    [isDarkMode]
  );
  
  const mainClasses = useMemo(() => 
    cn(
      "flex-1 p-6 pt-16 overflow-y-auto transition-colors duration-300 hardware-accelerated",
      isDarkMode 
        ? 'bg-surface-darker bg-[radial-gradient(at_30%_30%,rgba(123,97,255,0.03)_0%,rgba(0,194,255,0.03)_50%,transparent_100%)]' 
        : 'bg-gray-50 bg-[radial-gradient(at_30%_30%,rgba(123,97,255,0.02)_0%,rgba(0,194,255,0.02)_50%,transparent_100%)]'
    ),
    [isDarkMode]
  );

  return (
    <div className={layoutClasses}>
      <Sidebar setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-col flex-1 relative">
        <TopBar /> {/* Remove the setSidebarOpen prop since it doesn't exist on TopBar */}
        
        {/* Matrix code rain effect in dark mode */}
        {isDarkMode && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03] z-0">
            <div className="matrix-rain-container">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="matrix-rain-column text-xs font-mono text-ai-blue whitespace-pre leading-none"
                  style={{
                    left: `${i * 5}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${15 + Math.random() * 10}s`
                  }}
                >
                  {Array.from({ length: 30 }).map((_, j) => (
                    <div key={j} className="inline-block animate-blink" style={{
                      animationDelay: `${Math.random() * 5}s`
                    }}>
                      {String.fromCharCode(33 + Math.floor(Math.random() * 93))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <main className={mainClasses}>
          <motion.div 
            className="max-w-7xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
      
      {/* Floating decorative elements in dark mode */}
      {isDarkMode && (
        <>
          <div className="fixed bottom-10 right-10 w-32 h-32 bg-ai-purple/5 rounded-full blur-3xl pointer-events-none" />
          <div className="fixed top-20 left-[30%] w-64 h-64 bg-ai-blue/5 rounded-full blur-3xl pointer-events-none" />
        </>
      )}
    </div>
  );
};

export default React.memo(DashboardLayout);
