
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

// Redirect to the new Sidebar implementation
// This file exists only for backward compatibility
import Sidebar from './Sidebar';

interface SideBarProps {
  setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const SideBar: React.FC<SideBarProps> = (props) => {
  return <Sidebar {...props} />;
};

export default SideBar;
