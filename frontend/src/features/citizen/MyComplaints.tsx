import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, PlusCircle, FileText, ChevronRight, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Complaint } from '../../types';

export const MyComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.ticket_id.toLowerCase().includes(search.toLowerCase()) ||
      (c.department_name || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-800">My Grievances</h1>
          <p className="text-xs text-mutedtext">Search and monitor all complaints lodged from your account.</p>
        </div>
        <Link
          to="/citizen/complaints/new"
          className="flex items-center gap-2 bg-govblue-600 hover:bg-govblue-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Grievance</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface p-4 rounded-2xl border border-govborder shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ticket ID, title, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-govborder focus:outline-none focus:ring-2 focus:ring-govblue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 text-xs rounded-xl border border-govborder bg-white text-navy-800 font-semibold focus:outline-none focus:ring-2 focus:ring-govblue-500"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="escalated">Escalated</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-surface rounded-2xl border border-govborder shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-xs text-mutedtext">Loading complaints...</div>
        ) : filteredComplaints.length === 0 ? (
          <div className="text-center py-16 text-mutedtext space-y-2">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-navy-800">No matching grievances found</p>
            <p className="text-[11px] text-mutedtext">Try adjusting your search query or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-govborder">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-govborder text-slate-700">
                {filteredComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-govblue-600">{c.ticket_id}</td>
                    <td className="py-3.5 px-4 font-semibold text-navy-800 max-w-xs truncate">{c.title}</td>
                    <td className="py-3.5 px-4 text-slate-600">{c.department_name || 'Routing...'}</td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize font-semibold text-[11px]">{c.priority}</span>
                    </td>
                    <td className="py-3.5 px-4 text-mutedtext">{new Date(c.submitted_at).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4">{getStatusBadge(c.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/citizen/complaints/${c.id}`}
                        className="text-govblue-600 hover:text-govblue-800 font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <span>View</span>
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
