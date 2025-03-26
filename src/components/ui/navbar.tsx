
import React from 'react';
import { Link } from 'react-router-dom';
import { Database } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="border-b bg-background">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-xl font-bold">Future Sentiment</Link>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
              Dashboard
            </Link>
            <Link to="/calls" className="text-sm font-medium transition-colors hover:text-primary">
              Calls
            </Link>
            <Link to="/transcripts" className="text-sm font-medium transition-colors hover:text-primary">
              Transcripts
            </Link>
            <Link to="/upload" className="text-sm font-medium transition-colors hover:text-primary">
              Upload
            </Link>
            <Link to="/database" className="text-sm font-medium transition-colors hover:text-primary flex items-center">
              <Database className="h-4 w-4 mr-1" />
              Database
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
