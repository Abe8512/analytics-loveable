
import React from 'react';

// Using dynamic require to avoid import issues
// This avoids TypeScript's static analysis for imports
interface SidebarWrapperProps {
  setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  collapsed?: boolean;
}

const SidebarWrapper: React.FC<SidebarWrapperProps> = (props) => {
  // We're using require() to dynamically load the Sidebar component
  // This avoids TypeScript's static analysis and the case sensitivity issue
  const SidebarComponent = require('./Sidebar').default;
  
  return <SidebarComponent {...props} />;
};

export default SidebarWrapper;
