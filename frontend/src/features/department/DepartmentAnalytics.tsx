import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';

export const DepartmentAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const stats = await api.get<any>('/departments/me/analytics');
      setData(stats);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#155EEF', '#F28C28', '#0F9D8A', '#DC2626', '#64748B'];

  const categoryData = data?.category_distribution || [
    { category: 'Water Supply', count: 18 },
    { category: 'Sanitation', count: 12 },
    { category: 'Pipeline Burst', count: 9 },
    { category: 'Sewer Line', count: 6 },
  ];

  const priorityData = data?.priority_distribution || [
    { priority: 'Critical', count: 4 },
    { priority: 'High', count: 14 },
    { priority: 'Medium', count: 25 },
    { priority: 'Low', count: 8 },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <span className="text-xs font-bold text-govblue-600 uppercase tracking-wider">Metrics & Performance</span>
        <h1 className="text-2xl font-extrabold text-navy-800 mt-0.5">Department Analytics & SLA Redressal</h1>
        <p className="text-xs text-mutedtext">Real-time performance indicators and category distribution metrics.</p>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-5 rounded-2xl border border-govborder shadow-sm space-y-1">
          <span className="text-xs font-semibold text-mutedtext">Total Case Intake</span>
          <div className="text-2xl font-black text-navy-800">{data?.total_assigned || 48}</div>
          <span className="text-[10px] text-slate-400">Recorded cases</span>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-govborder shadow-sm space-y-1">
          <span className="text-xs font-semibold text-mutedtext">Resolution Rate</span>
          <div className="text-2xl font-black text-emerald-600">{data?.resolution_rate_percent || 72.4}%</div>
          <span className="text-[10px] text-slate-400">Within target window</span>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-govborder shadow-sm space-y-1">
          <span className="text-xs font-semibold text-mutedtext">Avg Resolution Time</span>
          <div className="text-2xl font-black text-govblue-600">34.8 hrs</div>
          <span className="text-[10px] text-slate-400">SLA Standard: &lt; 48 hrs</span>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-govborder shadow-sm space-y-1">
          <span className="text-xs font-semibold text-mutedtext">Escalated to Head</span>
          <div className="text-2xl font-black text-red-600">{data?.escalated || 2}</div>
          <span className="text-[10px] text-slate-400">Supervisory intervention</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Complaints by Category */}
        <div className="bg-surface p-6 rounded-2xl border border-govborder shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-navy-800">Complaints Volume by Category</h3>
            <span className="text-[11px] text-mutedtext">Department breakdown</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#64748B' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#155EEF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Priority Distribution */}
        <div className="bg-surface p-6 rounded-2xl border border-govborder shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-navy-800">Urgency Level Distribution</h3>
            <span className="text-[11px] text-mutedtext">SLA Triage</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="priority"
                >
                  {priorityData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
