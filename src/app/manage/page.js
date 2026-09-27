'use client';
import { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, X, Save, Database } from 'lucide-react';

export default function ManageMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [notification, setNotification] = useState(null);
  
  const [formData, setFormData] = useState({
    date: '', team1: '', team2: '', winner: '', city: '', result: 'runs', result_margin: '', target_runs: ''
  });

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/matches');
      const data = await res.json();
      setMatches(data);
    } catch (error) {
      showNotification('error', 'Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const openAddModal = () => {
    setFormData({ date: '', team1: '', team2: '', winner: '', city: '', result: 'runs', result_margin: '', target_runs: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (match) => {
    setFormData({ ...match });
    setEditingId(match.id);
    setIsModalOpen(true);
  };

  const extractZodMessage = (details) => {
    if (!details || typeof details !== 'object') return null;
    if (details._errors && details._errors.length > 0) {
      return details._errors[0];
    }
    for (const key of Object.keys(details)) {
      if (key !== '_errors') {
        const msg = extractZodMessage(details[key]);
        if (msg) return msg;
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.team1 === formData.team2) {
      showNotification('error', 'Team 1 and Team 2 cannot be the same');
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/matches/${editingId}` : '/api/matches';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        showNotification('success', `Match ${editingId ? 'updated' : 'added'} successfully!`);
        setIsModalOpen(false);
        fetchMatches(); // refresh
      } else {
        try {
          const errorBody = await res.json();
          const zodMsg = extractZodMessage(errorBody.details);
          const finalMsg = zodMsg || errorBody.error || 'Something went wrong';
          showNotification('error', finalMsg);
        } catch (e) {
          showNotification('error', 'Something went wrong');
        }
      }
    } catch (error) {
      showNotification('error', 'Failed to save match');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this match permanently?')) return;
    try {
      const res = await fetch(`/api/matches/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification('success', 'Match deleted successfully');
        setMatches(matches.filter(m => m.id !== id));
      }
    } catch (error) {
      showNotification('error', 'Failed to delete match');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manage Matches</h1>
          <p className="text-slate-500 mt-2">Add, edit, or delete IPL match records (CRUD)</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition-colors px-4 py-2 rounded-lg font-medium shadow-lg shadow-indigo-900/20">
          <Plus size={18} /> Add Match
        </button>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-xl border z-50 animate-in slide-in-from-top-2 ${
          notification.type === 'success' ? 'bg-emerald-900/90 border-emerald-500/50 text-emerald-100' : 'bg-red-900/90 border-red-500/50 text-red-100'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex h-64 items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>
          ) : matches.length === 0 ? (
            <div className="flex flex-col h-64 items-center justify-center text-slate-500">
              <Database size={48} className="mb-4 opacity-20" />
              <p>No matches found in database.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Match</th>
                  <th className="px-6 py-4 font-medium">City</th>
                  <th className="px-6 py-4 font-medium">Winner</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {matches.map(m => (
                  <tr key={m.id} className="hover:bg-slate-100 transition-colors">
                    <td className="px-6 py-4 text-slate-600">{m.date}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {m.team1} <span className="text-slate-600 font-normal mx-1">vs</span> {m.team2}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{m.city}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {m.winner}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openEditModal(m)} className="text-slate-500 hover:text-blue-400 transition-colors p-1.5 rounded-md hover:bg-blue-400/10">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(m.id)} className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-md hover:bg-red-400/10">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Match' : 'Add New Match'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-900 p-1 rounded-md hover:bg-white"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Date *</label>
                  <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">City *</label>
                  <input required placeholder="E.g. Mumbai" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Team 1 *</label>
                  <input required placeholder="E.g. Chennai Super Kings" value={formData.team1} onChange={e => setFormData({...formData, team1: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Team 2 *</label>
                  <input required placeholder="E.g. Mumbai Indians" value={formData.team2} onChange={e => setFormData({...formData, team2: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Winner *</label>
                  <select required value={formData.winner} onChange={e => setFormData({...formData, winner: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="" disabled>Select winner</option>
                    {formData.team1 && <option value={formData.team1}>{formData.team1}</option>}
                    {formData.team2 && <option value={formData.team2}>{formData.team2}</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Result Type</label>
                  <select value={formData.result} onChange={e => setFormData({...formData, result: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="runs">Runs</option>
                    <option value="wickets">Wickets</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Margin (Runs/Wickets)</label>
                  <input required type="number" min="0" value={formData.result_margin} onChange={e => setFormData({...formData, result_margin: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Target Runs (Optional)</label>
                  <input type="number" min="0" value={formData.target_runs} onChange={e => setFormData({...formData, target_runs: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors font-medium">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-900/20 flex items-center gap-2">
                  <Save size={18} /> {editingId ? 'Update Match' : 'Save Match'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
