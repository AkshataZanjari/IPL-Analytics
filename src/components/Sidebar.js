'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Search, BarChart2, GitCompare, Database } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Match Explorer', path: '/explorer', icon: <Search size={20} /> },
    { name: 'Team Analytics', path: '/analytics', icon: <BarChart2 size={20} /> },
    { name: 'Team Compare', path: '/compare', icon: <GitCompare size={20} /> },
    { name: 'Manage Matches', path: '/manage', icon: <Database size={20} /> },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
          IPL Insights
        </h1>
        <p className="text-slate-500 text-xs mt-1 uppercase tracking-wider font-semibold">Analytics Platform</p>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
