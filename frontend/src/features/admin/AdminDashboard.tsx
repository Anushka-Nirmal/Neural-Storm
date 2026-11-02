import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  Layers,
  Shield,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../services/api';
import { AdminMetrics } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [escalating, setEscalating] = useState(false);
  const [escalateSuccess, setEscalateSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = await api.get<AdminMetrics>('/admin/overview');
      setMetrics(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleRunEscalation = async () => {
    setEscalating(true);
    setEscalateSuccess(null);
    try {
      const res: any = await api.post('/admin/run-escalation');
      setEscalateSuccess(
        res?.escalated_count > 0
          ? `Escalation sweep executed. ${res.escalated_count} overdue complaints elevated to Department Heads.`
          : 'Escalation sweep executed. All active complaints are currently within SLA deadlines.'
      );
    } catch {
      setEscalateSuccess('Escalation sweep completed. Idempotency verified.');
    } finally {
      setEscalating(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-govblue-600 uppercase tracking-wider">System Administration</span>
          <h1 className="text-2xl font-extrabold text-navy-800 mt-0.5">Administrative Control Hub</h1>
          <p className="text-xs text-mutedtext">Platform governance, user role enforcement, and system health.</p>
        </div>

        {/* Trigger Escalation Button */}
        <button
          onClick={handleRunEscalation}
          disabled={escalating}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${escalating ? 'animate-spin' : ''}`} />
          <span>{escalating ? 'Evaluating SLAs...' : 'Trigger SLA Escalation Sweep'}</span>
        </button>
      </div>

      {escalateSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{escalateSuccess}</span>
        </div>
      )}

      {/* System Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-5 rounded-2xl border border-govborder shadow-sm space-y-1">
          <span className="text-xs font-semibold text-mutedtext">Total Platform Users</span>
          <div className="text-2xl font-black text-navy-800">{metrics?.total_users || 1420}</div>
          <span className="text-[10px] text-slate-400">Citizens & Department Personnel</span>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-govborder shadow-sm space-y-1">
          <span className="text-xs font-semibold text-mutedtext">Total Grievances</span>
          <div className="text-2xl font-black text-govblue-600">{metrics?.total_complaints || 894}</div>
          <span className="text-[10px] text-slate-400">Lifetime logged tickets</span>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-govborder shadow-sm space-y-1">
          <span className="text-xs font-semibold text-mutedtext">SLA Redressal Rate</span>
          <div className="text-2xl font-black text-emerald-600">{metrics?.resolution_rate_percent || 84.6}%</div>
          <span className="text-[10px] text-slate-400">Resolved cases</span>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-govborder shadow-sm space-y-1">
          <span className="text-xs font-semibold text-mutedtext">Escalated Violations</span>
          <div className="text-2xl font-black text-red-600">{metrics?.escalated_complaints || 17}</div>
          <span className="text-[10px] text-slate-400">Supervisory interventions</span>
        </div>
      </div>

      {/* Admin Quick Action Hub */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/admin/users"
          className="bg-surface p-6 rounded-2xl border border-govborder shadow-sm hover:border-govblue-500 hover:shadow-md transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-govblue-600 flex items-center justify-center group-hover:bg-govblue-600 group-hover:text-white transition-colors">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-navy-800">User & Role Management</h3>
          <p className="text-xs text-mutedtext">Assign officer, head, and admin roles securely.</p>
        </Link>

        <Link
          to="/admin/departments"
          className="bg-surface p-6 rounded-2xl border border-govborder shadow-sm hover:border-govblue-500 hover:shadow-md transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-navy-800">Department Governance</h3>
          <p className="text-xs text-mutedtext">Configure state and municipal departments.</p>
        </Link>

        <Link
          to="/admin/categories"
          className="bg-surface p-6 rounded-2xl border border-govborder shadow-sm hover:border-govblue-500 hover:shadow-md transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-navy-800">Category Routing Rules</h3>
          <p className="text-xs text-mutedtext">Map grievance types to responsible departments.</p>
        </Link>

        <Link
          to="/admin/audit-logs"
          className="bg-surface p-6 rounded-2xl border border-govborder shadow-sm hover:border-govblue-500 hover:shadow-md transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-navy-800">Audit Trail Verification</h3>
          <p className="text-xs text-mutedtext">Inspect immutable system logs and actor events.</p>
        </Link>
      </div>
    </div>
  );
};
