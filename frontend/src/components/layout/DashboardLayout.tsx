import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FileText,
  PlusCircle,
  Clock,
  User,
  Building2,
  BarChart3,
  Users,
  Shield,
  Layers,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronRight,
  FolderOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationCenter } from './NotificationCenter';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Build role-specific sidebar items
  const getNavItems = () => {
    if (role === 'system_admin') {
      return [
        { label: 'Admin Overview', path: '/admin/dashboard', icon: BarChart3 },
        { label: 'User & Role Mgmt', path: '/admin/users', icon: Users },
        { label: 'Departments', path: '/admin/departments', icon: Building2 },
        { label: 'Complaint Categories', path: '/admin/categories', icon: Layers },
        { label: 'Audit Trail Logs', path: '/admin/audit-logs', icon: Shield },
      ];
    }
    if (role === 'department_officer' || role === 'department_head') {
      return [
        { label: 'Department Queue', path: '/department/dashboard', icon: FolderOpen },
        { label: 'All Cases', path: '/department/complaints', icon: FileText },
        { label: 'Performance Analytics', path: '/department/analytics', icon: BarChart3 },
      ];
    }
    // Citizen Navigation
    return [
      { label: 'Citizen Dashboard', path: '/citizen/dashboard', icon: Clock },
      { label: 'Lodge Grievance', path: '/citizen/complaints/new', icon: PlusCircle },
      { label: 'My Complaints', path: '/citizen/complaints', icon: FileText },
      { label: 'Profile & Settings', path: '/citizen/profile', icon: User },
    ];
  };

  const navItems = getNavItems();

  const getPortalTitle = () => {
    if (role === 'system_admin') return 'System Administration';
    if (role === 'department_head') return 'Department Head Workspace';
    if (role === 'department_officer') return 'Department Redressal Desk';
    return 'Citizen Redressal Portal';
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-navy-900 border-r border-navy-800 text-white min-h-screen flex-shrink-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-navy-800">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-govblue-600 flex items-center justify-center font-bold text-sm text-white">
              JS
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight flex items-center gap-1">
                <span>JanSahayak</span>
                <span className="text-[10px] bg-saffron-500 text-navy-900 font-bold px-1 rounded">AI</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Grievance Portal</span>
            </div>
          </Link>
        </div>

        {/* User Context Card */}
        <div className="p-4 mx-3 my-4 rounded-xl bg-navy-800/80 border border-navy-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-govblue-600/30 text-govblue-500 flex items-center justify-center font-bold text-sm border border-govblue-500/40">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user?.full_name || 'Guest User'}</p>
              <span className="inline-block text-[10px] font-medium text-emerald-400 capitalize">
                {role ? role.replace('_', ' ') : 'Citizen'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-govblue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-navy-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-navy-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar Header */}
        <header className="bg-surface border-b border-govborder h-16 flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-medium text-mutedtext">
              <span className="font-semibold text-navy-800">{getPortalTitle()}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
              <span className="hidden sm:inline text-slate-500 capitalize">
                {location.pathname.split('/').pop()?.replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Lodge Grievance for Citizen */}
            {role === 'citizen' && location.pathname !== '/citizen/complaints/new' && (
              <Link
                to="/citizen/complaints/new"
                className="hidden sm:flex items-center gap-1.5 bg-govblue-600 hover:bg-govblue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Grievance</span>
              </Link>
            )}

            {/* Notification Bell */}
            <button
              onClick={() => setNotificationOpen(true)}
              className="relative p-2 text-slate-600 hover:text-govblue-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-saffron-500"></span>
            </button>

            <Link
              to="/"
              className="text-xs text-mutedtext hover:text-govblue-600 font-medium px-2 py-1 rounded transition-colors hidden sm:inline"
            >
              Public Site
            </Link>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Notification Slideover Drawer */}
      <NotificationCenter isOpen={notificationOpen} onClose={() => setNotificationOpen(false)} />

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>
          <div className="relative w-64 bg-navy-900 text-white flex flex-col p-4 shadow-xl z-10">
            <div className="flex items-center justify-between pb-4 border-b border-navy-800">
              <span className="font-bold text-sm text-white">Navigation</span>
              <button onClick={() => setMobileSidebarOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <nav className="flex-1 mt-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-navy-800"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs text-red-400 py-3 border-t border-navy-800"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
