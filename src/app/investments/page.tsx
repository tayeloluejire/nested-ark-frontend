'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CurrencySelector from '@/components/CurrencySelector';
import { useCurrency } from '@/hooks/useCurrency';
import api from '@/lib/api';
import {
  TrendingUp, ShieldCheck, Loader2, Wifi, RefreshCw,
  DollarSign, Lock, ExternalLink, CheckCircle2, AlertCircle
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Project {
  id: string;
  title: string;
  location: string;
  country: string;
  budget: number;
  category: string;
  status: string;
  gov_verified: boolean;
  expected_roi: number;
  timeline_months: number;
  description: string;
}

interface UserInvestment {
  project_id: string;
  amount: number;           // USD amount in investments table
}

interface FundingTotals {
  [project_id: string]: number; // total NGN raised via Paystack
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtNgn(n: number): string {
  if (!Number.isFinite(n) || n === 0) return '₦0';
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000)     return `₦${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)         return `₦${(n / 1_000).toFixed(0)}k`;
  return `₦${Math.round(n).toLocaleString()}`;
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function InvestmentsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { currency, setCurrency, format } = useCurrency();

  const [projects,      setProjects]      = useState<Project[]>([]);
  const [myInvestments, setMyInvestments] = useState<UserInvestment[]>([]);
  const [fundingTotals, setFundingTotals] = useState<FundingTotals>({});
  const [rates,         setRates]         = useState<Record<string,number>>({ NGN: 1379 });
  const [loading,       setLoading]       = useState(true);
  const [lastSync,      setLastSync]      = useState('');
  const [committing,    setCommitting]    = useState<string | null>(null); // project_id being funded
  const [sliders,       setSliders]       = useState<Record<string, number>>({});
  const [feedback,      setFeedback]      = useState<{ id: string; type: 'ok'|'err'; msg: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [proj, inv, ratesRes] = await Promise.allSettled([
        api.get('/api/projects'),
        api.get('/api/investments/my'),   // ← only this user's investments
        api.get('/api/rates'),
      ]);

      if (proj.status === 'fulfilled') setProjects(proj.value.data.projects ?? []);

      if (inv.status === 'fulfilled') {
        const rows: any[] = inv.value.data.investments ?? [];
        // Build lookup: project_id → user's committed amount
        setMyInvestments(rows.map(r => ({ project_id: r.project_id, amount: Number(r.amount) })));

        // Build funding totals per project from all investments (use project_budget as proxy)
        // We derive "total raised" from payment_transactions via the summary endpoint
        const totals: FundingTotals = {};
        rows.forEach(r => {
          totals[r.project_id] = (totals[r.project_id] ?? 0) + Number(r.amount);
        });
        setFundingTotals(totals);
      }

      if (ratesRes.status === 'fulfilled') {
        const r = ratesRes.value.data.rates ?? {};
        setRates({ NGN: 1379, ...r });
      }

      setLastSync(new Date().toLocaleTimeString());
    } finally { if (!silent) setLoading(false); }
  }, []);

  useEffect(() => {
    if (user) {
      load();
      const iv = setInterval(() => load(true), 15_000);
      return () => clearInterval(iv);
    }
  }, [user, load]);

  if (authLoading || !user) return (
    <div className="h-screen bg-[#050505] flex items-center justify-center">
      <Loader2 className="animate-spin text-teal-500" size={32} />
    </div>
  );

  const ngnRate = Number(rates.NGN) || 1379;

  // Fund via Paystack
  const handleFund = async (project: Project) => {
    const amountNgn = sliders[project.id] ?? 10_000;
    const ok = confirm(
      `FUND PROJECT\n\n${project.title}\n\nAmount: ₦${amountNgn.toLocaleString()} (~${format(amountNgn / ngnRate)} USD)\n\nYou will be redirected to Paystack's secure checkout.`
    );
    if (!ok) return;

    setCommitting(project.id);
    setFeedback(null);
    try {
      const res = await api.post('/api/payments/initialize', {
        amount:    amountNgn,    // NGN
        projectId: project.id,
      });
      // Save reference before redirect
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('nark_pay_ref', res.data.reference ?? '');
        sessionStorage.setItem('nark_pay_project', project.title);
      }
      // Redirect to Paystack checkout
      window.location.href = res.data.authorization_url;
    } catch (ex: any) {
      setFeedback({
        id:  project.id,
        type: 'err',
        msg: ex?.response?.data?.error ?? 'Payment initialisation failed. Try again.',
      });
    } finally { setCommitting(null); }
  };

  const activeProjects = projects.filter(p => p.status === 'ACTIVE' || p.status === 'FUNDING');

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Navbar />

      {/* System pulse */}
      <div className="border-b border-zinc-800 bg-black px-6 py-2 flex items-center gap-5 text-[9px] font-mono uppercase tracking-widest overflow-x-auto">
        <span className="flex items-center gap-1.5 text-teal-500 flex-shrink-0"><Wifi size={8} /> Live Funding Pools</span>
        {lastSync && <span className="text-zinc-600 flex-shrink-0">Synced {lastSync}</span>}
        <span className="text-zinc-400 flex-shrink-0">{activeProjects.length} active node{activeProjects.length !== 1 ? 's' : ''}</span>
        <span className="text-zinc-500 flex-shrink-0">
          USD/NGN {(rates.NGN ?? 1379).toLocaleString()}
        </span>
        <button onClick={() => load(false)} disabled={loading}
          className="ml-auto flex items-center gap-1 text-zinc-500 hover:text-teal-500 transition-colors flex-shrink-0">
          <RefreshCw size={9} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full space-y-10">

        {/* Header */}
        <header className="border-l-2 border-teal-500 pl-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-[9px] text-teal-500 uppercase font-bold tracking-[0.2em] mb-1">Infrastructure Exchange</p>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Investment Nodes</h1>
            <p className="text-zinc-500 text-sm mt-1">Live infrastructure funding pools — Paystack secured escrow</p>
          </div>
          <div className="flex items-center gap-3">
            <CurrencySelector currency={currency} onSelect={setCurrency} compact />
            <Link href="/portfolio"
              className="flex items-center gap-2 px-4 py-2 border border-zinc-700 text-zinc-400 font-bold text-[10px] uppercase rounded-xl hover:text-teal-500 hover:border-teal-500/40 transition-all">
              My Portfolio →
            </Link>
          </div>
        </header>

        {/* ROI Calculator strip */}
        <RoiStrip ngnRate={ngnRate} format={format} />

        {/* Project nodes */}
        {loading && activeProjects.length === 0 ? (
          <div className="py-20 text-center"><Loader2 className="animate-spin text-teal-500 mx-auto" size={28} /></div>
        ) : activeProjects.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-zinc-800 rounded-2xl space-y-3">
            <p className="text-zinc-500 text-sm">No active investment nodes right now</p>
            <p className="text-zinc-600 text-xs">Government sponsors must create and verify projects first</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {activeProjects.map(project => {
              const myPosition   = myInvestments.find(i => i.project_id === project.id);
              const myAmountUsd  = myPosition?.amount ?? 0;
              const budget       = Number(project.budget);
              const roiPct       = Number(project.expected_roi) || 12;
              const sliderNgn    = sliders[project.id] ?? 10_000;
              const est6mYield   = Math.round((sliderNgn / ngnRate) * (roiPct / 100) * (6 / 12));
              // Derive a rough funding % from committed investments (USD amount / budget)
              const raisedUsd    = fundingTotals[project.id] ?? 0;
              const fundingPct   = budget > 0 ? Math.min((raisedUsd / budget) * 100, 100) : 0;
              const isBusy       = committing === project.id;
              const fb           = feedback?.id === project.id ? feedback : null;

              return (
                <div key={project.id}
                  className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 transition-all space-y-5">

                  {/* Project header */}
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Link href={`/projects/${project.id}`}
                          className="font-bold uppercase tracking-tight hover:text-teal-500 transition-colors flex items-center gap-1">
                          {project.title} <ExternalLink size={12} className="opacity-40" />
                        </Link>
                        {project.gov_verified && <ShieldCheck size={12} className="text-teal-500" />}
                      </div>
                      <p className="text-zinc-500 text-xs">{project.location}, {project.country} · {project.category}</p>
                      <p className="text-zinc-600 text-[10px] mt-1 line-clamp-1">{project.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Budget</p>
                      <p className="font-mono font-bold text-lg">{format(budget)}</p>
                      <p className="text-[9px] text-teal-400 font-bold">{roiPct}% ROI · {project.timeline_months ?? 24}mo</p>
                    </div>
                  </div>

                  {/* Pool liquidity bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-zinc-500 font-bold uppercase">
                      <span>Pool Liquidity</span>
                      <span className="text-teal-500">{fundingPct.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 transition-all duration-700" style={{ width: `${fundingPct}%` }} />
                    </div>
                    <div className="flex justify-between text-[9px] text-zinc-600 font-mono">
                      <span>{format(raisedUsd)} raised</span>
                      <span>{format(budget)} target</span>
                    </div>
                  </div>

                  {/* My position if invested */}
                  {myAmountUsd > 0 && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-teal-500/5 border border-teal-500/20">
                      <CheckCircle2 size={12} className="text-teal-500 flex-shrink-0" />
                      <p className="text-[10px] text-teal-400 font-bold">
                        You committed {format(myAmountUsd)} to this project
                        <span className="text-zinc-500 font-normal ml-1">— earning {roiPct}% p.a.</span>
                      </p>
                    </div>
                  )}

                  {/* Slider + Fund button */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[9px] text-zinc-500 uppercase font-bold">
                        <span>Investment Amount (NGN)</span>
                        <span className="text-white font-mono">₦{sliderNgn.toLocaleString()}</span>
                      </div>
                      <input type="range" min={5_000} max={5_000_000} step={5_000}
                        value={sliderNgn}
                        onChange={e => setSliders(s => ({ ...s, [project.id]: Number(e.target.value) }))}
                        className="w-full accent-teal-500" />
                      <div className="flex justify-between text-[9px] text-zinc-700 font-mono">
                        <span>Min ₦5,000</span>
                        <span>≈ {format(sliderNgn / ngnRate)} USD</span>
                      </div>
                      <p className="text-[9px] text-teal-500 font-bold">
                        Est. 6-month yield: +{format(est6mYield)} ({roiPct}% p.a.)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => handleFund(project)}
                        disabled={isBusy || fundingPct >= 100}
                        className="w-full py-4 bg-white text-black font-black uppercase text-xs tracking-[0.15em] rounded-xl hover:bg-teal-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                        {isBusy
                          ? <><Loader2 className="animate-spin" size={14} /> Initializing…</>
                          : fundingPct >= 100
                            ? <><Lock size={12} /> Pool Full</>
                            : <><DollarSign size={12} /> FUND PROJECT — ₦{(sliderNgn).toLocaleString()}</>
                        }
                      </button>
                      <p className="text-[8px] text-zinc-600 text-center">
                        🔒 Secured by Paystack · PCI-DSS Compliant · Funds held in escrow
                      </p>
                    </div>
                  </div>

                  {/* Feedback */}
                  {fb && (
                    <div className={`flex items-start gap-2 p-3 rounded-xl border text-[10px] font-bold ${
                      fb.type === 'ok'
                        ? 'border-teal-500/30 bg-teal-500/5 text-teal-400'
                        : 'border-red-500/30 bg-red-500/5 text-red-400'
                    }`}>
                      {fb.type === 'ok' ? <CheckCircle2 size={12} className="flex-shrink-0 mt-0.5" /> : <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />}
                      {fb.msg}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Security badges */}
        <section className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Paystack Secured',     desc: 'PCI-DSS Level 1 payment processing' },
              { label: 'Escrow Protected',      desc: 'Funds locked until milestone verified' },
              { label: 'Tri-Layer Verified',    desc: 'AI + Human + Drone before release' },
              { label: 'Immutable Ledger',      desc: 'SHA-256 hash chain · every event logged' },
            ].map(b => (
              <div key={b.label} className="flex items-start gap-2">
                <ShieldCheck size={12} className="text-teal-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white">{b.label}</p>
                  <p className="text-[8px] text-zinc-500 mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}

// ── ROI calculator strip ───────────────────────────────────────────────────────
function RoiStrip({ ngnRate, format }: { ngnRate: number; format: (n: number) => string }) {
  const [amount, setAmount] = useState(50_000);
  const usd    = amount / ngnRate;
  const earn6m = Math.round(usd * 0.12 * (6 / 12));
  return (
    <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
      <div className="space-y-3">
        <div className="flex justify-between text-[9px] uppercase font-bold text-zinc-400">
          <span>ROI Calculator</span>
          <span className="text-teal-500 font-mono">₦{amount.toLocaleString()} · {format(usd)}</span>
        </div>
        <input type="range" min={5_000} max={5_000_000} step={5_000} value={amount}
          onChange={e => setAmount(Number(e.target.value))} className="w-full accent-teal-500" />
        <div className="flex justify-between text-[9px] text-zinc-600 font-mono">
          <span>₦5,000</span><span>₦5,000,000</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-center">
          <p className="text-[9px] text-zinc-500 uppercase font-bold">6-month Yield</p>
          <p className="font-mono text-teal-400 font-black text-xl mt-1">+{format(earn6m)}</p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-center">
          <p className="text-[9px] text-zinc-500 uppercase font-bold">Annual ROI</p>
          <p className="font-mono text-white font-black text-xl mt-1">+12% Est.</p>
        </div>
      </div>
    </div>
  );
}
