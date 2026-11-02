import React from 'react';
import { Languages, Check, Mic, Globe, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const SupportedLanguagesPage: React.FC = () => {
  const { availableLanguages } = useLanguage();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="text-xs font-bold text-saffron-500 uppercase tracking-wider">
          Language Accessibility Matrix
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-800">
          Supported Indian Languages
        </h1>
        <p className="text-xs sm:text-sm text-mutedtext leading-relaxed">
          JanSahayak AI integrates high-performance Indic neural models to ensure every citizen can comfortably submit grievances in their native tongue without English language barriers.
        </p>
      </div>

      {/* Feature Capabilities Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface p-6 rounded-2xl border border-govborder shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-govblue-50 text-govblue-600 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-navy-800">UI Multilingual Navigation</h3>
          <p className="text-xs text-mutedtext leading-relaxed">
            Portal buttons, form headers, and navigation elements localized to regional languages.
          </p>
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-govborder shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-saffron-500 flex items-center justify-center">
            <Mic className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-navy-800">Indic Speech Recognition (ASR)</h3>
          <p className="text-xs text-mutedtext leading-relaxed">
            Record spoken audio directly through your mobile or desktop microphone for automated transcription.
          </p>
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-govborder shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-govteal-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-navy-800">Automated Translation</h3>
          <p className="text-xs text-mutedtext leading-relaxed">
            Transforms regional complaints into standardized English briefs for departmental processing while preserving the original transcript.
          </p>
        </div>
      </div>

      {/* Language Table */}
      <div className="bg-surface rounded-2xl border border-govborder shadow-sm overflow-hidden">
        <div className="p-4 border-b border-govborder bg-slate-50 font-bold text-xs text-navy-800">
          13 Supported Regional Languages & Capability Status
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/50 text-slate-500 font-semibold border-b border-govborder">
              <tr>
                <th className="py-3 px-4">Language</th>
                <th className="py-3 px-4">Native Script</th>
                <th className="py-3 px-4 text-center">UI Interface</th>
                <th className="py-3 px-4 text-center">Voice Input (ASR)</th>
                <th className="py-3 px-4 text-center">AI Translation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-govborder text-slate-700">
              {availableLanguages.map((l) => (
                <tr key={l.code} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-navy-800">{l.name}</td>
                  <td className="py-3.5 px-4 text-base font-medium">{l.native_name}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3" /> Ready
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3" /> Ready
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3" /> Ready
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
