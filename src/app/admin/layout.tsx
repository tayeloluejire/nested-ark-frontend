'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import MarketTicker from '@/components/MarketTicker';
import { LayoutDashboard, ShieldCheck, Users, Database, Briefcase, LogOut, ChevronRight, Menu, Activity, Loader2, Megaphone } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Command Center', icon: LayoutDashboard, exact: true },
  { href: '/admin/approval', label: 'Approval Queue', icon: ShieldCheck },
  { href: '/admin/projects', label: 'Projects', icon: Briefcase },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/news', label: 'Ticker & Ads', icon: Megaphone },
  { href: '/admin/ledger', label: 'Ledger', icon: Database },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) { router.replace('/login'); return; }
    if (!isLoading && user && user.role !== 'ADMIN' && user.role !== 'GOVERNMENT' && user.role !== 'VERIFIER') router.replace('/dashboard');
  }, [user, isLoading, router]);

  if (isLoading || !user) return <div className="h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-teal-500" size={32} /></div>;
  if (!['ADMIN', 'GOVERNMENT', 'VERIFIER'].includes(user.role)) return null;

  const isActive = (href: string, exact?: boolean) => exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <MarketTicker />
      <div className="flex flex-1 min-h-0">
        <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-black border-r border-zinc-800 flex flex-col transform transition-transform duration-300 lg:translate-x-0 lg:static ${open ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-5 border-b border-zinc-800 flex items-center gap-3">
            <div className="relative h-7 w-7 flex-shrink-0">
              <Image src="/nested_ark_icon.png" alt="Logo" fill sizes="28px" className="object-contain" />
            </div>
            <div>
              <h1 className="text-xs font-bold tracking-tighter uppercase">Nested Ark</h1>
              <p className="text-[9px] text-teal-500 uppercase font-bold tracking-widest">Admin</p>
            </div>
          </div>
          <div className="px-4 py-3 border-b border-zinc-800">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${user.role === 'ADMIN' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-teal-500/10 text-teal-500 border border-teal-500/20'}`}>
              <ShieldCheck size={9} /> {user.role}
            </span>
            <p className="text-zinc-600 text-[9px] font-mono mt-1.5 truncate">{user.email}</p>
          </div>
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = item.exact ? pathname === item.href : (pathname.startsWith(item.href) && item.href !== '/admin') || (item.exact && pathname === item.href);
              return (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${active ? 'bg-teal-500/10 text-teal-500 border border-teal-500/20' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}>
                  <div className="flex items-center gap-2.5"><Icon size={14} />{item.label}</div>
                  {active && <ChevronRight size={11} />}
                </Link>
              );
            })}
          </nav>
          <div className="p-3 border-t border-zinc-800 space-y-1">
            <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-900 text-[11px] font-bold uppercase tracking-widest transition-all">
              <Activity size={14} /> Back to OS
            </Link>
            <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-red-500/70 hover:text-red-400 hover:bg-red-500/5 text-[11px] font-bold uppercase tracking-widest transition-all">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </aside>
        {open && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-black">
            <button onClick={() => setOpen(true)} className="p-2 text-zinc-400 hover:text-white"><Menu size={20} /></button>
            <span className="text-xs font-bold uppercase tracking-widest text-teal-500">Admin</span>
            <button onClick={logout} className="p-2 text-zinc-400 hover:text-red-400"><LogOut size={16} /></button>
          </header>
          <main className="flex-1 overflow-y-auto p-6 max-w-5xl w-full mx-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
