'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { Loader2, Mail, ShieldCheck, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

type Phase = 'form' | 'sent' | 'error';

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('');
  const [busy,    setBusy]    = useState(false);
  const [phase,   setPhase]   = useState<Phase>('form');
  const [errMsg,  setErrMsg]  = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true); setErrMsg('');
    try {
      await api.post('/api/auth/forgot-password', { email: email.toLowerCase().trim() });
      // Always show "sent" — API never reveals if email exists (anti-enumeration)
      setPhase('sent');
    } catch (ex: any) {
      setErrMsg(ex?.response?.data?.error ?? 'Recovery protocol failed. Please try again.');
      setPhase('error');
    } finally { setBusy(false); }
  };

  // ── Sent confirmation ──────────────────────────────────────────────────────
  if (phase === 'sent') return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-[420px] text-center space-y-6">
        <Image src="/nested_ark_icon.png" alt="Nested Ark" width={48} height={48} priority
          className="mx-auto" style={{ width: '48px', height: 'auto' }} />
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 rounded-full bg-teal-500/10 animate-ping" />
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-teal-500/20 border-2 border-teal-500/30">
            <Mail className="text-teal-500" size={32} />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter">Check Your Email</h2>
          <p className="text-teal-500 text-sm mt-1">Recovery link dispatched</p>
        </div>
        <p className="text-zinc-400 text-sm leading-relaxed">
          If <strong className="text-white">{email}</strong> is registered, a reset link has been sent.
          The link expires in <strong className="text-white">15 minutes</strong>.
        </p>
        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-2 text-left text-[10px] text-zinc-400">
          {[
            'Check your inbox and spam folder',
            'Click "Reset Access Key" in the email',
            'Link expires in 15 minutes',
            'Request a new link if it expires',
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 size={10} className="text-teal-500 mt-0.5 flex-shrink-0" /> {s}
            </div>
          ))}
        </div>
        <button
          onClick={() => { setPhase('form'); setEmail(''); }}
          className="w-full py-3 border border-zinc-700 text-zinc-400 font-bold text-xs uppercase tracking-widest rounded-xl hover:border-teal-500 hover:text-teal-500 transition-all"
        >
          Try Another Email
        </button>
        <Link href="/login"
          className="block w-full py-4 bg-white text-black font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-teal-500 transition-all">
          Back to Sign In
        </Link>
        <p className="text-[8px] text-zinc-700 font-mono">
          <ShieldCheck size={9} className="inline text-teal-500/40 mr-1" />
          Impressions &amp; Impacts Ltd · nestedark@gmail.com
        </p>
      </div>
    </div>
  );

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-[420px] space-y-8">

        {/* Logo */}
        <div className="text-center space-y-3">
          <Image src="/nested_ark_icon.png" alt="Nested Ark" width={48} height={48} priority
            className="mx-auto" style={{ width: '48px', height: 'auto' }} />
          <h1 className="text-sm font-black uppercase tracking-[0.2em]">
            Nested Ark <span className="text-teal-500">OS</span>
          </h1>
          <p className="text-[9px] text-zinc-600 uppercase tracking-widest">Recovery Protocol</p>
        </div>

        {/* Header */}
        <div className="border-l-2 border-teal-500 pl-5">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Reset Access Key</h2>
          <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
            Enter your operator email. We'll send a secure reset link valid for 15 minutes.
          </p>
        </div>

        {/* Error */}
        {phase === 'error' && errMsg && (
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-xs font-bold flex items-start gap-2">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" /> {errMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest block mb-2">
              Operator Email Address
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-11 pr-4 py-4 text-white text-sm outline-none focus:border-teal-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy || !email.trim()}
            className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.15em] text-xs rounded-xl hover:bg-teal-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {busy
              ? <><Loader2 className="animate-spin" size={14} /> Dispatching Link…</>
              : <><Mail size={14} /> Request Reset Link</>
            }
          </button>
        </form>

        {/* Security notice */}
        <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 text-[9px] text-zinc-500 leading-relaxed">
          <ShieldCheck size={10} className="inline text-teal-500 mr-1" />
          For security, we never confirm whether an email is registered. The reset link is single-use
          and expires after 15 minutes. After use, it cannot be reused.
        </div>

        <div className="text-center">
          <Link href="/login"
            className="inline-flex items-center gap-2 text-[9px] text-zinc-600 hover:text-teal-500 font-bold uppercase tracking-widest transition-colors">
            <ArrowLeft size={10} /> Return to Sign In
          </Link>
        </div>

        <div className="text-center text-[8px] text-zinc-700 border-t border-zinc-900 pt-4">
          <ShieldCheck size={9} className="inline text-teal-500/40 mr-1" />
          Impressions &amp; Impacts Ltd · nestedark@gmail.com
        </div>
      </div>
    </div>
  );
}
