'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import CurrencySelector from '@/components/CurrencySelector';
import { useLiveProjects, useLiveInvestments } from '@/hooks/useLiveSystem';
import { useCurrency } from '@/hooks/useCurrency';
import api from '@/lib/api';
import { TrendingUp, Calculator, Loader2, RefreshCw } from 'lucide-react';

export default function InvestmentCorner() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [amount, setAmount] = useState(10000);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const { projects, isLoading: projLoading, mutate } = useLiveProjects();
  const { investments } = useLiveInvestments();
  const { currency, setCurrency, format, symbol } = useCurrency();

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  if (authLoading || !user) return (
    <div className="h-screen bg-[#050505] flex items-center justify-center">
      <Loader2 className="animate-spin text-teal-500" size={32} />
    </div>
  );

  const projectedROI = (amount * 0.12).toFixed(2);

  const getFunded = (projectId: string) =>
    investments
      .filter((i: any) => i.project_id === projectId && i.status === 'COMMITTED')
      .reduce((s: number, i: any) => s + Number(i.amount), 0);

  const totalCommitted = investments.reduce((s: number, i: any) => s + Number(i.amount), 0);

  const handleCommit = async (projectId: string) => {
    if (amount <= 0) { alert('Amount must be greater than 0'); return; }
    setSubmitting(projectId);
    try {
      const res = await api.post('/api/investments/commit', {
        project_id: projectId,
        investor_id: user.id,
        amount,
      });
      const hash = res.data.ledger_hash?.slice(0, 16);
      alert(`✅ $${amount.toLocaleString()} committed. Capital is in escrow.\nLedger hash: ${hash}...`);
      mutate();
    } catch (err: any) {
      const errData = err?.response?.data;
      if (errData?.remaining !== undefined) {
        alert(`Pool cap reached. Max you can commit: $${errData.remaining.toLocaleString()}`);
      } else {
        alert(errData?.error ?? 'Commitment failed. Please try again.');
      }
    } finally { setSubmitting(null); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: ROI Calculator + User Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-8 rounded-3xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-8">
                <Calculator className="text-teal-500" />
                <h3 className="font-bold uppercase tracking-widest text-sm">ROI Calculator</h3>
              </div>
              <label className="text-[10px] text-zinc-500 uppercase font-bold">Principal Investment (USD)</label>
              <input
                type="range" min="1000" max="100000" step="1000"
                className="w-full h-1 bg-zinc-800 accent-teal-500 my-4"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
              <div className="flex justify-between font-mono text-xl mb-4">
                <span>${amount.toLocaleString()}</span>
                <span className="text-teal-500">+12% Est.</span>
              </div>
              {currency !== 'USD' && (
                <p className="text-zinc-600 text-[10px] font-mono mb-4">≈ {format(amount)} {currency}</p>
              )}
              <div className="pt-6 border-t border-zinc-800">
                <p className="text-[10px] text-zinc-500 uppercase font-bold">Projected Net Return</p>
                <h4 className="text-3xl font-bold text-teal-500">${Number(projectedROI).toLocaleString()}</h4>
                {currency !== 'USD' && (
                  <p className="text-zinc-500 text-xs font-mono mt-1">{format(parseFloat(projectedROI))} {currency}</p>
                )}
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 space-y-3">
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Operator</p>
              <p className="text-white font-mono text-sm truncate">{user.email}</p>
              <p className="text-teal-500 text-[10px] uppercase font-bold">{user.role}</p>
              {totalCommitted > 0 && (
                <div className="pt-3 border-t border-zinc-800">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Your Total Committed</p>
                  <p className="font-mono text-lg font-bold text-emerald-400">${totalCommitted.toLocaleString()}</p>
                  {currency !== 'USD' && <p className="text-zinc-600 text-[9px] font-mono">{format(totalCommitted)}</p>}
                </div>
              )}
              <div className="pt-2">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2">Display Currency</p>
                <CurrencySelector currency={currency} onSelect={setCurrency} compact={false} />
              </div>
            </div>
          </div>

          {/* Right: Live Project Nodes */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight uppercase italic">Investment Nodes</h2>
                <p className="text-zinc-500 text-xs mt-1">Live infrastructure funding pools · {projects.length} active</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500 font-mono">Min. $1,000</span>
                <button onClick={() => mutate()} className="p-2 rounded-lg border border-zinc-800 text-zinc-500 hover:text-teal-500 hover:border-teal-500/50 transition-all">
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            {projLoading && (
              <div className="py-20 text-center"><Loader2 className="animate-spin text-teal-500 mx-auto" size={24} /></div>
            )}

            {!projLoading && projects.length === 0 && (
              <div className="py-20 text-center border border-dashed border-zinc-800 rounded-3xl">
                <TrendingUp className="mx-auto text-zinc-700 mb-4" size={32} />
                <p className="text-zinc-600 text-xs uppercase font-bold tracking-widest">No active investment nodes</p>
                <p className="text-zinc-700 text-[10px] mt-2 font-mono">Nodes appear once Government sponsors create projects.</p>
              </div>
            )}

            {projects.map((project: any) => {
              const funded = getFunded(project.id);
              const budget = Number(project.budget);
              const fillPct = budget > 0 ? Math.min(Math.round((funded / budget) * 100), 100) : 0;
              const isFull = fillPct >= 100;
              const remaining = Math.max(budget - funded, 0);
              const commitAmt = Math.min(amount, remaining);

              return (
                <div key={project.id} className="p-8 rounded-3xl border border-zinc-800 bg-zinc-950 flex flex-col gap-6 group hover:border-zinc-700 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-12 w-12 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-teal-500/50 transition-colors flex-shrink-0 mt-1">
                        <TrendingUp className="text-teal-500" size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-base uppercase tracking-tight">{project.title}</h4>
                          <span className="text-[9px] px-2 py-0.5 rounded border border-teal-500/30 text-teal-500 uppercase font-bold">{project.status}</span>
                        </div>
                        <p className="text-zinc-500 text-xs mt-1">{project.location}, {project.country} · {project.category}</p>
                        <p className="text-zinc-600 text-[10px] mt-2 line-clamp-2">{project.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="text-right">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Target</p>
                        <p className="font-bold text-white font-mono text-sm">{format(budget)}</p>
                        {currency !== 'USD' && <p className="text-zinc-600 text-[9px] font-mono">${budget.toLocaleString()} USD</p>}
                      </div>
                      <button
                        disabled={!!submitting || isFull || commitAmt <= 0}
                        onClick={() => handleCommit(project.id)}
                        className="min-w-[100px] flex justify-center items-center px-5 py-3 rounded-xl bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-teal-500 transition-all active:scale-95 disabled:opacity-40"
                      >
                        {submitting === project.id ? <Loader2 className="animate-spin" size={14} /> : isFull ? 'Funded' : 'Commit'}
                      </button>
                    </div>
                  </div>

                  {/* Pool progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span>Pool Liquidity</span>
                      <span className="text-teal-500">{fillPct}%</span>
                    </div>
                    <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 transition-all duration-1000 rounded-full" style={{ width: `${fillPct}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
                      <span>{format(funded)} raised</span>
                      <span>{format(budget)} target</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
