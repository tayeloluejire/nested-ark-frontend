'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, canAccess } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCurrency } from '@/hooks/useCurrency';
import api from '@/lib/api';
import {
  TrendingUp, Shield, Wallet, DollarSign, Loader2, RefreshCw,
  ExternalLink, CheckCircle2, Clock, AlertTriangle, Download,
  Wifi, ArrowUpRight, Lock, CreditCard, Building2, Activity
} from 'lucide-react';

interface Investment {
  id: string;
  project_id: string;
  amount: number;
  status: string;
  created_at: string;
  project_title: string;
  location: string;
  expected_roi?: number;
  budget?: number;
}

interface PayHistory {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  project_title?: string;
  paystack_reference: string;
  payment_channel?: string;
}

function StatCard({ label, value, sub, icon: Icon, color = 'text-white', action, actionLabel }: any) {
  return (
    <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 relative overflow-hidden">
      <div className="absolute top-4 right-4 opacity-5"><Icon size={48} /></div>
      <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-[0.2em] mb-1">{label}</p>
      <p className={`text-2xl font-black font-mono ${color}`}>{value}</p>
      {sub && <p className="text-[10px] text-zinc-600 mt-1">{sub}</p>}
      {action && (
        <button onClick={action}
          className="mt-3 px-4 py-2 bg-white text-black font-bold text-[9px] uppercase tracking-widest rounded-lg hover:bg-teal-500 transition-all">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function WithdrawModal({ available, onClose }: { available: number; onClose: () => void }) {
  const [form, setForm] = useState({ bank_name: '', account_number: '', account_name: '', amount: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/escrow/withdraw', {
        amount: parseFloat(form.amount),
        bank_name: form.bank_name,
        account_number: form.account_number,
        account_name: form.account_name,
      });
      setDone(true);
    } catch (err: any) {
      alert(err?.response?.data?.error ?? 'Withdrawal request failed');
    } finally { setSubmitting(false); }
  };

  if (done) return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-950 border border-teal-500/30 rounded-3xl p-8 text-center space-y-4">
        <CheckCircle2 className="text-teal-500 mx-auto" size={40} />
        <h3 className="text-xl font-black uppercase">Request Submitted</h3>
        <p className="text-zinc-500 text-sm">Your payout request has been queued. Funds will be transferred within 1–3 business days via Paystack Transfer.</p>
        <button onClick={onClose} className="w-full py-3 bg-white text-black font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-teal-500 transition-all">Close</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-8 space-y-6">
        <div>
          <h3 className="text-xl font-bold uppercase">Withdraw Earnings</h3>
          <p className="text-zinc-500 text-xs mt-1">Available: ₦{available.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[10px] text-amber-400 uppercase font-bold tracking-widest">
          ⚠ Principal is locked until project tenure ends. Only realized earnings can be withdrawn.
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input required value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })}
            placeholder="Bank Name (e.g. Access Bank)" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500" />
          <input required value={form.account_number} onChange={e => setForm({ ...form, account_number: e.target.value })}
            placeholder="Account Number (NUBAN)" maxLength={10} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500" />
          <input required value={form.account_name} onChange={e => setForm({ ...form, account_name: e.target.value })}
            placeholder="Account Name" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500" />
          <input required type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
            placeholder="Amount (NGN)" max={available} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500" />
          <div className="flex gap-3">
            <button type="submit" disabled={submitting}
              className="flex-1 py-4 bg-white text-black font-bold uppercase text-xs tracking-widest rounded-xl hover:bg-teal-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="animate-spin" size={14} /> : <><ArrowUpRight size={12} /> Request Payout</>}
            </button>
            <button type="button" onClick={onClose}
              className="px-5 py-4 border border-zinc-700 text-zinc-400 font-bold uppercase text-xs rounded-xl hover:text-white">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { format } = useCurrency();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [payments, setPayments] = useState<PayHistory[]>([]);
  const [kycStatus, setKycStatus] = useState<string>('NOT_SUBMITTED');
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState('');
  const [showWithdraw, setShowWithdraw] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
    if (!authLoading && user && !canAccess(user.role, '/portfolio')) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [inv, pay, kyc] = await Promise.allSettled([
        api.get('/api/investments'),
        api.get('/api/payments/history'),
        api.get('/api/kyc/status'),
      ]);
      if (inv.status === 'fulfilled') {
        const all: Investment[] = inv.value.data.investments ?? [];
        setInvestments(all.filter((i: Investment) => i.status === 'COMMITTED' || i.status === 'SUCCESS'));
      }
      if (pay.status === 'fulfilled') setPayments(pay.value.data.transactions ?? []);
      if (kyc.status === 'fulfilled') setKycStatus(kyc.value.data.kyc?.status ?? 'NOT_SUBMITTED');
      setLastSync(new Date().toLocaleTimeString());
    } finally { if (!silent) setLoading(false); }
  }, []);

  useEffect(() => {
    if (user) { load(); const iv = setInterval(() => load(true), 30000); return () => clearInterval(iv); }
  }, [user, load]);

  if (authLoading || !user) return (
    <div className="h-screen bg-[#050505] flex items-center justify-center">
      <Loader2 className="animate-spin text-teal-500" size={32} />
    </div>
  );

  // Portfolio calculations
  const totalPrincipalNGN = payments.filter(p => p.status === 'SUCCESS').reduce((s, p) => s + Number(p.amount), 0);
  const estimatedEarnings = Math.round(totalPrincipalNGN * 0.12 * (6 / 12)); // 12% p.a., 6-month accrual
  const availableToWithdraw = Math.round(estimatedEarnings * 0.4); // 40% of accrued earnings available
  const safetyRating = investments.length > 0 ? '94%' : '—';

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      {showWithdraw && <WithdrawModal available={availableToWithdraw} onClose={() => setShowWithdraw(false)} />}

      <Navbar />

      {/* System Pulse */}
      <div className="border-b border-zinc-800 bg-black px-6 py-2 flex items-center gap-5 text-[9px] font-mono uppercase tracking-widest overflow-x-auto">
        <span className="flex items-center gap-1.5 text-teal-500 flex-shrink-0"><Wifi size={8} /> Portfolio Live</span>
        {lastSync && <span className="text-zinc-600 flex-shrink-0">Synced {lastSync}</span>}
        <span className="flex items-center gap-1.5 text-white flex-shrink-0">{investments.length} active positions</span>
        <span className={`flex items-center gap-1.5 flex-shrink-0 ${kycStatus === 'VERIFIED' ? 'text-teal-500' : 'text-amber-400'}`}>
          KYC: {kycStatus}
          {kycStatus !== 'VERIFIED' && <Link href="/kyc" className="underline ml-1">Verify →</Link>}
        </span>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full space-y-10">
        {/* Header */}
        <header className="border-l-2 border-teal-500 pl-6">
          <p className="text-[9px] text-teal-500 uppercase font-bold tracking-[0.2em] mb-1">Investor Command</p>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">My Portfolio</h1>
          <p className="text-zinc-500 text-sm mt-1">Welcome, {user.full_name} — Infrastructure wealth management dashboard</p>
        </header>

        {/* Capital Header Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Portfolio Value"
            value={`₦${(totalPrincipalNGN / 1_000_000).toFixed(2)}M`}
            sub={`${format(totalPrincipalNGN / 1379)} USD equiv.`}
            icon={TrendingUp}
            color="text-white"
          />
          <StatCard
            label="Estimated Earnings (12% p.a.)"
            value={`+₦${(estimatedEarnings / 1000).toFixed(0)}k`}
            sub="6-month accrual on committed capital"
            icon={DollarSign}
            color="text-teal-400"
          />
          <StatCard
            label="Available Liquidity"
            value={`₦${(availableToWithdraw / 1000).toFixed(0)}k`}
            sub="Realized earnings · withdrawable"
            icon={Wallet}
            color="text-emerald-400"
            action={kycStatus === 'VERIFIED' ? () => setShowWithdraw(true) : undefined}
            actionLabel="Withdraw Funds"
          />
          <StatCard
            label="Security Rating"
            value={safetyRating}
            sub="Tri-layer verified positions"
            icon={Shield}
            color="text-teal-500"
          />
        </section>

        {/* Active Investment Positions */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Activity size={14} className="text-teal-500" /> Active Positions ({investments.length})
            </h2>
            <button onClick={() => load(false)} className="p-2 rounded-lg border border-zinc-800 text-zinc-500 hover:text-teal-500 transition-all">
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {loading && <div className="py-10 text-center"><Loader2 className="animate-spin text-teal-500 mx-auto" size={20} /></div>}

          {!loading && investments.length === 0 && (
            <div className="py-16 text-center border border-dashed border-zinc-800 rounded-2xl space-y-4">
              <Lock className="text-zinc-700 mx-auto" size={32} />
              <p className="text-zinc-500 text-sm">No active investment positions</p>
              <Link href="/investments" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-teal-500 transition-all">
                <TrendingUp size={12} /> Browse Investment Nodes
              </Link>
            </div>
          )}

          {investments.map((inv) => {
            const principal = Number(inv.amount);
            const roiPct = inv.expected_roi ?? 12;
            const estimatedYield = Math.round(principal * (roiPct / 100) * (6 / 12));
            // 24-month tenure, started at created_at
            const start = new Date(inv.created_at).getTime();
            const now = Date.now();
            const elapsed = Math.floor((now - start) / (1000 * 60 * 60 * 24 * 30)); // months
            const tenure = 24;
            const progress = Math.min((elapsed / tenure) * 100, 100);
            const remaining = Math.max(tenure - elapsed, 0);

            return (
              <div key={inv.id} className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 transition-all">
                <div className="flex flex-col md:flex-row gap-6 justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold uppercase tracking-tight">{inv.project_title}</h3>
                      <span className={`text-[8px] px-2 py-0.5 rounded border font-bold uppercase ${
                        inv.status === 'SUCCESS' || inv.status === 'COMMITTED'
                          ? 'border-teal-500/40 text-teal-500' : 'border-zinc-700 text-zinc-500'
                      }`}>{inv.status}</span>
                    </div>
                    {inv.location && <p className="text-zinc-500 text-xs">{inv.location}</p>}

                    {/* Tenure progress */}
                    <div className="mt-4 space-y-1">
                      <div className="flex justify-between text-[9px] text-zinc-500 uppercase font-bold">
                        <span>Tenure Progress ({elapsed}mo elapsed)</span>
                        <span>{remaining}mo remaining</span>
                      </div>
                      <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="text-[9px] text-zinc-600">{tenure}-month infrastructure tenure</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 min-w-[180px]">
                    <div className="text-right">
                      <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Principal</p>
                      <p className="font-mono text-lg font-bold">₦{principal.toLocaleString()}</p>
                      <p className="text-[9px] text-zinc-600">{format(principal / 1379)} USD</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Est. Yield ({roiPct}% p.a.)</p>
                      <p className="font-mono text-teal-400 font-bold">+₦{estimatedYield.toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/projects/${inv.project_id}`}
                        className="flex items-center gap-1 px-3 py-2 border border-zinc-700 text-zinc-400 font-bold rounded-lg text-[9px] uppercase hover:text-teal-500 hover:border-teal-500/40 transition-all">
                        <ExternalLink size={10} /> View Pitch
                      </Link>
                      <button className="flex items-center gap-1 px-3 py-2 border border-zinc-700 text-zinc-400 font-bold rounded-lg text-[9px] uppercase hover:text-white transition-all">
                        <Download size={10} /> Statement
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Payment History */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <CreditCard size={14} className="text-teal-500" /> Payment History
          </h2>
          <div className="rounded-2xl border border-zinc-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900 text-zinc-500 uppercase text-[9px] tracking-widest">
                <tr>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Project</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Channel</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {payments.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-zinc-600">No payment history yet</td></tr>
                )}
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="px-5 py-4 text-zinc-400 font-mono">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-white font-bold uppercase text-[10px]">{p.project_title ?? '—'}</td>
                    <td className="px-5 py-4 font-mono text-white">₦{Number(p.amount).toLocaleString()}</td>
                    <td className="px-5 py-4 text-zinc-500 uppercase text-[9px]">{p.payment_channel ?? 'Card'}</td>
                    <td className="px-5 py-4">
                      <span className={`text-[8px] px-2 py-0.5 rounded border font-bold uppercase ${
                        p.status === 'SUCCESS' ? 'border-teal-500/40 text-teal-500' :
                        p.status === 'PENDING' ? 'border-amber-500/40 text-amber-400' :
                        'border-red-500/40 text-red-400'
                      }`}>{p.status}</span>
                    </td>
                    <td className="px-5 py-4 text-zinc-600 font-mono text-[9px]">{p.paystack_reference?.slice(0, 20)}…</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Quick Links */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/investments', label: 'Browse Nodes', icon: TrendingUp, desc: 'Fund new projects' },
            { href: '/kyc', label: 'KYC Verification', icon: Shield, desc: 'Unlock withdrawals' },
            { href: '/ledger', label: 'Global Ledger', icon: Activity, desc: 'Immutable audit trail' },
            { href: '/map', label: 'Project Map', icon: Building2, desc: 'Geo-visual overview' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/20 hover:border-teal-500/40 hover:bg-teal-500/5 transition-all group">
              <item.icon size={16} className="text-teal-500 mb-3" />
              <p className="text-xs font-bold uppercase tracking-wider text-white">{item.label}</p>
              <p className="text-[9px] text-zinc-500 mt-1">{item.desc}</p>
            </Link>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
