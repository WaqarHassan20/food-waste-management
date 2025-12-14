import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Logo, NotificationDropdown } from '../ui';
import { LogOut, LogIn, UserPlus, UserCircle, ShieldCheck, Store, Menu, X } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
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

                {/* Notifications */}
                <NotificationDropdown />

                {/* Profile Dropdown */}
                <div className="relative flex items-center" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="relative w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center hover:bg-slate-700 transition-colors duration-200 border border-slate-500"
                  >
                    {/* Role-based Avatar Icons */}
                    {userRole === 'ADMIN' ? (
                      <ShieldCheck
                        size={24}
                        className="text-white"
                        strokeWidth={2}
                      />
                    ) : userRole === 'RESTAURANT' ? (
                      <Store
                        size={24}
                        className="text-white"
                        strokeWidth={2}
                      />
                    ) : (
                      <UserCircle
                        size={24}
                        className="text-white"
                        strokeWidth={2}
                      />
                    )}
                  </button>

                  {/* Dropdown Menu - Below the profile icon */}
                  {isDropdownOpen && (
                    <div className="absolute top-full mt-2 right-0 animate-slideDown">
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

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-emerald-100 animate-slideDown">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                  <p className="text-xs text-emerald-600 uppercase tracking-wider mt-1">{userRole}</p>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 bg-white hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 border border-gray-200 hover:border-red-300"
                >
                  <LogOut size={16} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    handleAuthClick('signin');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-center text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
                >
                  <LogIn size={18} className="mr-2" />
                  Sign In
                </Button>
                <Button
                  onClick={() => {
                    handleAuthClick('signup');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg"
                >
                  <UserPlus size={18} className="mr-2" />
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add keyframe animation */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </nav>
  );
};