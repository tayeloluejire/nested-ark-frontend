'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { CheckCircle2, Loader2, AlertCircle, Mail, RefreshCw } from 'lucide-react';

function VerifyContent() {
  const params = useSearchParams();
  const token = params.get('token');
  const [phase, setPhase] = useState<'verifying'|'success'|'failed'|'no-token'>('verifying');
  const [resendEmail, setResendEmail] = useState('');
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) { setPhase('no-token'); return; }
    api.get(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(() => setPhase('success'))
      .catch(() => setPhase('failed'));
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResending(true);
    try {
      await api.post('/api/auth/resend-verification', { email: resendEmail });
      setResent(true);
    } catch { setResent(true); } // show success either way (anti-enumeration)
    finally { setResending(false); }
  };

  if (phase === 'verifying') return (
    <div className="text-center space-y-4">
      <Loader2 className="animate-spin text-teal-500 mx-auto" size={40}/>
      <p className="text-white font-bold uppercase tracking-widest text-sm">Verifying your email…</p>
    </div>
  );

  if (phase === 'success') return (
    <div className="text-center space-y-6">
      <div className="relative mx-auto w-20 h-20">
        <div className="absolute inset-0 rounded-full bg-teal-500/10 animate-ping"/>
        <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-teal-500/20 border-2 border-teal-500/40">
          <CheckCircle2 className="text-teal-500" size={36}/>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-black uppercase tracking-tight">Email Verified</h2>
        <p className="text-teal-500 text-sm mt-1">Your operator account is now active.</p>
      </div>
      <Link href="/login" className="block w-full py-4 bg-white text-black font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-teal-500 transition-all text-center">
        Sign In to Your Portal
      </Link>
    </div>
  );

  if (phase === 'failed' || phase === 'no-token') return (
    <div className="text-center space-y-6">
      <AlertCircle className="text-red-400 mx-auto" size={40}/>
      <div>
        <h2 className="text-xl font-black uppercase">Verification Failed</h2>
        <p className="text-zinc-500 text-sm mt-1">Token expired or invalid. Request a new link below.</p>
      </div>
      {!resent ? (
        <form onSubmit={handleResend} className="space-y-3">
          <input required type="email" placeholder="Your email address" value={resendEmail}
            onChange={e => setResendEmail(e.target.value)}
            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-500 transition-colors"/>
          <button type="submit" disabled={resending} className="w-full py-3 bg-teal-500 text-black font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-teal-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {resending ? <Loader2 className="animate-spin" size={14}/> : <><RefreshCw size={13}/> Resend Verification</>}
          </button>
        </form>
      ) : (
        <div className="p-4 rounded-xl border border-teal-500/20 bg-teal-500/5">
          <p className="text-teal-400 text-sm font-bold">Check your inbox — verification link sent.</p>
        </div>
      )}
      <Link href="/login" className="block text-zinc-500 hover:text-white text-xs uppercase font-bold tracking-widest transition-colors">← Back to Login</Link>
    </div>
  );

  return null;
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="text-center">
          <Image src="/nested_ark_icon.png" alt="Logo" width={48} height={48} priority className="mx-auto mb-4" style={{width:'48px',height:'auto'}}/>
          <p className="text-[9px] text-zinc-700 uppercase tracking-widest font-mono">Nested Ark Infrastructure OS</p>
        </div>
        <Suspense fallback={<div className="text-center"><Loader2 className="animate-spin text-teal-500 mx-auto" size={28}/></div>}>
          <VerifyContent/>
        </Suspense>
      </div>
    </div>
  );
}
