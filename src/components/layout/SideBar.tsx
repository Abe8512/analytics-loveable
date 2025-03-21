
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

// This file is a compatibility wrapper that forwards to SidebarWrapper
// to solve case sensitivity issues

interface SideBarProps {
  setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  collapsed?: boolean;
}

const SideBar: React.FC<SideBarProps> = (props) => {
  // Forward to the new wrapper component
  const SidebarWrapper = require('./SidebarWrapper').default;
  return <SidebarWrapper {...props} />;
};

export default SideBar;
