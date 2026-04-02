'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { CheckCircle2, Loader2, AlertCircle, ShieldCheck, Database, ArrowRight } from 'lucide-react';

function PaymentSuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const reference = params.get('ref') || params.get('reference') || params.get('trxref');
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed' | 'no-ref'>('verifying');
  const [txData, setTxData] = useState<any>(null);

  useEffect(() => {
    if (!reference) { setStatus('no-ref'); return; }

    const verify = async () => {
      try {
        const res = await api.get(`/api/payments/verify/${reference}`);
        const d = res.data;
        if (d.status === 'success' || d.status === 'SUCCESS') {
          setStatus('success'); setTxData(d);
        } else {
          setStatus('failed'); setTxData(d);
        }
      } catch {
        setStatus('failed');
      }
    };

    verify();
    // Also poll once after 3s in case webhook needs more time
    const t = setTimeout(verify, 3000);
    return () => clearTimeout(t);
  }, [reference]);

  if (status === 'verifying') return (
    <div className="text-center space-y-4">
      <Loader2 className="animate-spin text-teal-500 mx-auto" size={40} />
      <p className="text-zinc-400 text-sm uppercase font-bold tracking-widest">Verifying transaction with Paystack...</p>
      <p className="text-zinc-600 text-[10px] font-mono">{reference}</p>
    </div>
  );

  if (status === 'success') return (
    <div className="text-center space-y-6">
      <div className="relative mx-auto w-20 h-20">
        <div className="absolute inset-0 rounded-full bg-teal-500/10 animate-ping" />
        <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-teal-500/20 border border-teal-500/30">
          <CheckCircle2 className="text-teal-500" size={36} />
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-white">Investment Confirmed</h2>
        <p className="text-teal-500 text-sm mt-1">Capital is now secured in escrow</p>
      </div>
      {txData && (
        <div className="space-y-3 text-left">
          {[
            { label: 'Amount', value: txData.amount_ngn ? `₦${Number(txData.amount_ngn).toLocaleString()}` : '—' },
            { label: 'Reference', value: reference?.slice(0, 24) + '...' },
            { label: 'Channel', value: txData.channel || 'Card' },
            { label: 'Status', value: 'COMMITTED TO ESCROW', highlight: true },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/20">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{row.label}</span>
              <span className={`font-mono text-sm ${row.highlight ? 'text-teal-500 font-bold' : 'text-white'}`}>{row.value}</span>
            </div>
          ))}
        </div>
      )}
      <div className="p-4 rounded-xl border border-teal-500/20 bg-teal-500/5 flex items-start gap-3 text-left">
        <ShieldCheck className="text-teal-500 flex-shrink-0 mt-0.5" size={16} />
        <div>
          <p className="text-teal-400 text-xs font-bold uppercase tracking-widest">Tri-Layer Security Active</p>
          <p className="text-zinc-500 text-xs mt-1">Your capital is locked in the Nested Ark escrow. Funds release automatically when AI + Human + Drone verification passes for each milestone.</p>
        </div>
      </div>
      <div className="flex gap-3">
        <Link href="/investments" className="flex-1 py-3 bg-white text-black font-bold rounded-xl text-xs uppercase tracking-widest text-center hover:bg-teal-500 transition-all flex items-center justify-center gap-2">
          <ArrowRight size={14} /> View Portfolio
        </Link>
        <Link href="/ledger" className="flex items-center gap-1.5 px-4 py-3 border border-zinc-800 text-zinc-400 hover:text-teal-500 font-bold rounded-xl text-xs uppercase tracking-widest transition-all">
          <Database size={13} /> Ledger
        </Link>
      </div>
    </div>
  );

  if (status === 'failed') return (
    <div className="text-center space-y-5">
      <AlertCircle className="text-red-400 mx-auto" size={40} />
      <div>
        <h2 className="text-xl font-black uppercase text-white">Payment Incomplete</h2>
        <p className="text-zinc-500 text-sm mt-1">The transaction was not completed or is still processing.</p>
      </div>
      <p className="text-[10px] text-zinc-600 font-mono">{reference}</p>
      <div className="flex gap-3">
        <Link href="/investments" className="flex-1 py-3 bg-white text-black font-bold rounded-xl text-xs uppercase tracking-widest text-center hover:bg-teal-500 transition-all">Try Again</Link>
        <a href="mailto:nestedark@gmail.com" className="flex-1 py-3 border border-zinc-800 text-zinc-400 font-bold rounded-xl text-xs uppercase tracking-widest text-center hover:text-white transition-all">Contact Support</a>
      </div>
    </div>
  );

  return (
    <div className="text-center space-y-4">
      <AlertCircle className="text-amber-400 mx-auto" size={40} />
      <p className="text-zinc-400 text-sm">No transaction reference found.</p>
      <Link href="/investments" className="block py-3 bg-white text-black font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-teal-500 transition-all">Back to Investments</Link>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <div className="w-full max-w-[420px] space-y-8">
        <div className="text-center">
          <Image src="/nested_ark_icon.png" alt="Logo" width={48} height={48} priority className="mx-auto mb-4" style={{ width: '48px', height: 'auto' }} />
          <p className="text-[9px] text-zinc-700 uppercase tracking-widest font-mono">Nested Ark Infrastructure OS</p>
        </div>
        <Suspense fallback={<div className="text-center"><Loader2 className="animate-spin text-teal-500 mx-auto" size={28} /></div>}>
          <PaymentSuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
