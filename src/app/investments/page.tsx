'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { TrendingUp, Calculator, Loader2, Activity, RefreshCw } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  location: string;
  country: string;
  budget: number;
  currency: string;
  category: string;
  status: string;
  progress_percentage: number;
}

interface ProjectWithFunding extends Project {
  currentFunded: number;
}

export default function InvestmentCorner() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [calc, setCalc] = useState({ amount: 10000 });
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectWithFunding[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const projectedROI = (calc.amount * 0.12).toFixed(2);

  const fetchProjects = useCallback(async () => {
    setDataLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/projects');
      const rawProjects: Project[] = res.data.projects ?? [];

      // Fetch investment totals for each project in parallel
      const withFunding = await Promise.all(
        rawProjects.map(async (p) => {
          try {
            const invRes = await api.get('/api/investments');
            const allInvestments: any[] = invRes.data.investments ?? [];
            const currentFunded = allInvestments
              .filter((i: any) => i.project_id === p.id && i.status === 'COMMITTED')
              .reduce((sum: number, i: any) => sum + Number(i.amount), 0);
            return { ...p, currentFunded };
          } catch {
            return { ...p, currentFunded: 0 };
          }
        })
      );

      setProjects(withFunding);
    } catch (err: any) {
      setError('Failed to load investment nodes.');
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace('/login'); return; }
    fetchProjects();
  }, [user, authLoading, router, fetchProjects]);

  const handleCommit = async (projectId: string, amount: number) => {
    if (!user) { router.replace('/login'); return; }
    if (amount <= 0) { alert('Amount must be greater than 0'); return; }

    setIsSubmitting(projectId);
    try {
      await api.post('/api/investments/commit', {
        project_id: projectId,
        investor_id: user.id,
        amount,
      });

      // Optimistically update pool funding
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? { ...p, currentFunded: Math.min(p.currentFunded + amount, p.budget) }
            : p
        )
      );

      alert(`$${amount.toLocaleString()} committed successfully. Capital is now in escrow.`);
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Commitment failed. Please try again.';
      alert(msg);
    } finally {
      setIsSubmitting(null);
    }
  };

  if (authLoading || dataLoading) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center">
        <Activity className="animate-spin text-teal-500" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ROI Calculator */}
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
                value={calc.amount}
                onChange={(e) => setCalc({ amount: Number(e.target.value) })}
              />
              <div className="flex justify-between font-mono text-xl mb-8">
                <span>${calc.amount.toLocaleString()}</span>
                <span className="text-teal-500">+12% Est.</span>
              </div>
              <div className="pt-6 border-t border-zinc-800">
                <p className="text-[10px] text-zinc-500 uppercase font-bold">Projected Net Return</p>
                <h4 className="text-3xl font-bold text-teal-500">${Number(projectedROI).toLocaleString()}</h4>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30">
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-3">Operator</p>
              <p className="text-white font-mono text-sm truncate">{user?.email}</p>
              <p className="text-teal-500 text-[10px] uppercase font-bold mt-1">{user?.role}</p>
            </div>
          </div>

          {/* Live Project Nodes */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight uppercase italic">Investment Nodes</h2>
                <p className="text-zinc-500 text-xs mt-1">Live infrastructure funding pools</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500 font-mono">Min. $1,000</span>
                <button
                  onClick={fetchProjects}
                  className="p-2 rounded-lg border border-zinc-800 text-zinc-500 hover:text-teal-500 hover:border-teal-500/50 transition-all"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            {error && (
              <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 text-center">
                <p className="text-red-400 text-xs uppercase font-bold">{error}</p>
                <button onClick={fetchProjects} className="mt-3 text-teal-500 text-xs underline">Retry</button>
              </div>
            )}

            {!error && projects.length === 0 && (
              <div className="py-20 text-center border border-dashed border-zinc-800 rounded-3xl">
                <TrendingUp className="mx-auto text-zinc-700 mb-4" size={32} />
                <p className="text-zinc-600 text-xs uppercase font-bold tracking-widest">No active investment nodes</p>
                <p className="text-zinc-700 text-[10px] mt-2 font-mono">Projects will appear here once created by sponsors.</p>
              </div>
            )}

            {projects.map((project) => {
              const fillPct = project.budget > 0
                ? Math.min(Math.round((project.currentFunded / project.budget) * 100), 100)
                : 0;
              const isFull = fillPct >= 100;
              const remaining = Math.max(project.budget - project.currentFunded, 0);
              const commitAmount = Math.min(calc.amount, remaining);

              return (
                <div
                  key={project.id}
                  className="p-8 rounded-3xl border border-zinc-800 bg-zinc-950 flex flex-col gap-6 group hover:border-zinc-700 transition-colors"
                >
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

                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className="text-right">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Target</p>
                        <p className="font-bold text-white font-mono text-sm">${(project.budget / 1000).toFixed(0)}k</p>
                      </div>
                      <button
                        disabled={isSubmitting === project.id || isFull || commitAmount <= 0}
                        onClick={() => handleCommit(project.id, commitAmount)}
                        className="min-w-[110px] flex justify-center items-center px-5 py-3 rounded-xl bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-teal-500 transition-all active:scale-95 disabled:opacity-40"
                      >
                        {isSubmitting === project.id ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : isFull ? 'Funded' : 'Commit'}
                      </button>
                    </div>
                  </div>

                  {/* Pool Liquidity */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span>Pool Liquidity</span>
                      <span className="text-teal-500">{fillPct}%</span>
                    </div>
                    <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 transition-all duration-1000 rounded-full"
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
                      <span>${project.currentFunded.toLocaleString()} raised</span>
                      <span>${project.budget.toLocaleString()} target</span>
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
