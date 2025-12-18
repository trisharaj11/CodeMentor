import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, LogOut, User, BarChart3, History, FileCode } from 'lucide-react';
import { Button } from './ui/button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b border-zinc-800 glass sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2" data-testid="logo-link">
            <Code2 className="w-6 h-6 text-violet-500" />
            <span className="text-xl font-mono font-bold">CodeMentor AI</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/submit" data-testid="submit-nav-link">
              <Button variant="ghost" className="text-zinc-400 hover:text-white">
                <FileCode className="w-4 h-4 mr-2" />
                Submit Code
              </Button>
            </Link>
            <Link to="/history" data-testid="history-nav-link">
              <Button variant="ghost" className="text-zinc-400 hover:text-white">
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
            </Link>
            <Link to="/analytics" data-testid="analytics-nav-link">
              <Button variant="ghost" className="text-zinc-400 hover:text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </Link>
            <Link to="/profile" data-testid="profile-nav-link">
              <Button variant="ghost" className="text-zinc-400 hover:text-white">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </Link>
            <Button onClick={handleLogout} variant="ghost" className="text-zinc-400 hover:text-red-400" data-testid="logout-button">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
