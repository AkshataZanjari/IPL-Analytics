'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Search, BarChart2, GitCompare, Database, LogIn, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Match Explorer', path: '/explorer', icon: <Search size={20} /> },
    { name: 'Team Analytics', path: '/analytics', icon: <BarChart2 size={20} /> },
    { name: 'Team Compare', path: '/compare', icon: <GitCompare size={20} /> },
  ];

  if (session) {
    navItems.push({ name: 'Manage Matches', path: '/manage', icon: <Database size={20} /> });
  }

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
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
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-200">
        {session ? (
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-colors text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        ) : (
          <Link 
            href="/login"
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-colors text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <LogIn size={20} />
            <span className="font-medium">Login</span>
          </Link>
        )}
      </div>
    </div>
  );
}
