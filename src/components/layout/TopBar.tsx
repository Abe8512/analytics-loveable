import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Moon, Sun, Bell, Menu, X } from 'lucide-react';
import { ThemeContext } from '@/App';
import ThemeToggle from '../ui/ThemeToggle';
import UserDropdown from '../ui/UserDropdown';
import NotificationCenter from '../ui/NotificationCenter';
import ConnectionStatusBadge from '../ui/ConnectionStatusBadge';

const TopBar = () => {
  const { isDarkMode } = React.useContext(ThemeContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-primary-500 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300';
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} fixed top-0 left-0 right-0 border-b z-40 pl-[250px] pr-4 h-16 flex items-center justify-between transition-colors duration-150`}>
      <div className="flex items-center gap-4">
        <button onClick={toggleMobileMenu} className="lg:hidden">
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <Link to="/" className="hidden lg:block font-bold text-lg">
          Sentiment Analytics
        </Link>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Add the connection status badge */}
        <ConnectionStatusBadge size="sm" />
        
        <NotificationCenter />
        <ThemeToggle />
        <UserDropdown />
      </div>
    </div>
  );
};

export default TopBar;
