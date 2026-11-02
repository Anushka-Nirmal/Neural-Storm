import React from 'react';
import { ShieldCheck, HeartHandshake, Eye, Lock } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div className="space-y-3">
        <span className="text-xs font-bold text-govblue-600 uppercase tracking-wider">About The Initiative</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-800">
          JanSahayak AI: Empowering Every Indian Voice
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Public grievance redressal is the backbone of democratic governance. Yet millions of citizens face obstacles navigating complex bureaucratic terminology, English-centric portals, or lack of status tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface p-6 rounded-2xl border border-govborder shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-govblue-50 text-govblue-600 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-navy-800">Linguistic Inclusion</h3>
          <p className="text-xs text-mutedtext leading-relaxed">
            Citizens can register grievances in 13 Indian languages using native text or voice, ensuring digital governance is accessible to all demographics.
          </p>
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-govborder shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-govteal-500 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-navy-800">Radical Transparency</h3>
          <p className="text-xs text-mutedtext leading-relaxed">
            Every complaint has an unalterable audit log. Citizens view step-by-step progress, who was assigned, and reasons for any delays.
          </p>
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-govborder shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-saffron-500 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-navy-800">Automated SLA Escalation</h3>
          <p className="text-xs text-mutedtext leading-relaxed">
            Configurable SLA deadlines (e.g. 24h for critical emergencies, 48h for high) automatically elevate stagnant complaints to Department Heads.
          </p>
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-govborder shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-navy-800">Privacy & Security First</h3>
          <p className="text-xs text-mutedtext leading-relaxed">
            Zero public leakage of citizen PII. Server-side role-based access control and strict boundary enforcement across departments.
          </p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-2">
        <h4 className="font-bold text-navy-800 uppercase tracking-wide">Civic Tech Disclaimer</h4>
        <p>
          JanSahayak AI is developed as a public civic technology system. Unless explicitly certified, this platform operates as an independent demonstration and technology accelerator for public grievance redressal workflows.
        </p>
      </div>
    </div>
  );
};
