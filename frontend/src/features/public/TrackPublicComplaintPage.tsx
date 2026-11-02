import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Clock, CheckCircle2, AlertCircle, Building2, Layers, ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';

interface TimelineStep {
  status: string;
  comment?: string | null;
  timestamp: string;
}

interface TrackData {
  ticket_id: string;
  title: string;
  category_name: string;
  department_name: string;
  status: string;
  priority: string;
  submitted_at: string;
  updated_at: string;
  resolution_summary?: string | null;
  timeline: TimelineStep[];
}

export const TrackPublicComplaintPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTicket = searchParams.get('ticket') || '';
  const [ticketInput, setTicketInput] = useState(initialTicket);
  const [trackData, setTrackData] = useState<TrackData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialTicket) {
      performTrack(initialTicket);
    }
  }, [initialTicket]);

  const performTrack = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError(null);
    setTrackData(null);
    try {
      const data = await api.get<TrackData>(`/complaints/track/${id.trim()}`);
      setTrackData(data);
    } catch (err: any) {
      setError(err.message || 'Grievance ticket not found. Please verify your reference ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performTrack(ticketInput);
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      submitted: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Submitted' },
      acknowledged: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Acknowledged' },
      under_review: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Under Review' },
      assigned: { bg: 'bg-sky-100', text: 'text-sky-800', label: 'Assigned to Officer' },
      in_progress: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'In Progress' },
      escalated: { bg: 'bg-red-100', text: 'text-red-800', label: 'Escalated to Head' },
      resolved: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Resolved' },
      closed: { bg: 'bg-slate-100', text: 'text-slate-800', label: 'Closed' },
    };
    const current = map[status] || { bg: 'bg-slate-100', text: 'text-slate-700', label: status };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${current.bg} ${current.text}`}>
        {current.label}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-mutedtext hover:text-govblue-600 mb-4 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-800">Track Public Grievance</h1>
        <p className="text-xs sm:text-sm text-mutedtext mt-1">
          Enter your unique reference ticket ID to inspect real-time redressal progress.
        </p>
      </div>

      {/* Tracker Form */}
      <form onSubmit={handleSubmit} className="bg-surface p-4 rounded-2xl border border-govborder shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            required
            placeholder="e.g. JSA-2026-W8491A"
            value={ticketInput}
            onChange={(e) => setTicketInput(e.target.value.toUpperCase())}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-govborder focus:outline-none focus:ring-2 focus:ring-govblue-500 font-mono tracking-wider font-semibold"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-govblue-600 hover:bg-govblue-500 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
        >
          {loading ? 'Searching...' : 'Track Ticket'}
        </button>
      </form>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Result Card */}
      {trackData && (
        <div className="bg-surface rounded-2xl border border-govborder shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-govborder gap-4">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ticket Identifier</span>
              <h2 className="text-xl font-extrabold text-navy-800 font-mono mt-0.5">{trackData.ticket_id}</h2>
              <p className="text-sm font-semibold text-slate-700 mt-2">{trackData.title}</p>
            </div>
            <div>{getStatusBadge(trackData.status)}</div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Building2 className="w-4 h-4 text-govblue-600" />
              <span>Department: <strong className="text-navy-800">{trackData.department_name}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Layers className="w-4 h-4 text-saffron-500" />
              <span>Category: <strong className="text-navy-800">{trackData.category_name}</strong></span>
            </div>
          </div>

          {/* Resolution summary if resolved */}
          {trackData.resolution_summary && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Department Resolution Summary</span>
              </span>
              <p className="text-xs text-emerald-900 leading-relaxed">{trackData.resolution_summary}</p>
            </div>
          )}

          {/* Status Stepper Timeline */}
          <div className="space-y-4 pt-4 border-t border-govborder">
            <h3 className="text-sm font-bold text-navy-800">Status History Timeline</h3>
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {trackData.timeline.map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-govblue-600 border-2 border-white shadow"></div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-navy-800 capitalize">{step.status.replace('_', ' ')}</span>
                      <span className="text-[10px] text-mutedtext">
                        {new Date(step.timestamp).toLocaleDateString()} {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {step.comment && <p className="text-xs text-slate-600">{step.comment}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
