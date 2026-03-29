'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { TrendingUp, Calculator, Loader2 } from 'lucide-react';

// Per-node funding state shape
interface ProjectNode {
  id: string;
  label: string;
  sector: string;
  apy: string;
  totalBudget: number;
  currentFunded: number;
}

const INITIAL_NODES: ProjectNode[] = [
  {
    id: 'node-1024-1',
    label: 'Infrastructure Node #1025',
    sector: 'Bridge Construction — Sector 7G',
    apy: '8.4% APY',
    totalBudget: 500000,
    currentFunded: 312000,
  },
  {
    id: 'node-1024-2',
    label: 'Infrastructure Node #1026',
    sector: 'Bridge Construction — Sector 7G',
    apy: '8.4% APY',
    totalBudget: 750000,
    currentFunded: 189000,
  },
];

export default function InvestmentCorner() {
  const { user } = useAuth();
  const [calc, setCalc] = useState({ amount: 10000, duration: 12 });
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [nodes, setNodes] = useState<ProjectNode[]>(INITIAL_NODES);

  const projectedROI = (calc.amount * 0.12).toFixed(2);

  const handleCommit = async (projectId: string, amount: number) => {
    if (!user) {
      alert('Authentication Required: Please log in to commit capital.');
      return;
    }

    setIsSubmitting(projectId);
    try {
      await api.post('/api/investments/commit', {
        project_id: projectId,
        investor_id: user.id,
        amount,
      });

      // Optimistically update pool funding after a successful commit
      setNodes((prev) =>
        prev.map((n) =>
          n.id === projectId
            ? { ...n, currentFunded: Math.min(n.currentFunded + amount, n.totalBudget) }
            : n
        )
      );

      alert('Capital Committed. Moving to Escrow Protocol.');
    } catch (err) {
      console.error('Node Connection Failed', err);
      alert('Node Connection Failed: Protocol Error.');
    } finally {
      setIsSubmitting(null);
    }
  };

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
              <label className="text-[10px] text-zinc-500 uppercase font-bold">Principal Investment</label>
              <input
                type="range" min="1000" max="100000" step="1000"
                className="w-full h-1 bg-zinc-800 accent-teal-500 my-4"
                value={calc.amount}
                onChange={(e) => setCalc({ ...calc, amount: Number(e.target.value) })}
              />
              <div className="flex justify-between font-mono text-xl mb-8">
                <span>${calc.amount.toLocaleString()}</span>
                <span className="text-teal-500">+12% Est.</span>
              </div>
              <div className="pt-6 border-t border-zinc-800">
                <p className="text-[10px] text-zinc-500 uppercase font-bold">Projected Net Return</p>
                <h4 className="text-3xl font-bold text-teal-500">${projectedROI}</h4>
              </div>
            </div>
          </div>

          {/* Market Listings */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold tracking-tight uppercase italic">Investment Nodes</h2>
              <span className="text-xs text-zinc-500 font-mono">Min. Fund: $1,000.00</span>
            </div>

            {nodes.map((node) => {
              const fillPct = Math.min(
                Math.round((node.currentFunded / node.totalBudget) * 100),
                100
              );
              const isFull = fillPct >= 100;

              return (
                <div
                  key={node.id}
                  className="p-8 rounded-3xl border border-zinc-800 bg-zinc-950 flex flex-col gap-6 group hover:border-zinc-700 transition-colors"
                >
                  {/* Top row: icon + title + yield + button */}
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-16 rounded-2xl bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-teal-500/50 transition-colors">
                        <TrendingUp className="text-teal-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg uppercase tracking-tight">{node.label}</h4>
                        <p className="text-zinc-500 text-xs">{node.sector}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-right">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Target Yield</p>
                        <p className="font-bold text-emerald-500 font-mono">{node.apy}</p>
                      </div>
                      <button
                        disabled={isSubmitting === node.id || isFull}
                        onClick={() => handleCommit(node.id, calc.amount)}
                        className="min-w-[120px] flex justify-center items-center px-6 py-3 rounded-xl bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-teal-500 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isSubmitting === node.id ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : isFull ? (
                          'Funded'
                        ) : (
                          'Commit'
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Pool Liquidity Progress Bar */}
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
                      <span>${node.currentFunded.toLocaleString()} raised</span>
                      <span>${node.totalBudget.toLocaleString()} target</span>
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
