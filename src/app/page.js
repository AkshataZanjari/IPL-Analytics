'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { Trophy, Calendar, MapPin, Activity } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getYear = (dateString) => {
    return dateString ? dateString.substring(0, 4) : 'Unknown';
  };

  // Summary stats
  const totalMatches = matches.length;
  const uniqueTeams = new Set();
  const uniqueCities = new Set();
  const uniqueSeasons = new Set();
  const winsByTeam = {};

  matches.forEach(m => {
    if (m.team1) uniqueTeams.add(m.team1);
    if (m.team2) uniqueTeams.add(m.team2);
    if (m.city) uniqueCities.add(m.city);
    if (m.date) uniqueSeasons.add(getYear(m.date));
    
    if (m.winner) {
      winsByTeam[m.winner] = (winsByTeam[m.winner] || 0) + 1;
    }
  });

  const mostSuccessfulTeam = Object.keys(winsByTeam).reduce((a, b) => winsByTeam[a] > winsByTeam[b] ? a : b, 'N/A');
  const latestSeason = Array.from(uniqueSeasons).sort().reverse()[0] || 'N/A';

  const chartData = Object.keys(winsByTeam)
    .map(team => ({ name: team, wins: winsByTeam[team] }))
    .sort((a, b) => b.wins - a.wins);

  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

  // Matches by Season
  const matchesBySeasonMap = {};
  matches.forEach(m => {
    const s = getYear(m.date);
    matchesBySeasonMap[s] = (matchesBySeasonMap[s] || 0) + 1;
  });
  const seasonChartData = Object.keys(matchesBySeasonMap)
    .map(season => ({ name: season, matches: matchesBySeasonMap[season] }))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Main Dashboard</h1>
          <p className="text-slate-500 mt-2">Overview of IPL historical data</p>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl"><Activity size={24} /></div>
          <div><p className="text-slate-500 text-sm">Total Matches</p><h2 className="text-2xl font-bold">{totalMatches}</h2></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl"><Trophy size={24} /></div>
          <div><p className="text-slate-500 text-sm">Most Successful</p><h2 className="text-lg font-bold leading-tight">{mostSuccessfulTeam}</h2></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-pink-500/10 text-pink-400 rounded-xl"><MapPin size={24} /></div>
          <div><p className="text-slate-500 text-sm">Venues/Cities</p><h2 className="text-2xl font-bold">{uniqueCities.size}</h2></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><Trophy size={24} /></div>
          <div><p className="text-slate-500 text-sm">Total Teams</p><h2 className="text-2xl font-bold">{uniqueTeams.size}</h2></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl"><Calendar size={24} /></div>
          <div><p className="text-slate-500 text-sm">Total Seasons</p><h2 className="text-2xl font-bold">{uniqueSeasons.size}</h2></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl"><Calendar size={24} /></div>
          <div><p className="text-slate-500 text-sm">Latest Season</p><h2 className="text-2xl font-bold">{latestSeason}</h2></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Wins by Team */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px] flex flex-col">
          <h3 className="text-lg font-semibold mb-6">Wins by Team</h3>
          <div className="flex-1 w-full h-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis dataKey="name" type="category" width={100} stroke="#64748b" fontSize={12} />
                <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                <Bar dataKey="wins" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Matches by Season */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px] flex flex-col">
          <h3 className="text-lg font-semibold mb-6">Matches by Season</h3>
          <div className="flex-1 w-full h-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seasonChartData} margin={{ left: -20, right: 10, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                <Bar dataKey="matches" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
