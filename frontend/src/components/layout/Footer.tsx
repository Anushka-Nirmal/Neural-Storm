import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, HeartHandshake, Lock, PhoneCall, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-900 text-slate-300 pt-12 pb-8 border-t border-navy-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-govblue-600 flex items-center justify-center text-white font-bold text-sm">
                JS
              </div>
              <span className="font-extrabold text-lg text-white">JanSahayak AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              An intelligent, multilingual public grievance redressal platform enabling citizens to submit grievances in their preferred Indian language through natural voice or text.
            </p>
            <div className="flex items-center gap-2 text-xs text-saffron-500 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Transparent & Accountable Redressal</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home Portal</Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">How Redressal Works</Link>
              </li>
              <li>
                <Link to="/languages" className="hover:text-white transition-colors">Supported Indic Languages</Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-white transition-colors">Frequently Asked Questions</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">About the Initiative</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal Services */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Public Services</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/citizen/complaints/new" className="hover:text-white transition-colors">Lodge Grievance Online</Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-white transition-colors">Track Ticket Progress</Link>
              </li>
              <li>
                <Link to="/department/dashboard" className="hover:text-white transition-colors">Department Officer Login</Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="hover:text-white transition-colors">Administrative System Hub</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Important Disclaimers & Security */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Security & Privacy</h4>
            <div className="flex items-start gap-2 text-xs text-slate-400">
              <Lock className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span>Role-based access control with encrypted audit records and secure authentication.</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-slate-400">
              <HeartHandshake className="w-4 h-4 text-govblue-500 mt-0.5 flex-shrink-0" />
              <span>AI recommendations are strictly advisory and validated by human department officers.</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar & Disclaimer */}
        <div className="pt-8 border-t border-navy-800 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>
            © {new Date().getFullYear()} JanSahayak AI. All rights reserved. Open Civic Technology Platform.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
            <span className="text-slate-600">|</span>
            <span className="text-[11px] text-slate-400">Not an official government endorsement</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
