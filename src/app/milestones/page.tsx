'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  ArrowUpRight, 
  Lock, 
  Activity 
} from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  due_date: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'LOCKED';
  amount: number;
}

export default function MilestonesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const fetchMilestones = useCallback(async () => {
    try {
      const res = await api.get('/api/milestones');
      setMilestones(res.data.milestones || []);
    } catch (error) {
      console.error("Failed to fetch node schedule:", error);
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchMilestones();
    }
  }, [user, authLoading, router, fetchMilestones]);

  const handleRelease = async (mId: string, amount: number) => {
    const confirmation = confirm(
      `CRITICAL ACTION: Authorize release of $${amount.toLocaleString()}? \nThis transaction is irreversible and will be logged to the chain.`
    );
    
    if (confirmation) {
      try {
        await api.post('/api/escrow/release', { milestone_id: mId, amount });
        await fetchMilestones(); // Refresh UI state
      } catch (error) {
        alert("Authorization Failed: Protocol Error.");
      }
    }
  };

  if (authLoading || isDataLoading) {
    return <div className="h-screen bg-[#050505] flex items-center justify-center">
      <Activity className="animate-spin text-teal-500" size={32} />
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-teal-500/30">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12 border-l-2 border-teal-500 pl-6">
          <div className="flex items-center gap-2 text-teal-500 mb-2">
            <ShieldAlert size={14} />
            <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Secure Terminal // Operator Access</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter uppercase italic">Node Payout Schedule</h2>
          <p className="text-zinc-500 text-sm mt-1 max-w-xl">
            Automated escrow distribution for verified infrastructure providers. 
            All payouts are subject to network consensus.
          </p>
        </header>

        <div className="grid gap-3">
          {milestones.length > 0 ? (
            milestones.map((m) => (
              <div 
                key={m.id} 
                className={`group p-6 rounded-xl border transition-all duration-300 ${
                  m.status === 'PAID' 
                    ? 'border-teal-900/30 bg-teal-950/5' 
                    : 'border-zinc-800 bg-zinc-900/20 hover:border-zinc-700'
                } flex flex-col md:flex-row justify-between items-center gap-6`}
              >
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className={`p-4 rounded-lg transition-colors ${
                    m.status === 'PAID' ? 'bg-teal-500 text-black' : 
                    m.status === 'APPROVED' ? 'bg-amber-500/10 text-amber-500' : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {m.status === 'PAID' ? <CheckCircle2 size={24} /> : 
                     m.status === 'APPROVED' ? <Activity size={24} /> : <Lock size={24} />}
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-lg tracking-tight uppercase">{m.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-zinc-500 uppercase font-medium tracking-widest">
                        EST. DISPATCH: {new Date(m.due_date).toLocaleDateString()}
                      </span>
                      <span className={`text-[9px] px-2 py-0.5 rounded border ${
                        m.status === 'PAID' ? 'border-teal-500/50 text-teal-500' : 'border-zinc-700 text-zinc-500'
                      }`}>
                        {m.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-10 w-full md:w-auto justify-between border-t border-zinc-800 md:border-none pt-4 md:pt-0">
                  <div className="text-right">
                    <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Asset Allocation</p>
                    <p className="font-mono text-2xl font-light">
                      <span className="text-zinc-500 text-sm mr-1">$</span>
                      {Number(m.amount).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center min-w-[140px] justify-end">
                    {user?.role === 'ADMIN' && m.status === 'APPROVED' && (
                      <button 
                        onClick={() => handleRelease(m.id, m.amount)}
                        className="group/btn flex items-center gap-2 px-6 py-3 bg-white text-black font-black rounded-sm text-[10px] uppercase tracking-tighter hover:bg-teal-500 transition-all active:scale-95"
                      >
                        Release Funds <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      </button>
                    )}
                    
                    {m.status === 'PAID' && (
                      <div className="flex flex-col items-end">
                        <span className="text-teal-500 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                          <CheckCircle2 size={12} /> Dispatched
                        </span>
                        <span className="text-[9px] text-zinc-600 font-mono mt-1">TX_LOG_SUCCESS</span>
                      </div>
                    )}

                    {m.status === 'PENDING' && (
                      <span className="text-zinc-600 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest italic">
                        <Clock size={12} /> Awaiting Verification
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center border border-dashed border-zinc-800 rounded-2xl">
              <p className="text-zinc-600 font-mono text-sm uppercase tracking-widest text-[10px]">No active distribution protocols found.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}