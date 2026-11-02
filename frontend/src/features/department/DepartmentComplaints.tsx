import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ChevronRight, FileText, Download } from 'lucide-react';
import { api } from '../../services/api';
import { Complaint } from '../../types';

export const DepartmentComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const data = await api.get<Complaint[]>('/departments/me/complaints');
      setComplaints(data);
    } catch {
      // Handled by api fallback
    } finally {
      setLoading(false);
    }
  };

  const filtered = complaints.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.ticket_id.toLowerCase().includes(search.toLowerCase());
    const matchPriority = priorityFilter === 'all' || c.priority === priorityFilter;
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchPriority && matchStatus;
  });

  const exportCSV = () => {
    const headers = ['Ticket ID', 'Title', 'Priority', 'Status', 'Submitted At'];
    const rows = filtered.map((c) => [c.ticket_id, `"${c.title}"`, c.priority, c.status, c.submitted_at]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `complaints_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-800">All Department Cases</h1>
          <p className="text-xs text-mutedtext">Search, filter, export, and assign complaints in your department jurisdiction.</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 bg-white border border-govborder hover:bg-slate-50 text-navy-800 font-semibold px-3.5 py-2 rounded-xl text-xs transition-colors shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-surface p-4 rounded-2xl border border-govborder shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ticket ID or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-govborder focus:ring-2 focus:ring-govblue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="py-1.5 px-3 text-xs rounded-xl border border-govborder bg-white text-navy-800 font-semibold focus:ring-2 focus:ring-govblue-500"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 text-xs rounded-xl border border-govborder bg-white text-navy-800 font-semibold focus:ring-2 focus:ring-govblue-500"
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

      {/* Table */}
      <div className="bg-surface rounded-2xl border border-govborder shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-xs text-mutedtext">Loading complaints...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-mutedtext space-y-2">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-navy-800">No cases matched filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-govborder">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date Lodged</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-govborder text-slate-700">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-govblue-600">{c.ticket_id}</td>
                    <td className="py-3.5 px-4 font-semibold text-navy-800 max-w-sm truncate">{c.title}</td>
                    <td className="py-3.5 px-4 uppercase font-bold text-[10px]">{c.priority}</td>
                    <td className="py-3.5 px-4 capitalize font-semibold">{c.status.replace('_', ' ')}</td>
                    <td className="py-3.5 px-4 text-mutedtext">{new Date(c.submitted_at).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/department/complaints/${c.id}`}
                        className="bg-govblue-600 hover:bg-govblue-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs shadow-sm inline-flex items-center gap-1"
                      >
                        <span>Workspace</span>
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
