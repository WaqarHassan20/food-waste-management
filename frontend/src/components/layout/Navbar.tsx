import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Logo } from '../ui';
import { LogOut, LogIn, UserPlus, UserCircle } from 'lucide-react';
import type { UserRole } from '../../types';

interface NavbarProps {
  isAuthenticated: boolean;
  userRole: UserRole | null;
  userName: string | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isAuthenticated,
  userRole,
  userName,
  onLogout,
}) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    navigate(`/auth/${mode}`);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-emerald-100 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="cursor-pointer hover:opacity-90 transition-opacity">
            <Logo size="md" variant="light" showText={true} />
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200">
                  <span className="text-sm text-gray-700 font-medium">
                    {userName}
                  </span>
                  <span className="mx-2 text-gray-400">|</span>
                  <span className="text-xs text-emerald-600 uppercase tracking-wider font-semibold">
                    {userRole}
                  </span>
                </div>

                {/* Profile Dropdown */}
                <div className="relative flex items-center" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="relative w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center hover:bg-slate-700 transition-colors duration-200 border border-slate-500"
                  >
                    {/* Simple User Avatar Icon */}
                    <UserCircle
                      size={24}
                      className="text-white"
                      strokeWidth={2}
                    />
                  </button>

                  {/* Dropdown Menu - Slides in from right aligned with profile */}
                  {isDropdownOpen && (
                    <div
                      className="absolute left-full ml-2 top-1/2 -translate-y-1/2 animate-slideInRight"
                      style={{
                        animation: 'slideInRight 0.2s ease-out forwards'
                      }}
                    >
                      <button
                        onClick={() => {
                          onLogout();
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 shadow-lg border border-gray-200 hover:border-red-300 whitespace-nowrap"
                      >
                        <LogOut size={16} />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => handleAuthClick('signin')}
                  size="sm"
                  className="text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
                >
                  <LogIn size={18} className="sm:mr-2" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
                <Button
                  onClick={() => handleAuthClick('signup')}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-600/20"
                >
                  <UserPlus size={18} className="sm:mr-2" />
                  <span className="hidden sm:inline">Sign Up</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add keyframe animation */}
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </nav>
  );
};