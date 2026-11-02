import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Search,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../services/api';
import { Complaint } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const data = await api.get<Complaint[]>('/complaints');
      setComplaints(data);
    } catch {
      // Handled by api fallback
    } finally {
      setLoading(false);
    }
  };

  const totalSubmitted = complaints.length;
  const openCount = complaints.filter((c) => ['submitted', 'acknowledged', 'under_review'].includes(c.status)).length;
  const inProgressCount = complaints.filter((c) => ['assigned', 'in_progress', 'awaiting_information'].includes(c.status)).length;
  const resolvedCount = complaints.filter((c) => ['resolved', 'closed'].includes(c.status)).length;

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
    };
    const current = map[status] || { bg: 'bg-slate-100', text: 'text-slate-700', label: status };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${current.bg} ${current.text}`}>
        {current.label}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-govborder shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-govblue-600 uppercase tracking-wider">Citizen Portal</span>
          <h1 className="text-2xl font-extrabold text-navy-800 mt-0.5">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Citizen'}
          </h1>
          <p className="text-xs sm:text-sm text-mutedtext mt-1">
            Track your registered public grievances or lodge a new issue in your preferred language.
          </p>
        </div>

        <Link
          to="/citizen/complaints/new"
          className="flex items-center gap-2 bg-saffron-500 hover:bg-saffron-600 text-navy-900 font-bold px-5 py-3 rounded-xl shadow transition-transform hover:-translate-y-0.5 text-xs sm:text-sm flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Lodge New Grievance</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-5 rounded-2xl border border-govborder shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-mutedtext">Total Lodged</span>
            <FileText className="w-4 h-4 text-govblue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-navy-800">{totalSubmitted}</div>
          <span className="text-[10px] text-slate-400">Lifetime submissions</span>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-govborder shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-mutedtext">Under Review</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600">{openCount}</div>
          <span className="text-[10px] text-slate-400">Awaiting department action</span>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-govborder shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-mutedtext">In Progress</span>
            <AlertCircle className="w-4 h-4 text-saffron-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-saffron-500">{inProgressCount}</div>
          <span className="text-[10px] text-slate-400">Field work / inspection underway</span>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-govborder shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-mutedtext">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{resolvedCount}</div>
          <span className="text-[10px] text-slate-400">Redressed successfully</span>
        </div>
      </div>

      {/* Recent Grievances List */}
      <div className="bg-surface rounded-2xl border border-govborder shadow-sm overflow-hidden">
        <div className="p-5 border-b border-govborder flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-navy-800">Your Recent Grievances</h2>
            <p className="text-xs text-mutedtext">Click on any grievance to view detailed status timeline</p>
          </div>
          <Link
            to="/citizen/complaints"
            className="text-xs font-semibold text-govblue-600 hover:text-govblue-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs text-mutedtext">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-16 text-mutedtext space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-medium">You haven't submitted any complaints yet.</p>
            <Link
              to="/citizen/complaints/new"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-govblue-600 hover:underline"
            >
              <span>Submit your first grievance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-govborder">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Date Lodged</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-govborder text-slate-700">
                {complaints.slice(0, 5).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-govblue-600">{c.ticket_id}</td>
                    <td className="py-3.5 px-4 font-semibold text-navy-800 max-w-xs truncate">{c.title}</td>
                    <td className="py-3.5 px-4 text-slate-600">{c.department_name || 'Assigned under routing'}</td>
                    <td className="py-3.5 px-4 text-mutedtext">{new Date(c.submitted_at).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4">{getStatusBadge(c.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/citizen/complaints/${c.id}`}
                        className="text-govblue-600 hover:text-govblue-800 font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
