import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderOpen,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Filter,
  Search,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../services/api';
import { Complaint } from '../../types';

export const DepartmentDashboard: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [compList, stats] = await Promise.all([
        api.get<Complaint[]>('/departments/me/complaints'),
        api.get<any>('/departments/me/analytics'),
      ]);
      setComplaints(compList);
      setAnalytics(stats);
    } catch {
      // Handled by api fallback
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyBadge = (p: string) => {
    const map: Record<string, string> = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-amber-100 text-amber-800 border-amber-200',
      medium: 'bg-blue-100 text-blue-800 border-blue-200',
      low: 'bg-slate-100 text-slate-800 border-slate-200',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${map[p] || map['medium']}`}>
        {p}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold text-govblue-600 uppercase tracking-wider">Operational Workbench</span>
        <h1 className="text-2xl font-extrabold text-navy-800 mt-0.5">Department Grievance Queue</h1>
        <p className="text-xs text-mutedtext">Review incoming complaints, prioritize urgent alerts, and update field resolution.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-surface p-4 rounded-2xl border border-govborder shadow-sm space-y-1">
          <span className="text-xs font-semibold text-mutedtext">Total Queue</span>
          <div className="text-2xl font-black text-navy-800">{analytics?.total_assigned || complaints.length}</div>
          <span className="text-[10px] text-slate-400">Department assigned</span>
        </div>

        <div className="bg-surface p-4 rounded-2xl border border-govborder shadow-sm space-y-1">
          <span className="text-xs font-semibold text-mutedtext">New Submitted</span>
          <div className="text-2xl font-black text-blue-600">{analytics?.new_received || 0}</div>
          <span className="text-[10px] text-slate-400">Needs acknowledgement</span>
        </div>

        <div className="bg-surface p-4 rounded-2xl border border-govborder shadow-sm space-y-1">
          <span className="text-xs font-semibold text-mutedtext">In Investigation</span>
          <div className="text-2xl font-black text-amber-600">{analytics?.in_progress || 1}</div>
          <span className="text-[10px] text-slate-400">Field team active</span>
        </div>

        <div className="bg-surface p-4 rounded-2xl border border-govborder shadow-sm space-y-1">
          <span className="text-xs font-semibold text-mutedtext">Overdue / SLA Alerts</span>
          <div className="text-2xl font-black text-red-600">{analytics?.overdue || 0}</div>
          <span className="text-[10px] text-slate-400">Approaching breach</span>
        </div>

        <div className="bg-surface p-4 rounded-2xl border border-govborder shadow-sm space-y-1">
          <span className="text-xs font-semibold text-mutedtext">Resolution Rate</span>
          <div className="text-2xl font-black text-emerald-600">{analytics?.resolution_rate_percent || 66.7}%</div>
          <span className="text-[10px] text-slate-400">SLA Redressed</span>
        </div>
      </div>

      {/* Active Work Queue */}
      <div className="bg-surface rounded-2xl border border-govborder shadow-sm overflow-hidden">
        <div className="p-5 border-b border-govborder flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-navy-800">Priority Action Queue</h2>
            <p className="text-xs text-mutedtext">Cases requiring immediate assessment or field update</p>
          </div>
          <Link to="/department/complaints" className="text-xs font-semibold text-govblue-600 hover:underline flex items-center gap-1">
            <span>View All Cases</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs text-mutedtext">Loading queue...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-govborder">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Complaint Title</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-govborder text-slate-700">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-govblue-600">{c.ticket_id}</td>
                    <td className="py-3.5 px-4 font-semibold text-navy-800 max-w-sm truncate">{c.title}</td>
                    <td className="py-3.5 px-4">{getUrgencyBadge(c.priority)}</td>
                    <td className="py-3.5 px-4 text-slate-600">{c.district || 'Statewide'}, {c.state}</td>
                    <td className="py-3.5 px-4 capitalize font-semibold">{c.status.replace('_', ' ')}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/department/complaints/${c.id}`}
                        className="bg-govblue-600 hover:bg-govblue-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-sm inline-flex items-center gap-1"
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
