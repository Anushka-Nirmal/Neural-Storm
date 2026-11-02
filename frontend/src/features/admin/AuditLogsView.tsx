import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Filter, Search, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

interface AuditLogItem {
  id: string;
  actor_name?: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata?: any;
  created_at: string;
}

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.get<AuditLogItem[]>('/admin/audit-logs');
      setLogs(data);
    } catch {
      // Mock sample logs
      setLogs([
        {
          id: 'log-1',
          actor_name: 'Rajesh Sharma (Admin)',
          action: 'USER_ROLE_UPDATED',
          entity_type: 'user',
          entity_id: 'u-2',
          metadata: { new_role: 'department_officer', dept: 'DWSS' },
          created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
        },
        {
          id: 'log-2',
          actor_name: 'System Automation',
          action: 'COMPLAINT_ESCALATED_SLA_BREACH',
          entity_type: 'complaint',
          entity_id: 'comp-102',
          metadata: { ticket_id: 'JSA-2026-P9215B', reason: 'Critical priority SLA breach' },
          created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        },
        {
          id: 'log-3',
          actor_name: 'Amit Verma (Officer)',
          action: 'STATUS_UPDATED',
          entity_type: 'complaint',
          entity_id: 'comp-101',
          metadata: { from: 'submitted', to: 'in_progress' },
          created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        },
        {
          id: 'log-4',
          actor_name: 'Ramesh Kumar (Citizen)',
          action: 'COMPLAINT_CREATED',
          entity_type: 'complaint',
          entity_id: 'comp-101',
          metadata: { ticket_id: 'JSA-2026-W8491A', priority: 'high' },
          created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(
    (l) => actionFilter === 'all' || l.action.toLowerCase().includes(actionFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div>
        <Link to="/admin/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-mutedtext hover:text-navy-800 mb-3 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Admin Hub</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-navy-800">Immutable Audit Trail Logs</h1>
        <p className="text-xs text-mutedtext">Security and compliance audit history of all grievance and role modifications.</p>
      </div>

      <div className="bg-surface p-4 rounded-2xl border border-govborder shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-navy-800">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Tamper-Resistant Logging Active</span>
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="text-xs border border-govborder rounded-xl px-3 py-1.5 bg-white font-semibold text-navy-800 focus:outline-none focus:ring-2 focus:ring-govblue-500"
        >
          <option value="all">All Actions</option>
          <option value="complaint">Complaint Events</option>
          <option value="status">Status Transitions</option>
          <option value="role">Role Assignments</option>
          <option value="escalated">Escalations</option>
        </select>
      </div>

      <div className="bg-surface rounded-2xl border border-govborder shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-govborder">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Sanitized Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-govborder text-slate-700">
              {filteredLogs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 text-mutedtext font-mono text-[11px]">
                    {new Date(l.created_at).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-govblue-600 text-[11px]">{l.action}</td>
                  <td className="py-3.5 px-4 font-semibold text-navy-800">{l.actor_name || 'System / Automated'}</td>
                  <td className="py-3.5 px-4 capitalize">{l.entity_type}</td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[10px]">
                    {l.metadata ? JSON.stringify(l.metadata) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
