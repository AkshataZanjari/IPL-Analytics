'use client';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Trophy, Swords } from 'lucide-react';

export default function CompareTeams() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/matches');
      const data = await res.json();
      setMatches(data);
      
      const teams = Array.from(new Set(data.flatMap(m => [m.team1, m.team2]).filter(Boolean))).sort();
      if (teams.length > 1) {
        setTeamA(teams[0]);
        setTeamB(teams[1]);
      }
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getYear = (dateString) => dateString ? dateString.substring(0, 4) : '';
  const teams = Array.from(new Set(matches.flatMap(m => [m.team1, m.team2]).filter(Boolean))).sort();

  // Head to Head
  const h2hMatches = matches.filter(m => (m.team1 === teamA && m.team2 === teamB) || (m.team1 === teamB && m.team2 === teamA));
  const h2hTeamAWins = h2hMatches.filter(m => m.winner === teamA).length;
  const h2hTeamBWins = h2hMatches.filter(m => m.winner === teamB).length;

  // Overall Stats
  const getStats = (team) => {
    const tMatches = matches.filter(m => m.team1 === team || m.team2 === team);
    const wins = tMatches.filter(m => m.winner === team).length;
    return {
      played: tMatches.length,
      wins,
      winRate: tMatches.length > 0 ? ((wins / tMatches.length) * 100).toFixed(1) : 0
    };
  };

  const statsA = getStats(teamA);
  const statsB = getStats(teamB);

  // Comparison Chart Data
  const compareData = [
    { name: 'Total Matches', [teamA]: statsA.played, [teamB]: statsB.played },
    { name: 'Total Wins', [teamA]: statsA.wins, [teamB]: statsB.wins },
    { name: 'H2H Wins', [teamA]: h2hTeamAWins, [teamB]: h2hTeamBWins }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold">Team Comparison</h1>
        <p className="text-slate-500 mt-2">Compare head-to-head records and overall statistics</p>
      </header>

      {/* Selectors */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="w-full md:w-5/12">
          <label className="block text-xs font-medium text-blue-400 mb-1 uppercase tracking-wider">Team 1</label>
          <select value={teamA} onChange={e => setTeamA(e.target.value)} className="w-full bg-slate-50 border-2 border-blue-500/30 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-lg">
            {teams.map(t => <option key={t} value={t} disabled={t === teamB}>{t}</option>)}
          </select>
        </div>
        <div className="bg-slate-100 p-4 rounded-full flex-shrink-0">
          <Swords size={28} className="text-slate-500" />
        </div>
        <div className="w-full md:w-5/12">
          <label className="block text-xs font-medium text-pink-400 mb-1 uppercase tracking-wider text-right">Team 2</label>
          <select value={teamB} onChange={e => setTeamB(e.target.value)} className="w-full bg-slate-50 border-2 border-pink-500/30 rounded-xl p-3 focus:ring-2 focus:ring-pink-500 outline-none text-lg text-right" dir="rtl">
            {teams.map(t => <option key={t} value={t} disabled={t === teamA}>{t}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <>
          {/* Head to Head Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1/2 h-2 bg-blue-500"></div>
            <div className="absolute top-0 right-0 w-1/2 h-2 bg-pink-500"></div>
            <div className="p-8 text-center">
              <h3 className="text-sm uppercase tracking-widest text-slate-500 font-semibold mb-6">Head to Head ({h2hMatches.length} Matches)</h3>
              <div className="flex justify-between items-center max-w-lg mx-auto">
                <div className="text-center w-1/3">
                  <div className="text-6xl font-bold text-blue-400">{h2hTeamAWins}</div>
                  <div className="text-sm text-slate-500 mt-2 font-medium">{teamA}</div>
                </div>
                <div className="text-slate-600 font-bold text-2xl w-1/3">-</div>
                <div className="text-center w-1/3">
                  <div className="text-6xl font-bold text-pink-400">{h2hTeamBWins}</div>
                  <div className="text-sm text-slate-500 mt-2 font-medium">{teamB}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overall Comparison Stats */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <h3 className="text-lg font-semibold mb-6">Overall Statistics</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2"><span className="text-slate-500">Total Matches</span></div>
                  <div className="flex items-center gap-4">
                    <div className="w-1/2 text-right font-medium text-blue-400">{statsA.played}</div>
                    <div className="w-px h-6 bg-slate-200"></div>
                    <div className="w-1/2 text-left font-medium text-pink-400">{statsB.played}</div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2"><span className="text-slate-500">Total Wins</span></div>
                  <div className="flex items-center gap-4">
                    <div className="w-1/2 text-right font-medium text-blue-400">{statsA.wins}</div>
                    <div className="w-px h-6 bg-slate-200"></div>
                    <div className="w-1/2 text-left font-medium text-pink-400">{statsB.wins}</div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2"><span className="text-slate-500">Win Rate</span></div>
                  <div className="flex items-center gap-4">
                    <div className="w-1/2 text-right font-medium text-blue-400">{statsA.winRate}%</div>
                    <div className="w-px h-6 bg-slate-200"></div>
                    <div className="w-1/2 text-left font-medium text-pink-400">{statsB.winRate}%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[350px] flex flex-col">
              <h3 className="text-lg font-semibold mb-4">Comparison Graph</h3>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compareData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey={teamA} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={teamB} fill="#ec4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
