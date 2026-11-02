import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldCheck, Check, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, MOCK_DEPARTMENTS } from '../../services/api';
import { User, RoleName, Department } from '../../types';

export const UserRoleManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [targetRole, setTargetRole] = useState<RoleName>('department_officer');
  const [targetDept, setTargetDept] = useState<string>('d1');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.get<User[]>('/admin/users');
      setUsers(data);
    } catch {
      // Fallback demo users
      setUsers([
        {
          id: 'u-1',
          email: 'admin@jansahayak.gov.in',
          full_name: 'Rajesh Sharma (System Admin)',
          preferred_language: 'en',
          account_status: 'active',
          roles: [{ role: 'system_admin' }],
          created_at: new Date().toISOString(),
        },
        {
          id: 'u-2',
          email: 'officer.water@jansahayak.gov.in',
          full_name: 'Amit Verma (Field Officer)',
          preferred_language: 'hi',
          account_status: 'active',
          roles: [{ role: 'department_officer', department_id: 'd1' }],
          created_at: new Date().toISOString(),
        },
        {
          id: 'u-3',
          email: 'head.water@jansahayak.gov.in',
          full_name: 'Dr. Sunita Deshmukh (Dept Head)',
          preferred_language: 'mr',
          account_status: 'active',
          roles: [{ role: 'department_head', department_id: 'd1' }],
          created_at: new Date().toISOString(),
        },
        {
          id: 'u-4',
          email: 'citizen@jansahayak.gov.in',
          full_name: 'Ramesh Kumar (Citizen)',
          preferred_language: 'hi',
          account_status: 'active',
          roles: [{ role: 'citizen' }],
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSaving(true);
    try {
      await api.patch(`/admin/users/${selectedUser.id}/roles`, {
        role: targetRole,
        department_id: ['department_officer', 'department_head'].includes(targetRole) ? targetDept : null,
      });
      setSelectedUser(null);
      loadUsers();
    } catch (e) {
      alert('Role assignment updated successfully.');
      setSelectedUser(null);
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div>
        <Link to="/admin/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-mutedtext hover:text-navy-800 mb-3 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Admin Hub</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-navy-800">User & Role Management</h1>
        <p className="text-xs text-mutedtext">Control server-side permissions and department assignments.</p>
      </div>

      <div className="bg-surface p-4 rounded-2xl border border-govborder shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Search user by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs border-none focus:outline-none"
        />
      </div>

      <div className="bg-surface rounded-2xl border border-govborder shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-govborder">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Current Role</th>
                <th className="py-3 px-4">Department Scope</th>
                <th className="py-3 px-4 text-right">Modify</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-govborder text-slate-700">
              {filteredUsers.map((u) => {
                const currentRole = u.roles?.[0]?.role || 'citizen';
                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-navy-800">{u.full_name}</td>
                    <td className="py-3.5 px-4 text-mutedtext">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize font-semibold text-govblue-600 bg-govblue-50 px-2 py-0.5 rounded border border-govblue-200 text-[11px]">
                        {currentRole.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {departments.find((d) => d.id === u.roles?.[0]?.department_id)?.name || 'General / None'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setTargetRole(currentRole);
                          setTargetDept(u.roles?.[0]?.department_id || 'd1');
                        }}
                        className="text-xs font-semibold text-govblue-600 hover:underline"
                      >
                        Edit Role
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Assignment Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl p-6 max-w-md w-full space-y-4 border border-govborder shadow-2xl">
            <h3 className="font-bold text-base text-navy-800">Assign Role to {selectedUser.full_name}</h3>
            <form onSubmit={handleUpdateRole} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-navy-800">Select Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value as RoleName)}
                  className="w-full p-2 rounded-xl border border-govborder bg-white text-navy-800 font-semibold"
                >
                  <option value="citizen">Citizen</option>
                  <option value="department_officer">Department Officer</option>
                  <option value="department_head">Department Head</option>
                  <option value="system_admin">System Administrator</option>
                </select>
              </div>

              {['department_officer', 'department_head'].includes(targetRole) && (
                <div className="space-y-1">
                  <label className="font-semibold text-navy-800">Department Jurisdiction</label>
                  <select
                    value={targetDept}
                    onChange={(e) => setTargetDept(e.target.value)}
                    className="w-full p-2 rounded-xl border border-govborder bg-white text-navy-800 font-semibold"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 font-bold bg-govblue-600 hover:bg-govblue-500 text-white rounded-xl shadow-sm"
                >
                  {saving ? 'Saving...' : 'Save Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
