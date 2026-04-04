'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { useAuth, getRoleRoute, UserRole } from '@/lib/AuthContext';
import { Loader2, Eye, EyeOff, CheckCircle2, Mail, ShieldCheck } from 'lucide-react';

const ROLES = [
  { value: 'INVESTOR',   label: '💰 Investor',    desc: 'Fund projects & earn infrastructure yield' },
  { value: 'CONTRACTOR', label: '🏗 Contractor',   desc: 'Bid on works, execute projects, get paid' },
  { value: 'SUPPLIER',   label: '🚚 Supplier',     desc: 'Supply materials, confirm deliveries' },
  { value: 'BANK',       label: '🏦 Bank',         desc: 'Institutional capital & risk management' },
  { value: 'GOVERNMENT', label: '🏛 Government',   desc: 'Sponsor & verify infrastructure projects' },
];

type Phase = 'form' | 'verify_sent';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm]     = useState({ full_name: '', email: '', password: '', role: 'INVESTOR' });
  const [showPw, setShowPw] = useState(false);
  const [busy,   setBusy]   = useState(false);
  const [error,  setError]  = useState('');
  const [phase,  setPhase]  = useState<Phase>('form');
  const [sentTo, setSentTo] = useState('');

  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setBusy(true);
    try {
      // Register returns a limited token + requires_verification flag
      await register(form.email, form.password, form.full_name, form.role);
      setSentTo(form.email);
      setPhase('verify_sent');
    } catch (ex: any) {
      setError(ex?.response?.data?.error ?? 'Registration failed. Please try again.');
    } finally { setBusy(false); }
  };

  // ── Phase: Email sent ─────────────────────────────────────────────────────
  if (phase === 'verify_sent') return (
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
          <p className="text-teal-500 text-sm mt-1">Account created — verification required</p>
        </div>

        <p className="text-zinc-400 text-sm leading-relaxed">
          We sent a verification link to <strong className="text-white">{sentTo}</strong>. Click the link to activate your account before you can invest.
        </p>

        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-2 text-left text-[10px] text-zinc-400">
          {[
            'Check your inbox (and spam folder)',
            'Click the Verify My Account button in the email',
            'The link expires in 24 hours',
            'Sign in once verified to access your portal',
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 size={10} className="text-teal-500 mt-0.5 flex-shrink-0" />
              {s}
            </div>
          ))}
        </div>

        <ResendBlock email={sentTo} />

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

  // ── Phase: Registration form ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-[440px] space-y-8">

        {/* Logo */}
        <div className="text-center">
          <Image src="/nested_ark_icon.png" alt="Nested Ark" width={48} height={48} priority
            className="mx-auto mb-3" style={{ width: '48px', height: 'auto' }} />
          <h1 className="text-sm font-black uppercase tracking-[0.2em]">Nested Ark <span className="text-teal-500">OS</span></h1>
          <p className="text-[9px] text-zinc-600 uppercase tracking-widest mt-1">Initialize Account</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Role selector */}
          <div className="space-y-2">
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-[0.2em]">Select your operator role</p>
            <div className="grid grid-cols-1 gap-2">
              {ROLES.map(r => (
                <button key={r.value} type="button" onClick={() => f('role', r.value)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    form.role === r.value
                      ? 'border-teal-500 bg-teal-500/10'
                      : 'border-zinc-800 bg-zinc-900/20 hover:border-zinc-700'
                  }`}>
                  <span className="text-lg flex-shrink-0">{r.label.split(' ')[0]}</span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white">{r.label.split(' ').slice(1).join(' ')}</p>
                    <p className="text-[9px] text-zinc-500">{r.desc}</p>
                  </div>
                  {form.role === r.value && <CheckCircle2 size={14} className="text-teal-500 ml-auto flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Fields */}
          <input required value={form.full_name} onChange={e => f('full_name', e.target.value)}
            placeholder="Full Name" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-sm outline-none focus:border-teal-500 transition-colors" />

          <input required type="email" value={form.email} onChange={e => f('email', e.target.value)}
            placeholder="Email Address" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-sm outline-none focus:border-teal-500 transition-colors" />

          <div className="relative">
            <input required type={showPw ? 'text' : 'password'} value={form.password}
              onChange={e => f('password', e.target.value)} placeholder="Password (min. 8 characters)"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 pr-12 text-white text-sm outline-none focus:border-teal-500 transition-colors" />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Email verification notice */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 text-[9px] text-zinc-400">
            <Mail size={11} className="text-teal-500 mt-0.5 flex-shrink-0" />
            A verification link will be sent to your email. You must verify before you can invest or withdraw.
          </div>

          <button type="submit" disabled={busy}
            className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.15em] text-xs rounded-xl hover:bg-teal-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {busy ? <><Loader2 className="animate-spin" size={14} /> Creating Account…</> : 'Activate Connection'}
          </button>
        </form>

        <p className="text-center text-[9px] text-zinc-600 uppercase font-bold tracking-widest">
          Already have an account?{' '}
          <Link href="/login" className="text-teal-500 hover:text-white transition-colors">Sign In</Link>
        </p>

        <div className="text-center text-[8px] text-zinc-700 border-t border-zinc-900 pt-4">
          <ShieldCheck size={9} className="inline text-teal-500/40 mr-1" />
          Impressions &amp; Impacts Ltd · nestedark@gmail.com · Lagos · London · Dubai
        </div>
      </div>
    </div>
  );
}

// ── Resend block ──────────────────────────────────────────────────────────────
function ResendBlock({ email }: { email: string }) {
  const [sent,  setSent]  = useState(false);
  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState('');

  const resend = async () => {
    setBusy(true); setError('');
    try {
      await api.post('/api/auth/resend-verification', { email });
      setSent(true);
    } catch { setError('Could not resend. Try again in a moment.'); }
    finally { setBusy(false); }
  };

  if (sent) return (
    <p className="text-teal-400 text-xs font-bold">✅ New verification email sent. Check your inbox.</p>
  );

  return (
    <div className="space-y-1">
      <button onClick={resend} disabled={busy}
        className="w-full py-3 border border-zinc-700 text-zinc-400 font-bold text-xs uppercase tracking-widest rounded-xl hover:border-teal-500 hover:text-teal-500 transition-all flex items-center justify-center gap-2">
        {busy ? <Loader2 className="animate-spin" size={12} /> : <Mail size={12} />}
        Resend Verification Email
      </button>
      {error && <p className="text-red-400 text-[10px]">{error}</p>}
    </div>
  );
}
