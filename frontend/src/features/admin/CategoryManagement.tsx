import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Plus, ArrowLeft } from 'lucide-react';
import { MOCK_CATEGORIES } from '../../services/api';
import { ComplaintCategory } from '../../types';

export const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<ComplaintCategory[]>(MOCK_CATEGORIES);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    const newCat: ComplaintCategory = {
      id: `c-${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      is_active: true,
      created_at: new Date().toISOString(),
    };
    setCategories([newCat, ...categories]);
    setName('');
    setCode('');
    setShowAdd(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-mutedtext hover:text-navy-800 mb-3 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Admin Hub</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-navy-800">Complaint Categories</h1>
          <p className="text-xs text-mutedtext">Classify civic grievances and configure intelligent AI taxonomy.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-govblue-600 hover:bg-govblue-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      <div className="bg-surface rounded-2xl border border-govborder shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-govborder">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4">AI Matching Status</th>
                <th className="py-3 px-4 text-right">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-govborder text-slate-700">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-govblue-600">{c.code}</td>
                  <td className="py-3.5 px-4 font-bold text-navy-800">{c.name}</td>
                  <td className="py-3.5 px-4 text-emerald-600 font-semibold">Trained in Heuristics & Sarvam</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl p-6 max-w-md w-full space-y-4 border border-govborder shadow-2xl">
            <h3 className="font-bold text-base text-navy-800">Add New Category</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-navy-800">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Street Lighting & Night Safety"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-govborder"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-navy-800">Category Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CAT_LIGHTING"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-govborder font-mono uppercase"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-govblue-600 hover:bg-govblue-500 text-white rounded-xl shadow-sm"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
