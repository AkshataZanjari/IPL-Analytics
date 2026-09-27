'use client';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function MatchExplorer() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/matches');
      const data = await res.json();
      setMatches(data);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getYear = (dateString) => dateString ? dateString.substring(0, 4) : '';

  // Extract unique filter options
  const teams = Array.from(new Set(matches.flatMap(m => [m.team1, m.team2]).filter(Boolean))).sort();
  const cities = Array.from(new Set(matches.map(m => m.city).filter(Boolean))).sort();
  const seasons = Array.from(new Set(matches.map(m => getYear(m.date)).filter(Boolean))).sort().reverse();

  // Apply filters
  const filteredMatches = matches.filter(m => {
    const matchSearch = (m.team1?.toLowerCase() || '').includes(search.toLowerCase()) || 
                        (m.team2?.toLowerCase() || '').includes(search.toLowerCase()) ||
                        (m.city?.toLowerCase() || '').includes(search.toLowerCase());
    const matchTeam = teamFilter ? (m.team1 === teamFilter || m.team2 === teamFilter) : true;
    const matchCity = cityFilter ? m.city === cityFilter : true;
    const matchSeason = seasonFilter ? getYear(m.date) === seasonFilter : true;
    return matchSearch && matchTeam && matchCity && matchSeason;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold">Match Explorer</h1>
        <p className="text-slate-500 mt-2">Filter and search through historical IPL matches</p>
      </header>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search teams or city..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <select value={seasonFilter} onChange={e => setSeasonFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="">All Seasons</option>
            {seasons.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={teamFilter} onChange={e => setTeamFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="">All Teams</option>
            {teams.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="">All Cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex h-64 items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>
          ) : filteredMatches.length === 0 ? (
            <div className="flex flex-col h-64 items-center justify-center text-slate-500">
              <Search size={48} className="mb-4 opacity-20" />
              <p>No matches found for the selected filters.</p>
              <button onClick={() => {setSearch(''); setTeamFilter(''); setCityFilter(''); setSeasonFilter('');}} className="mt-4 text-indigo-400 hover:underline">Clear Filters</button>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Match</th>
                  <th className="px-6 py-4 font-medium">Venue (City)</th>
                  <th className="px-6 py-4 font-medium">Winner</th>
                  <th className="px-6 py-4 font-medium">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredMatches.map(m => (
                  <tr key={m.id} className="hover:bg-slate-100 transition-colors">
                    <td className="px-6 py-4 text-slate-600">{m.date}</td>
                    <td className="px-6 py-4">
                      <span className={m.winner === m.team1 ? 'font-bold text-slate-900' : 'text-slate-500'}>{m.team1}</span>
                      <span className="mx-2 text-slate-600">vs</span>
                      <span className={m.winner === m.team2 ? 'font-bold text-slate-900' : 'text-slate-500'}>{m.team2}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{m.city}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {m.winner}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {m.result_margin} {m.result}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="p-4 border-t border-slate-200 text-slate-500 text-sm">
          Showing {filteredMatches.length} matches
        </div>
      </div>
    </div>
  );
}
