import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleName } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, loginWithDemo } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/citizen/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: RoleName) => {
    loginWithDemo(role);
    if (role === 'system_admin') navigate('/admin/dashboard');
    else if (role === 'department_head' || role === 'department_officer') navigate('/department/dashboard');
    else navigate('/citizen/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-govblue-600 text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-md">
            JS
          </div>
          <h1 className="text-2xl font-extrabold text-navy-800">Sign in to JanSahayak AI</h1>
          <p className="text-xs text-mutedtext">Access your public grievance dashboard</p>
        </div>

        {/* Demo Mode Instant Logins */}
        <div className="bg-surface p-4 rounded-2xl border border-govblue-200 bg-govblue-50/50 shadow-sm space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-navy-800">
            <UserCheck className="w-4 h-4 text-govblue-600" />
            <span>Instant Demo Logins (Click to Test Roles):</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleDemoLogin('citizen')}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-govblue-500 text-slate-700 font-semibold text-left transition-colors flex items-center justify-between"
            >
              <span>Citizen</span>
              <span className="text-[10px] text-govblue-600 font-bold">&rarr;</span>
            </button>
            <button
              onClick={() => handleDemoLogin('department_officer')}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-govblue-500 text-slate-700 font-semibold text-left transition-colors flex items-center justify-between"
            >
              <span>Field Officer</span>
              <span className="text-[10px] text-govblue-600 font-bold">&rarr;</span>
            </button>
            <button
              onClick={() => handleDemoLogin('department_head')}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-govblue-500 text-slate-700 font-semibold text-left transition-colors flex items-center justify-between"
            >
              <span>Dept Head</span>
              <span className="text-[10px] text-govblue-600 font-bold">&rarr;</span>
            </button>
            <button
              onClick={() => handleDemoLogin('system_admin')}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-govblue-500 text-slate-700 font-semibold text-left transition-colors flex items-center justify-between"
            >
              <span>System Admin</span>
              <span className="text-[10px] text-govblue-600 font-bold">&rarr;</span>
            </button>
          </div>
        </div>

        {/* Regular Login Form */}
        <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-govborder shadow-sm space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-navy-800">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-govborder focus:outline-none focus:ring-2 focus:ring-govblue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-navy-800">Password</label>
                <Link to="/forgot-password" className="text-govblue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-govborder focus:outline-none focus:ring-2 focus:ring-govblue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-govblue-600 hover:bg-govblue-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100 text-xs text-mutedtext">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-govblue-600 hover:underline">
              Register as Citizen
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
