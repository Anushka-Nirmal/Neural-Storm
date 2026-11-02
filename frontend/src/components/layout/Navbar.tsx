import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  Globe,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  FileText,
  Building2,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const Navbar: React.FC = () => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const { currentLanguage, setLanguage, availableLanguages, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (role === 'system_admin') return '/admin/dashboard';
    if (role === 'department_head' || role === 'department_officer') return '/department/dashboard';
    return '/citizen/dashboard';
  };

  const currentLangObj = availableLanguages.find((l) => l.code === currentLanguage) || availableLanguages[0];

  return (
    <header className="bg-navy-900 text-white sticky top-0 z-50 shadow-md border-b border-navy-700">
      {/* Top Gov announcement bar */}
      <div className="bg-navy-800 text-xs py-1.5 px-4 text-slate-300 flex justify-between items-center border-b border-navy-700">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>JanSahayak AI • Official Grievance Redressal Gateway</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-slate-400">
          <span>Accessible in 13 Indian Languages</span>
          <span>•</span>
          <span>24/7 Redressal Monitoring</span>
        </div>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-govblue-600 flex items-center justify-center text-white shadow-inner font-bold text-xl group-hover:bg-govblue-500 transition-colors">
            JS
          </div>
          <div>
            <div className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
              <span>JanSahayak</span>
              <span className="text-xs bg-saffron-500 text-navy-900 font-bold px-1.5 py-0.5 rounded tracking-normal">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-300 tracking-wide font-medium hidden sm:block">
              {t('tagline')}
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            to="/how-it-works"
            className={`transition-colors hover:text-govblue-500 ${
              location.pathname === '/how-it-works' ? 'text-white font-semibold' : 'text-slate-300'
            }`}
          >
            {t('howItWorks')}
          </Link>
          <Link
            to="/languages"
            className={`transition-colors hover:text-govblue-500 ${
              location.pathname === '/languages' ? 'text-white font-semibold' : 'text-slate-300'
            }`}
          >
            {t('languages')}
          </Link>
          <Link
            to="/about"
            className={`transition-colors hover:text-govblue-500 ${
              location.pathname === '/about' ? 'text-white font-semibold' : 'text-slate-300'
            }`}
          >
            {t('about')}
          </Link>
          <Link
            to="/help"
            className={`transition-colors hover:text-govblue-500 ${
              location.pathname === '/help' ? 'text-white font-semibold' : 'text-slate-300'
            }`}
          >
            {t('help')}
          </Link>
        </div>

        {/* Right Action Bar */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-navy-700 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-saffron-500" />
              <span>{currentLangObj.native_name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-bodytext rounded-xl shadow-xl border border-govborder py-2 z-50 max-h-72 overflow-y-auto">
                <div className="px-3 py-1 text-[11px] font-bold text-mutedtext uppercase tracking-wider border-b border-slate-100">
                  Select Language
                </div>
                {availableLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      lang.code === currentLanguage ? 'font-bold text-govblue-600 bg-govblue-50' : 'text-slate-700'
                    }`}
                  >
                    <span>{lang.native_name}</span>
                    <span className="text-[11px] text-mutedtext">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Authenticated Controls */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to={getDashboardPath()}
                className="flex items-center gap-2 bg-govblue-600 hover:bg-govblue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Dashboard ({role === 'system_admin' ? 'Admin' : role?.replace('_', ' ')})</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-navy-800 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-200 hover:text-white px-3 py-2 rounded-lg transition-colors"
              >
                {t('login')}
              </Link>
              <Link
                to="/register"
                className="text-xs font-semibold bg-saffron-500 hover:bg-saffron-600 text-navy-900 px-3.5 py-2 rounded-lg transition-colors shadow-sm"
              >
                {t('register')}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-navy-800 border-b border-navy-700 px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-slate-200 hover:text-white py-1"
          >
            {t('howItWorks')}
          </Link>
          <Link
            to="/languages"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-slate-200 hover:text-white py-1"
          >
            {t('languages')}
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-slate-200 hover:text-white py-1"
          >
            {t('about')}
          </Link>
          <Link
            to="/help"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-slate-200 hover:text-white py-1"
          >
            {t('help')}
          </Link>

          <div className="pt-2 border-t border-navy-700 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center bg-govblue-600 text-white py-2 rounded-lg text-sm font-semibold"
                >
                  My Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center bg-navy-700 text-red-300 py-2 rounded-lg text-sm font-semibold"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center border border-slate-600 text-slate-200 py-2 rounded-lg text-sm font-semibold"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center bg-saffron-500 text-navy-900 py-2 rounded-lg text-sm font-semibold"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
