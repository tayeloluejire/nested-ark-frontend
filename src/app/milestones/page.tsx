'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { CheckCircle2, Clock, ShieldAlert, ArrowUpRight, Lock, Activity, RefreshCw } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  description: string;
  estimated_completion_date: string;
  payout_date: string | null;
  status: string;
  budget_allocation: number;
  progress_percentage: number;
  project_id: string;
}

export default function MilestonesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [releasing, setReleasing] = useState<string | null>(null);

  const fetchMilestones = useCallback(async () => {
    setDataLoading(true);
    try {
      const res = await api.get('/api/milestones');
      setMilestones(res.data.milestones ?? []);
    } catch (err) {
      console.error('Failed to fetch milestones:', err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace('/login'); return; }
    fetchMilestones();
  }, [user, authLoading, router, fetchMilestones]);

  const handleRelease = async (milestone: Milestone) => {
    const ok = confirm(
      `CRITICAL: Authorize release of $${Number(milestone.budget_allocation).toLocaleString()} for "${milestone.title}"?\n\nThis is irreversible and will be logged to the ledger.`
    );
    if (!ok) return;

    setReleasing(milestone.id);
    try {
      await api.post('/api/milestones/approve-and-release', {
        milestone_id: milestone.id,
        actor_role: user?.role,
      });
      alert('Funds released successfully. Contractor reputation updated.');
      fetchMilestones();
    } catch (err: any) {
      alert(err?.response?.data?.error ?? 'Release failed. Please try again.');
    } finally {
      setReleasing(null);
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
      <main className="max-w-7xl mx-auto px-6 py-12">

        <header className="mb-12 border-l-2 border-teal-500 pl-6">
          <div className="flex items-center gap-2 text-teal-500 mb-2">
            <ShieldAlert size={14} />
            <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Secure Terminal // {user?.role}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-black tracking-tighter uppercase italic">Node Payout Schedule</h2>
              <p className="text-zinc-500 text-sm mt-1 max-w-xl">Automated escrow distribution for verified infrastructure providers.</p>
            </div>
            <button onClick={fetchMilestones} className="p-2 rounded-lg border border-zinc-800 text-zinc-500 hover:text-teal-500 hover:border-teal-500/50 transition-all">
              <RefreshCw size={16} />
            </button>
          </div>
        </header>

        {milestones.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-zinc-800 rounded-2xl">
            <p className="text-zinc-600 text-xs uppercase tracking-widest font-bold">No active distribution protocols found.</p>
            <p className="text-zinc-700 text-[10px] mt-2 font-mono">Milestones will appear here once projects are created.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {milestones.map((m) => {
              const amount = Number(m.budget_allocation);
              const isPaid = m.status === 'PAID' || m.status === 'COMPLETED';
              const isVerified = m.status === 'VERIFIED';
              const canRelease = (user?.role === 'ADMIN' || user?.role === 'GOVERNMENT') && isVerified;

              return (
                <div
                  key={m.id}
                  className={`group p-6 rounded-xl border transition-all duration-300 ${
                    isPaid ? 'border-teal-900/30 bg-teal-950/5' : 'border-zinc-800 bg-zinc-900/20 hover:border-zinc-700'
                  } flex flex-col md:flex-row justify-between items-center gap-6`}
                >
                  <div className="flex items-center gap-5 w-full md:w-auto">
                    <div className={`p-3 rounded-lg flex-shrink-0 ${
                      isPaid ? 'bg-teal-500 text-black' :
                      isVerified ? 'bg-amber-500/10 text-amber-500' : 'bg-zinc-800 text-zinc-500'
                    }`}>
                      {isPaid ? <CheckCircle2 size={20} /> : isVerified ? <Activity size={20} /> : <Lock size={20} />}
                    </div>

                    <div>
                      <h3 className="font-bold tracking-tight uppercase">{m.title}</h3>
                      {m.description && <p className="text-zinc-500 text-xs mt-0.5 line-clamp-1">{m.description}</p>}
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-[9px] text-zinc-500 uppercase font-medium tracking-widest">
                          Due: {m.estimated_completion_date ? new Date(m.estimated_completion_date).toLocaleDateString() : 'TBD'}
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded border uppercase font-bold ${
                          isPaid ? 'border-teal-500/50 text-teal-500' :
                          isVerified ? 'border-amber-500/50 text-amber-500' : 'border-zinc-700 text-zinc-500'
                        }`}>
                          {m.status}
                        </span>
                        {m.progress_percentage > 0 && (
                          <span className="text-[9px] text-zinc-600 font-mono">{m.progress_percentage}% complete</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t border-zinc-800 md:border-none pt-4 md:pt-0">
                    <div className="text-right">
                      <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Allocation</p>
                      <p className="font-mono text-xl font-light">
                        <span className="text-zinc-500 text-sm mr-1">$</span>
                        {amount.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center min-w-[140px] justify-end">
                      {canRelease && (
                        <button
                          disabled={releasing === m.id}
                          onClick={() => handleRelease(m)}
                          className="flex items-center gap-2 px-5 py-3 bg-white text-black font-black rounded-sm text-[10px] uppercase tracking-tighter hover:bg-teal-500 transition-all active:scale-95 disabled:opacity-50"
                        >
                          {releasing === m.id ? <Activity className="animate-spin" size={12} /> : (
                            <><ArrowUpRight size={12} /> Release</>
                          )}
                        </button>
                      )}

                      {isPaid && (
                        <div className="flex flex-col items-end">
                          <span className="text-teal-500 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
                            <CheckCircle2 size={12} /> Dispatched
                          </span>
                          {m.payout_date && (
                            <span className="text-[9px] text-zinc-600 font-mono mt-1">
                              {new Date(m.payout_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}

                      {!isPaid && !canRelease && (
                        <span className="text-zinc-600 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest italic">
                          <Clock size={12} /> {m.status === 'PENDING' ? 'Awaiting Verification' : m.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
