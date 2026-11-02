import React from 'react';
import { FileText } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <div className="flex items-center gap-2 text-govblue-600">
        <FileText className="w-5 h-5" />
        <span className="text-xs font-bold uppercase tracking-wider">Terms of Public Service</span>
      </div>
      <h1 className="text-3xl font-extrabold text-navy-800">Terms of Service</h1>
      <p className="text-xs text-mutedtext">Effective: November 2026</p>

      <div className="space-y-4 text-xs text-slate-600 leading-relaxed bg-surface p-6 rounded-2xl border border-govborder shadow-sm">
        <h3 className="font-bold text-sm text-navy-800">1. Proper Use of Grievance Redressal</h3>
        <p>
          Citizens agree to submit truthful, accurate civic complaints without hate speech, defamation, or frivolous misuse. JanSahayak AI is intended to resolve public infrastructure, utility, and municipal service issues.
        </p>

        <h3 className="font-bold text-sm text-navy-800">2. Advisory Nature of AI Recommendations</h3>
        <p>
          AI-generated category, urgency scores, and summaries are advisory assistive mechanisms. Department personnel retain final authority and responsibility for all official actions, inspections, and resolutions.
        </p>

        <h3 className="font-bold text-sm text-navy-800">3. Emergency Situations</h3>
        <p className="p-3 bg-red-50 text-red-900 border border-red-200 rounded-lg font-medium">
          Warning: JanSahayak AI is not a replacement for immediate life-threatening emergency services. For active fire, medical emergencies, or severe crimes in progress, please dial 112 directly.
        </p>
      </div>
    </div>
  );
};
