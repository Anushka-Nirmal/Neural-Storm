import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Layers,
  MapPin,
  Clock,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Send,
  Lock,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../../services/api';
import { Complaint } from '../../types';

export const DepartmentComplaintWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);

  // Status Action Form
  const [targetStatus, setTargetStatus] = useState<string>('in_progress');
  const [statusComment, setStatusComment] = useState('');
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  // Resolution Form
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [resolveSubmitting, setResolveSubmitting] = useState(false);

  // Internal vs Public Note Form
  const [noteBody, setNoteBody] = useState('');
  const [noteVisibility, setNoteVisibility] = useState<'public' | 'internal'>('public');
  const [noteSubmitting, setNoteSubmitting] = useState(false);

  // Escalation Form
  const [escalateReason, setEscalateReason] = useState('');
  const [escalateSubmitting, setEscalateSubmitting] = useState(false);

  useEffect(() => {
    if (id) loadComplaint(id);
  }, [id]);

  const loadComplaint = async (cid: string) => {
    setLoading(true);
    try {
      const data = await api.get<Complaint>(`/complaints/${cid}`);
      setComplaint(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setStatusSubmitting(true);
    try {
      await api.post(`/complaints/${id}/status`, {
        new_status: targetStatus,
        public_comment: statusComment || `Status set to ${targetStatus.replace('_', ' ')} by department officer.`,
      });
      setStatusComment('');
      loadComplaint(id);
    } catch (e) {
      alert('Failed to update status.');
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !resolutionSummary.trim()) return;
    setResolveSubmitting(true);
    try {
      await api.post(`/complaints/${id}/resolve`, {
        resolution_summary: resolutionSummary.trim(),
        public_comment: `Grievance resolved: ${resolutionSummary.trim()}`,
      });
      setResolutionSummary('');
      loadComplaint(id);
    } catch (e) {
      alert('Could not resolve case.');
    } finally {
      setResolveSubmitting(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !noteBody.trim()) return;
    setNoteSubmitting(true);
    try {
      await api.post(`/complaints/${id}/comments`, {
        body: noteBody.trim(),
        visibility: noteVisibility,
      });
      setNoteBody('');
      loadComplaint(id);
    } catch (e) {
      alert('Failed to save note.');
    } finally {
      setNoteSubmitting(false);
    }
  };

  const handleEscalate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !escalateReason.trim()) return;
    setEscalateSubmitting(true);
    try {
      await api.post(`/complaints/${id}/escalate`, {
        reason: escalateReason.trim(),
      });
      setEscalateReason('');
      loadComplaint(id);
    } catch (e) {
      alert('Failed to escalate case.');
    } finally {
      setEscalateSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-xs text-mutedtext">Loading case workspace...</div>;
  }

  if (!complaint) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-sm font-bold text-navy-800">Case not found.</p>
        <Link to="/department/dashboard" className="text-xs text-govblue-600 font-semibold hover:underline">
          Return to Queue
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div>
        <Link
          to="/department/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-mutedtext hover:text-navy-800 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Department Queue</span>
        </Link>

        <div className="bg-surface rounded-2xl p-6 border border-govborder shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-govblue-600">{complaint.ticket_id}</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-bold uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                Priority: {complaint.priority}
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-navy-800 mt-1">{complaint.title}</h1>
          </div>
          <div className="capitalize font-bold text-xs bg-slate-100 text-slate-800 px-3 py-1 rounded-full border border-slate-200">
            Status: {complaint.status.replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Split Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Citizen Raw Submission & AI Translation (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Citizen Original Submission */}
          <div className="bg-surface rounded-2xl p-6 border border-govborder shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-navy-800">Citizen Original Statement</h2>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Language: {complaint.original_language.toUpperCase()}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed">
              {complaint.original_description}
            </div>

            {/* AI English Translation */}
            {complaint.translated_description && (
              <div className="space-y-1.5 pt-2">
                <span className="text-xs font-bold text-navy-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-govblue-600" />
                  <span>AI Translation (English)</span>
                </span>
                <p className="text-xs text-slate-700 italic bg-govblue-50/40 p-3.5 rounded-xl border border-govblue-100 leading-relaxed">
                  {complaint.translated_description}
                </p>
              </div>
            )}

            {/* AI Executive Summary & Confidence */}
            <div className="p-4 rounded-xl bg-slate-50 border border-govborder space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-navy-800">AI Classification Metadata</span>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {Math.round((complaint.ai_confidence || 0.94) * 100)}% Confidence
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">{complaint.ai_summary}</p>
            </div>
          </div>

          {/* Timeline and History */}
          <div className="bg-surface rounded-2xl p-6 border border-govborder shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-navy-800">Audit Status History</h3>
            <div className="relative pl-5 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {(complaint.status_history || []).map((h, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-govblue-600 border-2 border-white shadow"></div>
                  <div className="space-y-0.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy-800 capitalize">{h.new_status.replace('_', ' ')}</span>
                      <span className="text-[10px] text-mutedtext">by {h.changed_by_name || 'System'}</span>
                    </div>
                    {h.public_comment && <p className="text-slate-600">{h.public_comment}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Action Drawer & Case Operations (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Action 1: Update Status Form */}
          <div className="bg-surface rounded-2xl p-6 border border-govborder shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-navy-800">Update Case Status</h3>
            <form onSubmit={handleStatusUpdate} className="space-y-3">
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-govborder font-semibold text-navy-800 bg-white focus:ring-2 focus:ring-govblue-500"
              >
                <option value="under_review">Mark Under Review</option>
                <option value="assigned">Assign Field Officer</option>
                <option value="in_progress">Mark In Progress (Work Order Dispatched)</option>
                <option value="awaiting_information">Awaiting Citizen Info</option>
              </select>

              <textarea
                rows={2}
                placeholder="Citizen-visible status comment..."
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-govborder focus:ring-2 focus:ring-govblue-500"
              />

              <button
                type="submit"
                disabled={statusSubmitting}
                className="w-full bg-govblue-600 hover:bg-govblue-500 disabled:opacity-50 text-white font-bold py-2 rounded-xl text-xs transition-colors shadow-sm"
              >
                {statusSubmitting ? 'Updating...' : 'Update Status'}
              </button>
            </form>
          </div>

          {/* Action 2: Add Communications or Internal Notes */}
          <div className="bg-surface rounded-2xl p-6 border border-govborder shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-navy-800">Add Notes & Responses</h3>
            <form onSubmit={handleAddNote} className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNoteVisibility('public')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                    noteVisibility === 'public'
                      ? 'bg-govblue-50 text-govblue-600 border-govblue-300'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  Citizen-Visible
                </button>
                <button
                  type="button"
                  onClick={() => setNoteVisibility('internal')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1 ${
                    noteVisibility === 'internal'
                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  <Lock className="w-3 h-3" />
                  <span>Internal Only</span>
                </button>
              </div>

              <textarea
                rows={3}
                required
                placeholder={
                  noteVisibility === 'internal'
                    ? 'Internal note (field notes, contractor details - hidden from citizen)...'
                    : 'Public response visible to the citizen on their tracking portal...'
                }
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-govborder focus:ring-2 focus:ring-govblue-500"
              />

              <button
                type="submit"
                disabled={noteSubmitting || !noteBody.trim()}
                className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold py-2 rounded-xl text-xs transition-colors"
              >
                {noteSubmitting ? 'Saving Note...' : 'Save Note'}
              </button>
            </form>
          </div>

          {/* Action 3: Resolve Grievance Form */}
          <div className="bg-surface rounded-2xl p-6 border border-emerald-200 bg-emerald-50/30 shadow-sm space-y-3">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Mark Grievance Resolved</span>
            </div>
            <p className="text-xs text-slate-600">
              Provide a clear summary of work completed for the citizen before closing.
            </p>
            <form onSubmit={handleResolve} className="space-y-3">
              <textarea
                rows={3}
                required
                placeholder="e.g. Field inspection completed. Ruptured 8-inch valve was replaced on 2nd Nov and water supply pressure restored to normal."
                value={resolutionSummary}
                onChange={(e) => setResolutionSummary(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 bg-white"
              />
              <button
                type="submit"
                disabled={resolveSubmitting || !resolutionSummary.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm"
              >
                {resolveSubmitting ? 'Submitting Resolution...' : 'Complete & Resolve Grievance'}
              </button>
            </form>
          </div>

          {/* Action 4: Escalate to Head */}
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-red-800">
              <ShieldAlert className="w-4 h-4" />
              <span>Escalate to Department Head</span>
            </div>
            <form onSubmit={handleEscalate} className="space-y-2">
              <input
                type="text"
                required
                placeholder="Reason for immediate supervisory escalation..."
                value={escalateReason}
                onChange={(e) => setEscalateReason(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-red-200 bg-white focus:ring-2 focus:ring-red-500"
              />
              <button
                type="submit"
                disabled={escalateSubmitting || !escalateReason.trim()}
                className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-2 rounded-xl text-xs"
              >
                {escalateSubmitting ? 'Escalating...' : 'Escalate Case'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
