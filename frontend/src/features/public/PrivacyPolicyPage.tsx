import React from 'react';
import { Shield } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <div className="flex items-center gap-2 text-govblue-600">
        <Shield className="w-5 h-5" />
        <span className="text-xs font-bold uppercase tracking-wider">Privacy & Data Governance</span>
      </div>
      <h1 className="text-3xl font-extrabold text-navy-800">Privacy Policy</h1>
      <p className="text-xs text-mutedtext">Last Updated: November 2026</p>

      <div className="space-y-4 text-xs text-slate-600 leading-relaxed bg-surface p-6 rounded-2xl border border-govborder shadow-sm">
        <h3 className="font-bold text-sm text-navy-800">1. Information We Collect</h3>
        <p>
          We collect only information essential to addressing your civic grievance: your name, contact email or phone number, complaint title, description, location (state/district/locality), and any optional documents you upload.
        </p>

        <h3 className="font-bold text-sm text-navy-800">2. Multilingual Audio & AI Processing</h3>
        <p>
          Audio recordings submitted for speech recognition are temporarily processed by verified neural models solely for transcription and translation into English for departmental routing. We do not sell or monetize personal voice data.
        </p>

        <h3 className="font-bold text-sm text-navy-800">3. Role-Based Access Protection</h3>
        <p>
          Complaints are scoped strictly by verified roles: citizens can view only their own cases; department officers view only complaints within their authorized department jurisdiction; and public tracking strips all citizen PII.
        </p>

        <h3 className="font-bold text-sm text-navy-800">4. Legal Review Notice</h3>
        <p className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg">
          Notice: This privacy policy is designed for the JanSahayak AI technology platform. Formal statutory deployments must undergo final compliance review by appropriate legal and jurisdictional authorities.
        </p>
      </div>
    </div>
  );
};
