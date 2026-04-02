'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CurrencySelector from '@/components/CurrencySelector';
import { useLiveProjects, useLiveInvestments } from '@/hooks/useLiveSystem';
import { useCurrency } from '@/hooks/useCurrency';
import api from '@/lib/api';
import { TrendingUp, Calculator, Loader2, RefreshCw, ShieldCheck, CreditCard } from 'lucide-react';

// NGN amounts — backend handles NGN directly, converts to kobo for Paystack
const MIN_NGN = 5000;
const MAX_NGN = 5_000_000;
const STEP_NGN = 5000;
const NGN_TO_USD_APPROX = 1379;

export default function InvestmentCorner() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [amountNgn, setAmountNgn] = useState(50000); // default ₦50,000
  const [submitting, setSubmitting] = useState<string | null>(null);
  const { projects, isLoading: projLoading, mutate } = useLiveProjects();
  const { investments } = useLiveInvestments();
  const { currency, setCurrency, format } = useCurrency();

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  if (authLoading || !user) return (
    <div className="h-screen bg-[#050505] flex items-center justify-center">
      <Loader2 className="animate-spin text-teal-500" size={32} />
    </div>
  );

  const projectedROI = (amountNgn * 0.12);
  const approxUsd = amountNgn / NGN_TO_USD_APPROX;

  const getFunded = (projectId: string) =>
    investments
      .filter((i: any) => i.project_id === projectId && i.status === 'COMMITTED')
      .reduce((s: number, i: any) => s + Number(i.amount), 0);

  const totalCommittedUsd = investments.reduce((s: number, i: any) => s + Number(i.amount), 0);

  /**
   * LIVE PAYSTACK FLOW:
   * 1. Backend initializes transaction → returns authorization_url
   * 2. User is redirected to Paystack secure checkout
   * 3. Paystack calls webhook (on paystackwebhook server) with product:nestedark
   * 4. Webhook routes to Nested Ark handler → credits escrow, creates investment record
   * 5. User lands on /payment-success?ref=NARK-... → page verifies via /api/payments/verify
   */
  const handleFund = async (projectId: string) => {
    if (amountNgn < MIN_NGN) { alert(`Minimum investment is ₦${MIN_NGN.toLocaleString()}`); return; }
    setSubmitting(projectId);
    try {
      const res = await api.post('/api/payments/initialize', {
        amount: amountNgn,  // sent as NGN — backend converts to kobo
        projectId,
        userId: user.id,
      });
      const { data } = res.data;
      if (data?.authorization_url) {
        // Redirect to Paystack PCI-DSS checkout — card data never touches our server
        window.location.href = data.authorization_url;
      } else {
        throw new Error('Payment gateway did not return authorization URL');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error;
      if (msg?.includes('not configured')) {
        alert('Payment gateway not yet configured. Set PAYSTACK_SECRET_KEY in Render environment variables.');
      } else {
        alert(msg ?? 'Payment initialization failed. Please contact nestedark@gmail.com');
      }
      setSubmitting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── ROI Calculator ─────────────────────────── */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-8 rounded-3xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-6">
                <Calculator className="text-teal-500" />
                <h3 className="font-bold uppercase tracking-widest text-sm">ROI Calculator</h3>
              </div>

              <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-[0.2em]">
                Investment Amount (NGN)
              </label>
              <input
                type="range"
                min={MIN_NGN}
                max={MAX_NGN}
                step={STEP_NGN}
                className="w-full h-1 bg-zinc-800 accent-teal-500 my-4 cursor-pointer"
                value={amountNgn}
                onChange={e => setAmountNgn(Number(e.target.value))}
              />
              <div className="flex justify-between font-mono text-xl mb-1">
                <span>₦{amountNgn.toLocaleString()}</span>
                <span className="text-teal-500">+12% Est.</span>
              </div>
              <p className="text-zinc-600 text-[10px] font-mono mb-4">≈ ${approxUsd.toFixed(0)} USD</p>

              <div className="pt-5 border-t border-zinc-800/50">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Projected Net Return</p>
                <h4 className="text-3xl font-bold text-teal-500">₦{projectedROI.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h4>
                <p className="text-zinc-600 text-[10px] mt-2 flex items-center gap-1">
                  <ShieldCheck size={11} className="text-teal-500" /> Capital secured in escrow node
                </p>
              </div>
            </div>

            {/* Investor profile card */}
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 space-y-3">
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Investor Profile</p>
              <p className="text-white font-mono text-sm truncate">{user.email}</p>
              <div className="flex justify-between items-center">
                <p className="text-teal-500 text-[10px] uppercase font-bold tracking-widest">{user.role}</p>
                <CurrencySelector currency={currency} onSelect={setCurrency} compact />
              </div>
              {totalCommittedUsd > 0 && (
                <div className="pt-3 border-t border-zinc-800">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Portfolio Value</p>
                  <p className="font-mono text-lg font-bold text-emerald-400">{format(totalCommittedUsd)}</p>
                </div>
              )}
            </div>

            {/* Paystack badge */}
            <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900/20">
              <CreditCard size={16} className="text-teal-500 flex-shrink-0" />
              <div>
                <p className="text-[9px] text-white font-bold uppercase tracking-widest">Secured by Paystack</p>
                <p className="text-[8px] text-zinc-600">PCI-DSS Compliant · Card / Bank Transfer / USSD</p>
              </div>
            </div>
          </div>

          {/* ── Project Nodes ──────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight uppercase italic">Infrastructure Nodes</h2>
                <p className="text-zinc-500 text-xs mt-1">Direct investment into verified physical works · {projects.length} nodes live</p>
              </div>
              <button onClick={() => mutate()} className="p-2 rounded-lg border border-zinc-800 text-zinc-500 hover:text-teal-500 hover:border-teal-500/50 transition-all">
                <RefreshCw size={14} />
              </button>
            </div>

            {projLoading && <div className="py-20 text-center"><Loader2 className="animate-spin text-teal-500 mx-auto" size={24} /></div>}

            {!projLoading && projects.length === 0 && (
              <div className="py-20 text-center border border-dashed border-zinc-800 rounded-3xl">
                <TrendingUp className="mx-auto text-zinc-700 mb-4" size={32} />
                <p className="text-zinc-600 text-xs uppercase font-bold tracking-widest">No active investment nodes</p>
                <p className="text-zinc-700 text-[10px] mt-2 font-mono">Government sponsors create projects to open nodes.</p>
              </div>
            )}

            {projects.map((project: any) => {
              const fundedUsd = getFunded(project.id);
              const budget = Number(project.budget);
              const fillPct = budget > 0 ? Math.min(Math.round((fundedUsd / budget) * 100), 100) : 0;
              const isFull = fillPct >= 100;

              return (
                <div key={project.id} className="p-8 rounded-3xl border border-zinc-800 bg-zinc-950 flex flex-col gap-5 group hover:border-zinc-700 transition-all shadow-xl">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-5">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-11 w-11 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-teal-500/50 transition-colors flex-shrink-0 mt-0.5">
                        <TrendingUp className="text-teal-500" size={17} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <h4 className="font-bold text-sm uppercase tracking-tight">{project.title}</h4>
                          <span className="text-[8px] px-2 py-0.5 rounded border border-teal-500/30 text-teal-500 uppercase font-bold">LIVE FUNDING</span>
                        </div>
                        <p className="text-zinc-500 text-xs">{project.location}, {project.country} · {project.category}</p>
                        <p className="text-zinc-600 text-[10px] mt-1.5 line-clamp-2">{project.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto flex-shrink-0">
                      <div className="text-right">
                        <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Target</p>
                        <p className="font-bold text-white font-mono text-sm">{format(budget)}</p>
                      </div>
                      <button
                        disabled={!!submitting || isFull}
                        onClick={() => handleFund(project.id)}
                        className="min-w-[130px] flex justify-center items-center px-5 py-3 rounded-xl bg-teal-500 text-black font-black uppercase text-[9px] tracking-widest hover:bg-teal-400 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale gap-1.5"
                      >
                        {submitting === project.id
                          ? <Loader2 className="animate-spin" size={14} />
                          : isFull
                          ? 'Node Full'
                          : <><CreditCard size={12} /> Fund Project</>
                        }
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-zinc-500">Capital Secured</span>
                      <span className="text-teal-500">{fillPct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 transition-all duration-1000 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.4)]"
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
                      <span>{format(fundedUsd)} raised</span>
                      <span>{format(budget)} target</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
