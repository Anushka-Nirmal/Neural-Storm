import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Layers,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  Star,
  Send,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { api } from '../../services/api';
import { Complaint } from '../../types';

export const ComplaintDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);

  // Comment input
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Feedback input
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Reopen input
  const [reopenReason, setReopenReason] = useState('');
  const [showReopenModal, setShowReopenModal] = useState(false);

  useEffect(() => {
    if (id) loadDetail(id);
  }, [id]);

  const loadDetail = async (complaintId: string) => {
    setLoading(true);
    try {
      const data = await api.get<Complaint>(`/complaints/${complaintId}`);
      setComplaint(data);
      if (data.feedback) setFeedbackSubmitted(true);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !id) return;
    setCommentSubmitting(true);
    try {
      await api.post(`/complaints/${id}/comments`, {
        body: commentText.trim(),
        visibility: 'public',
      });
      setCommentText('');
      loadDetail(id);
    } catch (e) {
      alert('Failed to post comment.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await api.post(`/complaints/${id}/feedback`, {
        rating: feedbackRating,
        feedback_text: feedbackComment,
      });
      setFeedbackSubmitted(true);
      loadDetail(id);
    } catch (e) {
      alert('Feedback submission error.');
    }
  };

  const handleReopenSubmit = async () => {
    if (!id || !reopenReason.trim()) return;
    try {
      await api.post(`/complaints/${id}/reopen`, { reason: reopenReason.trim() });
      setShowReopenModal(false);
      loadDetail(id);
    } catch (e) {
      alert('Could not reopen complaint.');
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      submitted: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Submitted' },
      acknowledged: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Acknowledged' },
      under_review: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Under Review' },
      assigned: { bg: 'bg-sky-100', text: 'text-sky-800', label: 'Assigned' },
      in_progress: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'In Progress' },
      escalated: { bg: 'bg-red-100', text: 'text-red-800', label: 'Escalated' },
      resolved: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Resolved' },
      closed: { bg: 'bg-slate-100', text: 'text-slate-800', label: 'Closed' },
      reopened: { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Reopened' },
    };
    const current = map[status] || { bg: 'bg-slate-100', text: 'text-slate-700', label: status };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${current.bg} ${current.text}`}>
        {current.label}
      </span>
    );
  };

  if (loading) {
    return <div className="text-center py-20 text-xs text-mutedtext">Loading grievance details...</div>;
  }

  if (!complaint) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-sm font-bold text-navy-800">Complaint not found.</p>
        <Link to="/citizen/complaints" className="text-xs text-govblue-600 font-semibold hover:underline">
          Return to My Complaints
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Back button and Header */}
      <div>
        <Link
          to="/citizen/complaints"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-mutedtext hover:text-navy-800 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Grievances</span>
        </Link>

        <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-govborder shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-govblue-600">{complaint.ticket_id}</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-mutedtext">
                Lodged on {new Date(complaint.submitted_at).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-800 mt-1">{complaint.title}</h1>
          </div>
          <div>{getStatusBadge(complaint.status)}</div>
        </div>
      </div>

      {/* Grid: Details & Status Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Complaint Data & AI Brief */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Description */}
          <div className="bg-surface rounded-2xl p-6 border border-govborder shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-navy-800">Original Citizen Statement</h2>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-normal">
              {complaint.original_description}
            </div>

            {complaint.translated_description && (
              <div className="space-y-1">
                <span className="text-xs font-bold text-navy-800">English Translation for Officers:</span>
                <p className="text-xs text-slate-600 italic bg-govblue-50/50 p-3 rounded-xl border border-govblue-100">
                  {complaint.translated_description}
                </p>
              </div>
            )}

            {complaint.ai_summary && (
              <div className="space-y-1 pt-2 border-t border-govborder">
                <span className="text-xs font-bold text-navy-800">AI Executive Brief:</span>
                <p className="text-xs text-slate-600 leading-relaxed">{complaint.ai_summary}</p>
              </div>
            )}
          </div>

          {/* Department Resolution Box (if resolved) */}
          {complaint.resolution_summary && (
            <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Department Resolution Summary</span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">{complaint.resolution_summary}</p>
            </div>
          )}

          {/* Post-Resolution Feedback Rating Form */}
          {['resolved', 'closed'].includes(complaint.status) && (
            <div className="bg-surface rounded-2xl p-6 border border-govborder shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-navy-800">Rate the Redressal Experience</h3>
              {feedbackSubmitted ? (
                <div className="p-4 rounded-xl bg-slate-50 text-xs text-slate-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Thank you! Your feedback has been recorded.</span>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          feedbackRating >= star ? 'text-amber-500' : 'text-slate-300'
                        }`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                    <span className="text-xs font-semibold text-slate-600 ml-2">
                      {feedbackRating} of 5 Stars
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Optional feedback comments..."
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-govborder focus:ring-2 focus:ring-govblue-500"
                  />
                  <div className="flex items-center justify-between">
                    <button
                      type="submit"
                      className="bg-govblue-600 hover:bg-govblue-500 text-white font-bold px-4 py-2 rounded-xl text-xs"
                    >
                      Submit Feedback
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReopenModal(true)}
                      className="text-xs text-rose-600 hover:underline font-semibold flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Not Satisfied? Reopen Case</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Citizen & Public Responses / Comments */}
          <div className="bg-surface rounded-2xl p-6 border border-govborder shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-navy-800">Department Communication Updates</h3>
            <div className="space-y-3">
              {(complaint.comments || []).length === 0 ? (
                <p className="text-xs text-mutedtext italic">No updates posted yet.</p>
              ) : (
                complaint.comments?.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-xl bg-slate-50 border border-govborder space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-navy-800">{c.author_name || 'Department Officer'}</span>
                      <span className="text-slate-400">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{c.body}</p>
                  </div>
                ))
              )}
            </div>

            {/* Post Citizen Comment Form */}
            <form onSubmit={handlePostComment} className="pt-3 border-t border-govborder flex gap-2">
              <input
                type="text"
                placeholder="Ask a question or add details for the officer..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-govborder focus:ring-2 focus:ring-govblue-500"
              />
              <button
                type="submit"
                disabled={commentSubmitting || !commentText.trim()}
                className="bg-govblue-600 hover:bg-govblue-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Routing Metadata & Timeline */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-surface rounded-2xl p-5 border border-govborder shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-navy-800">Case Metadata</h3>
            <div className="space-y-3 text-slate-600">
              <div className="flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-govblue-600 mt-0.5" />
                <div>
                  <span className="text-slate-400">Department:</span>
                  <p className="font-bold text-navy-800">{complaint.department_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Layers className="w-4 h-4 text-saffron-500 mt-0.5" />
                <div>
                  <span className="text-slate-400">Category:</span>
                  <p className="font-bold text-navy-800">{complaint.category_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose-500 mt-0.5" />
                <div>
                  <span className="text-slate-400">Location:</span>
                  <p className="font-bold text-navy-800">
                    {complaint.locality ? `${complaint.locality}, ` : ''}
                    {complaint.district}, {complaint.state}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-indigo-500 mt-0.5" />
                <div>
                  <span className="text-slate-400">Urgency Priority:</span>
                  <p className="font-bold text-navy-800 capitalize">{complaint.priority}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Stepper Timeline */}
          <div className="bg-surface rounded-2xl p-5 border border-govborder shadow-sm space-y-4">
            <h3 className="font-bold text-navy-800 text-xs">Status Stepper Timeline</h3>
            <div className="relative pl-5 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {(complaint.status_history || []).map((h, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-govblue-600 border-2 border-white shadow"></div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-navy-800 capitalize">{h.new_status.replace('_', ' ')}</span>
                    <p className="text-[10px] text-mutedtext">{new Date(h.created_at).toLocaleDateString()} {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    {h.public_comment && <p className="text-[11px] text-slate-600">{h.public_comment}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reopen Modal */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl p-6 max-w-md w-full space-y-4 border border-govborder shadow-xl">
            <h3 className="font-bold text-base text-navy-800">Reopen Grievance</h3>
            <p className="text-xs text-mutedtext">
              Please state why the grievance remains unresolved or requires further departmental action.
            </p>
            <textarea
              rows={4}
              required
              placeholder="State the reason..."
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-govborder focus:ring-2 focus:ring-govblue-500"
            ></textarea>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowReopenModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleReopenSubmit}
                disabled={!reopenReason.trim()}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl"
              >
                Confirm Reopen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
