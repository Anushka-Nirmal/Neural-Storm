import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export const HelpFaqPage: React.FC = () => {
  const faqs = [
    {
      q: 'Do I have to write my grievance in English?',
      a: 'No! You can write or speak in any of 13 Indian languages including Hindi, Marathi, Bengali, Tamil, Telugu, Kannada, Gujarati, Punjabi, Odia, Assamese, Malayalam, Urdu, or English. Our AI pipeline handles language detection and translation.',
    },
    {
      q: 'How do I use voice input?',
      a: 'In the grievance submission wizard (Step 3), simply tap the "Start Recording" microphone button, speak naturally, and tap Stop. The system will transcribe your audio and allow you to edit or retry.',
    },
    {
      q: 'What is a Ticket ID and how do I track my complaint?',
      a: 'Upon submission, a unique code like JSA-2026-W8491A is generated. You can enter this code in the Track Ticket bar on the homepage at any time to see the live status without logging in.',
    },
    {
      q: 'What happens if a department does not resolve my issue on time?',
      a: 'JanSahayak AI includes an automated Escalation Engine. If a complaint approaches or breaches its SLA deadline (e.g. 24 hours for critical, 48 hours for high urgency), it is automatically escalated to the Department Head.',
    },
    {
      q: 'Can other citizens see my private details?',
      a: 'No. The public tracking tool only displays the complaint title, current department, and status history. Your name, phone number, and internal department officer notes are completely hidden and protected.',
    },
    {
      q: 'Can I reopen a complaint if I am not satisfied with the resolution?',
      a: 'Yes! Once a grievance is marked Resolved, the citizen has the option to submit feedback rating (1–5 stars) or request Reopening with a stated reason.',
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-govblue-600 uppercase tracking-wider">Citizen Assistance</span>
        <h1 className="text-3xl font-extrabold text-navy-800">Frequently Asked Questions</h1>
        <p className="text-xs sm:text-sm text-mutedtext">
          Everything you need to know about registering, tracking, and escalating grievances.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((f, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className="bg-surface rounded-2xl border border-govborder shadow-sm overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm text-navy-800 hover:bg-slate-50 transition-colors"
              >
                <span>{f.q}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {isOpen && (
                <div className="p-5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                  {f.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
