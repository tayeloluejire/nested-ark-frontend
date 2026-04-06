'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import api from '@/lib/api';
import {
  Loader2, TrendingUp, ShieldCheck, Zap, Globe,
  DollarSign, Activity, Search, ArrowRight, CheckCircle2
} from 'lucide-react';
import MarketTicker from '@/components/MarketTicker';
import ThemeToggle from '@/components/ThemeToggle';

interface MarketSummary {
  active_projects: number;
  total_projects: number;
  total_invested_ngn: number;
  countries_active: number;
  total_operators: number;
  total_bids: number;
  key_rates?: { NGN?: number; GHS?: number; KES?: number; EUR?: number; GBP?: number };
}

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [summary, setSummary]     = useState<MarketSummary | null>(null);
  const [searchId, setSearchId]   = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!isLoading && user) router.replace('/dashboard');
  }, [user, isLoading, router]);

  useEffect(() => {
    api.get('/api/marketplace/stats').then(r => setSummary(r.data.stats)).catch(() => {});
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchId.trim();
    if (!q) return;
    setSearching(true);
    router.push(`/projects?project_number=${encodeURIComponent(q)}`);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#050505]">
      <div className="text-center space-y-3">
        <Loader2 className="animate-spin text-teal-500 mx-auto" size={28} />
        <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-[0.2em]">Initializing OS…</p>
      </div>
    </div>
  );

  if (user) return null;

  const ngnTotal = summary?.total_invested_ngn ?? 0;
  const usdTotal = ngnTotal / 1379;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-teal-500/30">
      <MarketTicker />

      {/* Navigation */}
      <nav className="border-b border-zinc-900 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 bg-teal-500 rounded-sm rotate-45 flex-shrink-0" />
            <h1 className="text-sm font-black tracking-[0.15em] uppercase">
              Nested Ark <span className="text-teal-500 text-[10px] align-top">OS</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <Link href="/projects" className="text-zinc-600 hover:text-white text-[9px] font-bold uppercase tracking-widest transition-colors hidden sm:block">
              Marketplace
            </Link>
            <Link href="/login" className="text-zinc-500 hover:text-white text-[9px] font-bold uppercase tracking-widest transition-colors">
              Sign In
            </Link>
            {/* Theme toggle in landing nav */}
            <ThemeToggle compact />
            <Link
              href="/register"
              className="bg-white text-black px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-teal-500 transition-all"
            >
              Apply for Access
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-14 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-500/20 bg-teal-500/5 text-teal-500 mb-8">
          <ShieldCheck size={11} />
          <span className="text-[8px] uppercase font-black tracking-[0.2em]">NAP-2026 Protocol Active · Tri-Layer Verified</span>
        </div>

        <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.85] mb-6">
          The Global<br />
          <span className="text-teal-500">Infrastructure</span><br />
          Exchange
        </h2>

        <p className="text-zinc-500 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          The sovereign operating system for high-trust development.
          Connect Diaspora capital to verified African infrastructure with{' '}
          <span className="text-white">immutable ledgers</span>,{' '}
          <span className="text-white">3D visual auditing</span> and{' '}
          <span className="text-white">automated escrow</span>.
        </p>

        {/* Global NAP Search */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto relative group mb-6">
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-700" />
          <div className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-2xl p-2 focus-within:border-teal-500 transition-all">
            <div className="pl-3 pr-2 text-zinc-600 flex-shrink-0"><Search size={16} /></div>
            <input
              type="text"
              placeholder="Track a project — enter NAP-2026-00042"
              value={searchId}
              onChange={e => setSearchId(e.target.value.toUpperCase())}
              className="flex-1 bg-transparent border-none outline-none text-sm font-mono tracking-wider py-3 placeholder:text-zinc-700"
            />
            <button
              type="submit"
              disabled={searching}
              className="bg-teal-500 text-black px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all flex items-center gap-1.5 disabled:opacity-60 flex-shrink-0"
            >
              {searching ? <Loader2 className="animate-spin" size={12} /> : <><Search size={12} /> Track</>}
            </button>
          </div>
        </form>
        <p className="text-[8px] text-zinc-700 font-bold tracking-widest uppercase">
          Worldwide tracking of infrastructure assets · Searchable from Lagos to London to Dubai
        </p>
      </section>

      {/* Stakeholder pillars */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { role: 'DIASPORA / DEVELOPER', emoji: '🏠', desc: 'Post your project ID. Build from anywhere in the world.', cta: 'Post a Project', href: '/register?role=DEVELOPER' },
            { role: 'INVESTOR',             emoji: '💰', desc: 'Asset-backed infrastructure yield. Funds in escrow until verified.', cta: 'Start Investing', href: '/register?role=INVESTOR' },
            { role: 'CONTRACTOR',           emoji: '🏗', desc: 'Search by trade, bid on NAP project IDs, get paid per milestone.', cta: 'Find Work', href: '/register?role=CONTRACTOR' },
            { role: 'GOVERNMENT / VERIFIER',emoji: '🏛', desc: 'Digital oversight, public tender management, ledger auditing.', cta: 'Gov Portal', href: '/register?role=GOVERNMENT' },
          ].map(item => (
            <div key={item.role}
              className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 hover:bg-zinc-900/30 hover:border-zinc-800 transition-all group flex flex-col">
              <p className="text-3xl mb-4">{item.emoji}</p>
              <p className="text-[10px] font-black tracking-widest uppercase text-white mb-2">{item.role}</p>
              <p className="text-[9px] text-zinc-600 leading-relaxed flex-1">{item.desc}</p>
              <Link href={item.href}
                className="mt-4 flex items-center gap-1 text-[9px] text-teal-500 font-black uppercase tracking-widest hover:text-white transition-colors">
                {item.cta} <ArrowRight size={10} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Live market stats */}
      {summary && (
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="rounded-3xl bg-zinc-900/20 border border-zinc-900 overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-zinc-900">
              {[
                { label: 'Active Builds',    value: summary.active_projects.toLocaleString(),  icon: Activity   },
                { label: 'Capital Deployed', value: `$${(usdTotal / 1_000_000).toFixed(2)}M`,  icon: DollarSign },
                { label: 'Nations Linked',   value: summary.countries_active.toLocaleString(), icon: Globe      },
                { label: 'Operators',        value: summary.total_operators.toLocaleString(),  icon: TrendingUp },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="p-8 text-center">
                    <Icon className="text-teal-500/30 mx-auto mb-3" size={20} />
                    <p className="text-3xl font-black font-mono tracking-tighter">{item.value}</p>
                    <p className="text-zinc-600 text-[8px] uppercase font-black tracking-[0.2em] mt-1">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Live rates strip */}
      {summary?.key_rates && (
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="p-4 rounded-2xl border border-zinc-900 bg-zinc-900/10 flex items-center gap-6 overflow-x-auto">
            <span className="text-[9px] text-zinc-700 uppercase font-bold tracking-widest flex-shrink-0">Live Rates / USD</span>
            {Object.entries(summary.key_rates).map(([code, rate]) => (
              <div key={code} className="flex-shrink-0 text-center">
                <p className="text-[8px] text-zinc-600 uppercase font-bold">{code}</p>
                <p className="font-mono text-sm font-bold text-white">{Number(rate).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              </div>
            ))}
            <span className="text-[8px] text-zinc-800 font-mono flex-shrink-0 ml-auto">Updated hourly · Exchange Rate Oracle</span>
          </div>
        </section>
      )}

      {/* Trust pillars */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'The Digital Twin',
              desc: 'Every project uploads 3D Proposed Finishes and 2D Blueprints before going live. See what you are building before the first stone is laid.',
            },
            {
              title: 'Tri-Layer Verification',
              desc: 'Escrow only releases when Contractor Proof + Independent Verifier + Government Ledger all align. AI + Human + Drone. Unbreakable.',
            },
            {
              title: 'Diaspora Escrow',
              desc: 'Fund specific NAP project IDs via international currency. No fund diversion, no family friction — just impeccable, traceable delivery.',
            },
          ].map((f, i) => (
            <div key={i} className="p-10 rounded-3xl border border-zinc-900 bg-gradient-to-b from-zinc-900/40 to-transparent">
              <CheckCircle2 size={20} className="text-teal-500 mb-6" />
              <h3 className="text-base font-black uppercase tracking-tighter italic mb-4">{f.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA bar */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="p-10 rounded-3xl border border-teal-500/10 bg-gradient-to-r from-teal-500/5 to-transparent text-center space-y-6">
          <h3 className="text-2xl font-black uppercase tracking-tighter italic">Ready to Join the Infrastructure Revolution?</h3>
          <p className="text-zinc-500 text-sm max-w-xl mx-auto">Whether you're building from the Diaspora, investing capital, bidding for contracts, or providing government oversight — there's a command center built for you.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register"
              className="flex items-center gap-2 px-8 py-4 bg-white text-black font-black uppercase text-xs tracking-[0.2em] rounded-xl hover:bg-teal-500 transition-all">
              Apply for Access <ArrowRight size={12} />
            </Link>
            <Link href="/projects"
              className="flex items-center gap-2 px-8 py-4 border border-zinc-700 text-white font-bold uppercase text-xs tracking-widest rounded-xl hover:border-teal-500 transition-all">
              Browse Projects
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-teal-500 rounded-sm rotate-45" />
            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em]">Nested Ark OS</p>
          </div>
          <div className="flex gap-6 text-[9px] text-zinc-600 font-black uppercase tracking-widest">
            <span className="text-teal-500">Lagos</span>
            <span>·</span>
            <span>London</span>
            <span>·</span>
            <span className="text-teal-500">Dubai</span>
          </div>
          <p className="text-[8px] text-zinc-800 font-mono">
            Impressions &amp; Impacts Ltd · 2026 · v4.0
          </p>
        </div>
      </footer>
    </div>
  );
}
