'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import MarketTicker from './MarketTicker';
import CurrencySelector from './CurrencySelector';
import ThemeToggle from './ThemeToggle';
import { useCurrency } from '@/hooks/useCurrency';
import { Menu, X, LayoutDashboard, Briefcase, PieChart, Milestone, LogOut, ChevronRight, Database } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { currency, setCurrency } = useCurrency();

  const navLinks = [
    { name: 'Dashboard',   href: '/dashboard',   icon: LayoutDashboard },
    { name: 'Projects',    href: '/projects',    icon: Briefcase },
    { name: 'Investments', href: '/investments', icon: PieChart },
    { name: 'Milestones',  href: '/milestones',  icon: Milestone },
    { name: 'Ledger',      href: '/ledger',      icon: Database },
  ];

  return (
    <>
      {/* Market Ticker — above the nav */}
      <MarketTicker />

      <nav className="sticky top-0 z-[100] border-b border-zinc-800 bg-black/80 backdrop-blur-xl px-4 md:px-8 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative h-8 w-8 flex-shrink-0">
              <Image src="/nested_ark_icon.png" alt="Nested Ark Logo" fill sizes="32px" priority className="object-contain" />
            </div>
            <h1 className="text-sm md:text-base font-bold tracking-tighter uppercase">
              Nested Ark <span className="text-teal-500">OS</span>
            </h1>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                    isActive
                      ? 'bg-teal-500/10 text-teal-500'
                      : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Icon size={14} /> {link.name}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {/* Theme toggle — desktop */}
            <ThemeToggle />

            {/* Currency selector */}
            <CurrencySelector currency={currency} onSelect={setCurrency} compact={false} />

            {user && (
              <span className="hidden lg:block text-[10px] text-zinc-600 font-mono uppercase truncate max-w-[140px]">
                {user.email}
              </span>
            )}

            <button
              onClick={logout}
              className="hidden md:flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-[10px] font-bold uppercase tracking-tighter text-zinc-500 hover:bg-zinc-900 hover:text-white transition-all"
            >
              <LogOut size={14} /> Sign Out
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-zinc-400 hover:text-teal-500 transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-[90] bg-black transition-transform duration-300 md:hidden ${isOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex flex-col h-full pt-24 px-6 pb-10">
          <div className="mb-6 px-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Operator Terminal</p>
            <p className="text-white font-medium">{user?.email ?? 'Unauthorized'}</p>
            {user?.role && <p className="text-teal-500 text-[10px] uppercase font-bold tracking-widest mt-1">{user.role}</p>}
            <div className="mt-3 flex items-center gap-3">
              <CurrencySelector currency={currency} onSelect={setCurrency} compact={false} />
              {/* Theme toggle — mobile menu */}
              <ThemeToggle />
            </div>
          </div>

          <div className="space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                    isActive
                      ? 'bg-teal-500 border-teal-400 text-black'
                      : 'bg-zinc-900/50 border-zinc-800 text-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Icon size={20} />
                    <span className="text-lg font-bold uppercase tracking-tight">{link.name}</span>
                  </div>
                  <ChevronRight size={18} />
                </Link>
              );
            })}
          </div>

          <div className="mt-auto">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-3 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold uppercase text-xs tracking-[0.2em]"
            >
              <LogOut size={18} /> Terminate Session
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
