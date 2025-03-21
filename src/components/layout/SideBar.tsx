
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  BarChart2, 
  Home, 
  Settings, 
  Headphones, 
  Brain, 
  Mic, 
  PieChart,
  Users,
  GitCompare,
  MessageSquare
} from 'lucide-react';

interface SideBarProps {
  setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const SideBar: React.FC<SideBarProps> = ({ setSidebarOpen }) => {
  const location = useLocation();
  
  const closeMenu = () => {
    if (setSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { path: '/analytics', label: 'Analytics', icon: <PieChart className="w-5 h-5" /> },
    { path: '/call-activity', label: 'Call Activity', icon: <Headphones className="w-5 h-5" /> },
    { path: '/ai-coaching', label: 'AI Coaching', icon: <Brain className="w-5 h-5" /> },
    { path: '/transcribe', label: 'Transcribe', icon: <Mic className="w-5 h-5" /> },
    { path: '/team', label: 'Team', icon: <Users className="w-5 h-5" /> },
    { path: '/call-comparison', label: 'Call Comparison', icon: <GitCompare className="w-5 h-5" /> },
    { path: '/messaging', label: 'Messaging', icon: <MessageSquare className="w-5 h-5" /> },
    { path: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="w-full h-full bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border overflow-y-auto">
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
          <BarChart2 className="w-6 h-6 text-sidebar-primary" />
          <span className="font-bold text-lg">Future Sentiment</span>
        </Link>
      </div>
      
      <nav className="p-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={closeMenu}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  location.pathname === item.path
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/80"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default SideBar;
