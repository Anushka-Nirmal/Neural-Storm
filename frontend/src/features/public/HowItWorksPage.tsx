import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mic, Cpu, Building2, BellRing, CheckCircle, ShieldAlert } from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      num: 'Step 1',
      icon: Mic,
      title: 'Citizen Voice or Text Input',
      desc: 'A citizen chooses their preferred Indian language and describes their civic grievance. They can record spoken audio or type in their regional script or Hinglish.',
    },
    {
      num: 'Step 2',
      icon: Cpu,
      title: 'Neural Speech-to-Text & Translation',
      desc: 'The platform identifies the script and speech, transcribes the grievance, and creates an accurate English translation while strictly preserving the original raw citizen statement.',
    },
    {
      num: 'Step 3',
      icon: Building2,
      title: 'AI Classification & Intelligent Department Routing',
      desc: 'Semantic analysis categorizes the complaint (e.g., Water Supply, Electricity, PWD Roads) and calculates urgency based on safety keywords and disruption extent.',
    },
    {
      num: 'Step 4',
      icon: BellRing,
      title: 'Human Review & Ticket Creation',
      desc: 'The citizen reviews AI suggestions, makes any corrections if needed, and receives an immutable nonsequential reference ticket (e.g., JSA-2026-W8491A).',
    },
    {
      num: 'Step 5',
      icon: ShieldAlert,
      title: 'Officer Redressal & Automated Escalation Engine',
      desc: 'Assigned department staff inspect the site, provide public updates, or requisition repairs. If unresolved within SLA limits (e.g. 48h for high priority), it auto-escalates to Department Heads.',
    },
    {
      num: 'Step 6',
      icon: CheckCircle,
      title: 'Resolution Summary & Citizen Verification',
      desc: 'Once the issue is rectified, the officer logs a mandatory resolution summary. The citizen receives an instant alert and submits 1–5 star rating feedback.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-govblue-600 uppercase tracking-wider">
          Architecture & Process
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-800">
          How JanSahayak AI Works
        </h1>
        <p className="text-xs sm:text-sm text-mutedtext leading-relaxed">
          From the moment a citizen speaks their concern to final field resolution and feedback, every step is transparent and trackable.
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="bg-surface p-6 rounded-2xl border border-govborder shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-govblue-50 text-govblue-600 flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-saffron-500 uppercase">{s.num}</span>
                  <span className="text-slate-300">•</span>
                  <h3 className="font-bold text-sm text-navy-800">{s.title}</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center pt-4">
        <Link
          to="/citizen/complaints/new"
          className="inline-flex items-center gap-2 bg-govblue-600 hover:bg-govblue-500 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm transition-colors shadow-md"
        >
          <span>Submit a Complaint Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
