import React, { useState } from 'react';
import { User, Mail, Globe, Bell, Shield, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const CitizenProfile: React.FC = () => {
  const { user } = useAuth();
  const { availableLanguages } = useLanguage();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [preferredLang, setPreferredLang] = useState(user?.preferred_language || 'hi');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-800">Profile & Preferences</h1>
        <p className="text-xs text-mutedtext">Manage your account information and notification settings.</p>
      </div>

      <form onSubmit={handleSave} className="bg-surface rounded-2xl p-6 sm:p-8 border border-govborder shadow-sm space-y-6">
        {saved && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            Profile preferences saved successfully!
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-navy-800">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-govborder focus:ring-2 focus:ring-govblue-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-navy-800">Email Address (Read-only)</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-govborder bg-slate-50 text-slate-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-navy-800">Preferred Response Language</label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <select
                value={preferredLang}
                onChange={(e) => setPreferredLang(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-govborder bg-white focus:ring-2 focus:ring-govblue-500"
              >
                {availableLanguages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.native_name} ({l.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notification toggles */}
          <div className="pt-4 border-t border-govborder space-y-3">
            <h3 className="text-xs font-bold text-navy-800 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-govblue-600" />
              <span>Notification Channels</span>
            </h3>

            <div className="flex items-center justify-between text-xs p-3 rounded-xl border border-govborder bg-slate-50">
              <div>
                <p className="font-semibold text-navy-800">Email Notifications</p>
                <p className="text-[11px] text-mutedtext">Receive status updates and resolution briefs via email</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 text-govblue-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between text-xs p-3 rounded-xl border border-govborder bg-slate-50">
              <div>
                <p className="font-semibold text-navy-800">SMS Alerts</p>
                <p className="text-[11px] text-mutedtext">Get instant text alerts when officer dispatches action</p>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 text-govblue-600 rounded"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 bg-govblue-600 hover:bg-govblue-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-sm transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Preferences</span>
        </button>
      </form>
    </div>
  );
};
