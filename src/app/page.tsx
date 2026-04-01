'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, TrendingUp, ShieldCheck, Zap, Globe, DollarSign, Activity } from 'lucide-react';
import MarketTicker from '@/components/MarketTicker';
import api from '@/lib/api';

interface MarketSummary {
  active_projects: number;
  total_project_value_usd: number;
  countries_active: number;
  total_committed_usd: number;
  total_investors: number;
  milestones_paid: number;
  ledger_events: number;
  key_rates: { NGN: number; GHS: number; KES: number; EUR: number; GBP: number };
}

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState<MarketSummary | null>(null);

  useEffect(() => {
    if (!isLoading && user) router.replace('/dashboard');
  }, [user, isLoading, router]);

  useEffect(() => {
    api.get('/api/market/summary').then(r => setSummary(r.data.summary)).catch(() => {});
  }, []);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#050505]">
      <Loader2 className="animate-spin text-teal-500" size={28} />
    </div>
  );

  if (user) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Live market ticker */}
      <MarketTicker />

      <nav className="border-b border-zinc-800 bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-base font-bold tracking-tighter uppercase">Nested Ark <span className="text-teal-500">OS</span></h1>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">Login</Link>
            <Link href="/register" className="bg-teal-500 text-black px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-teal-400 transition-colors">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-teal-500 text-[10px] uppercase font-bold tracking-[0.3em] mb-6">Global Infrastructure Investment Exchange</p>
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-6 leading-none">
          Infrastructure<br /><span className="text-teal-500">Investment</span><br />OS
        </h2>
        <p className="text-zinc-400 text-lg mb-10 max-w-2xl mx-auto">
          Connect governments, contractors, and investors across Africa and beyond — fund, build, and verify infrastructure with full transparency and automated escrow.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/register" className="bg-white text-black px-8 py-4 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-teal-500 transition-colors">Join the Network</Link>
          <Link href="/login" className="border border-zinc-700 text-white px-8 py-4 rounded-xl font-bold uppercase text-xs tracking-widest hover:border-teal-500 transition-colors">Sign In</Link>
        </div>
      </section>

      {/* Live market stats */}
      {summary && (
        <section className="max-w-7xl mx-auto px-6 pb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Active Projects', value: summary.active_projects, icon: Activity, color: 'text-teal-500' },
              { label: 'Total Value (USD)', value: `$${(summary.total_project_value_usd / 1_000_000).toFixed(1)}M`, icon: DollarSign, color: 'text-emerald-500' },
              { label: 'Countries', value: summary.countries_active, icon: Globe, color: 'text-amber-400' },
              { label: 'Investors', value: summary.total_investors, icon: TrendingUp, color: 'text-teal-500' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 text-center">
                  <Icon className={`${item.color} mx-auto mb-2`} size={20} />
                  <p className="text-2xl font-black font-mono">{item.value}</p>
                  <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-1">{item.label}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Live exchange rates strip */}
      {summary?.key_rates && (
        <section className="max-w-7xl mx-auto px-6 pb-12">
          <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/20 flex items-center gap-6 overflow-x-auto">
            <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest flex-shrink-0">Live Rates (USD)</span>
            {Object.entries(summary.key_rates).map(([code, rate]) => (
              <div key={code} className="flex-shrink-0 text-center">
                <p className="text-[10px] text-zinc-500 uppercase font-bold">{code}</p>
                <p className="font-mono text-sm font-bold text-white">{Number(rate).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              </div>
            ))}
            <span className="text-[9px] text-zinc-700 font-mono flex-shrink-0">Updated hourly via Exchange Rate Oracle</span>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: TrendingUp, title: 'Live Investment Pools', desc: 'Commit capital to real infrastructure projects with real-time funding progress tracking. Values shown in your local currency.' },
            { icon: ShieldCheck, title: 'Tri-Layer Verified', desc: 'Every milestone requires AI validator + human auditor + drone capture before funds release — unbreakable security.' },
            { icon: Zap, title: 'Global Market Reference', desc: 'Multi-currency support (NGN, GHS, KES, EUR, GBP), geo-aware project discovery, and a live market ticker.' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="p-8 rounded-3xl border border-zinc-800 bg-zinc-900/30">
                <Icon className="text-teal-500 mb-4" size={24} />
                <h3 className="font-bold uppercase tracking-tight mb-2">{item.title}</h3>
                <p className="text-zinc-500 text-sm">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
