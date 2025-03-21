
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

// Import the actual component implementation
import Sidebar from './Sidebar';

interface SideBarProps {
  setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  collapsed?: boolean;
}

// Redirect to the new Sidebar implementation
// This file exists only for backward compatibility
const SideBar: React.FC<SideBarProps> = (props) => {
  return <Sidebar {...props} />;
};

export default SideBar;
