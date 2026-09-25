'use client';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Trophy, Activity, Target, MapPin } from 'lucide-react';

export default function TeamAnalytics() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState('');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/matches');
      const data = await res.json();
      setMatches(data);
      
      const teams = Array.from(new Set(data.flatMap(m => [m.team1, m.team2]).filter(Boolean))).sort();
      if (teams.length > 0) setSelectedTeam(teams[0]);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getYear = (dateString) => dateString ? dateString.substring(0, 4) : '';
  const teams = Array.from(new Set(matches.flatMap(m => [m.team1, m.team2]).filter(Boolean))).sort();

  // Calculate team stats
  const teamMatches = matches.filter(m => m.team1 === selectedTeam || m.team2 === selectedTeam);
  const matchesPlayed = teamMatches.length;
  const matchesWon = teamMatches.filter(m => m.winner === selectedTeam).length;
  const matchesLost = matchesPlayed - matchesWon;
  const winPercentage = matchesPlayed > 0 ? ((matchesWon / matchesPlayed) * 100).toFixed(1) : 0;
  
  const venueStats = {};
  teamMatches.forEach(m => {
    venueStats[m.city] = (venueStats[m.city] || 0) + 1;
  });
  const mostPlayedVenue = Object.keys(venueStats).length > 0 
    ? Object.keys(venueStats).reduce((a, b) => venueStats[a] > venueStats[b] ? a : b)
    : 'N/A';

  // Chart data: Performance by Season
  const seasonStats = {};
  teamMatches.forEach(m => {
    const s = getYear(m.date);
    if (!seasonStats[s]) seasonStats[s] = { season: s, wins: 0, losses: 0 };
    if (m.winner === selectedTeam) seasonStats[s].wins += 1;
    else seasonStats[s].losses += 1;
  });
  const seasonChartData = Object.values(seasonStats).sort((a, b) => a.season.localeCompare(b.season));

  const winLossData = [
    { name: 'Wins', value: matchesWon },
    { name: 'Losses', value: matchesLost }
  ];
  const COLORS = ['#10b981', '#f43f5e'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold">Team Analytics</h1>
          <p className="text-slate-400 mt-2">Deep dive into specific team performance</p>
        </div>
        <div className="w-full md:w-64">
          <label className="block text-xs font-medium text-slate-500 mb-1">Select Team</label>
          <select 
            value={selectedTeam} 
            onChange={e => setSelectedTeam(e.target.value)} 
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
          >
            {teams.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </header>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : matchesPlayed === 0 ? (
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center text-slate-400">
          No data available for this team.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-sm flex flex-col justify-between">
              <div className="text-slate-400 text-sm flex justify-between items-center">Matches Played <Activity size={16}/></div>
              <h2 className="text-3xl font-bold mt-2">{matchesPlayed}</h2>
            </div>
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-sm flex flex-col justify-between">
              <div className="text-slate-400 text-sm flex justify-between items-center">Matches Won <Trophy size={16} className="text-emerald-400"/></div>
              <h2 className="text-3xl font-bold mt-2 text-emerald-400">{matchesWon}</h2>
            </div>
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-sm flex flex-col justify-between">
              <div className="text-slate-400 text-sm flex justify-between items-center">Win Percentage <Target size={16}/></div>
              <h2 className="text-3xl font-bold mt-2">{winPercentage}%</h2>
            </div>
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-sm flex flex-col justify-between">
              <div className="text-slate-400 text-sm flex justify-between items-center">Most Played Venue <MapPin size={16}/></div>
              <h2 className="text-xl font-bold mt-2 truncate">{mostPlayedVenue}</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-sm lg:col-span-2 h-[350px] flex flex-col">
              <h3 className="text-lg font-semibold mb-4">Performance by Season</h3>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={seasonChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="season" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <RechartsTooltip cursor={{fill: '#334155'}} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Bar dataKey="wins" name="Wins" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="losses" name="Losses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-sm h-[350px] flex flex-col">
              <h3 className="text-lg font-semibold mb-4">Win/Loss Ratio</h3>
              <div className="flex-1 w-full min-h-0 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={winLossData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                      {winLossData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center pointer-events-none">
                  <div className="text-3xl font-bold">{winPercentage}%</div>
                  <div className="text-xs text-slate-400">Win Rate</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
