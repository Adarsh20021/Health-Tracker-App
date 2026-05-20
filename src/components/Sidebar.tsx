import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, LogOut, Menu, X, HeartPulse } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'History Logs', path: '/history', icon: Calendar },
  ];

  const handleItemClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Top Navigation Header */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 border-b border-slate-800 px-6 py-4 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">
            <HeartPulse className="h-5 w-5 text-white" />
          </div>
          <span className="font-sans font-bold text-lg text-white tracking-tight">Health Tracker</span>
        </div>
        <button
          id="mobile-menu-toggle"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors focus:outline-none"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Layout Drawer */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shadow-lg md:sticky md:h-screen md:top-0`}
      >
        <div className="flex flex-col flex-1 pl-4 pr-4 py-8 md:py-9">
          {/* Brand Logo header */}
          <div className="flex items-center space-x-3 px-3 mb-10 hidden md:flex">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">
              <HeartPulse className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-bold text-base text-white leading-tight">Health Tracker</span>
              <span className="font-sans text-xs text-slate-500">Student Project</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={handleItemClick}
                  className={({ isActive }) =>
                    `flex items-center space-x-3.5 px-4 py-3 rounded-lg font-sans text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600/20 text-white border-l-4 border-indigo-500 rounded-r-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Connected User Badge */}
          {user && (
            <div className="border-t border-slate-800 pt-5 px-3 mb-5">
              <div className="flex flex-col">
                <span className="font-sans text-[10px] text-slate-500 font-bold uppercase tracking-wider">LOGGED IN AS</span>
                <span className="font-sans font-semibold text-sm text-slate-200 truncate mt-0.5" title={user.name}>
                  {user.name}
                </span>
                <span className="font-sans text-xs text-slate-400 truncate" title={user.email}>
                  {user.email}
                </span>
              </div>
            </div>
          )}

          {/* Logout Section */}
          <button
            id="sidebar-logout"
            onClick={handleLogout}
            className="flex items-center space-x-3.5 w-full px-4 py-3 rounded-lg font-sans text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all focus:outline-none"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Screen Veil backdrop for Mobile Open State */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/15 backdrop-blur-xs z-30 md:hidden"
        />
      )}
    </>
  );
};
