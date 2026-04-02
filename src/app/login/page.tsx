'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Mail, Lock, Loader2, AlertCircle, TrendingUp, HardHat, ShieldCheck, Crown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const PORTALS = [
  {
    role: 'INVESTOR',
    icon: TrendingUp,
    label: 'Investor',
    desc: 'Fund infrastructure projects, track ROI and escrow',
    lands: '/investments',
    color: 'text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/5',
  },
  {
    role: 'CONTRACTOR',
    icon: HardHat,
    label: 'Contractor',
    desc: 'Browse projects, submit bids, verify milestones',
    lands: '/projects',
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/5',
  },
  {
    role: 'GOVERNMENT',
    icon: ShieldCheck,
    label: 'Government',
    desc: 'Approve milestones, authorize fund releases',
    lands: '/admin/approval',
    color: 'text-teal-400',
    border: 'border-teal-500/30',
    bg: 'bg-teal-500/5',
  },
  {
    role: 'ADMIN',
    icon: Crown,
    label: 'Admin',
    desc: 'Command center — role assigned by super admin only',
    lands: '/admin',
    color: 'text-red-400',
    border: 'border-red-500/30',
    bg: 'bg-red-500/5',
  },
];

export default function LoginPage() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  // Portals are purely visual/informational — actual role is determined by the backend on auth
  const [highlighted, setHighlighted] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setIsSubmitting(true);
    try {
      const route = await login(email, password);
      router.replace(route);
    } catch {
      setError('Invalid credentials. Check email and access key.');
    } finally { setIsSubmitting(false); }
  };

  if (authLoading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-teal-500" size={28} /></div>;
  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[480px] space-y-7">

        {/* Header */}
        <div className="text-center space-y-3">
          <Image src="/nested_ark_icon.png" alt="Logo" width={56} height={56} priority className="mx-auto" style={{ width: '56px', height: 'auto' }} />
          <h1 className="text-2xl font-bold text-white tracking-widest uppercase">System Login</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-[0.15em]">One door. Your role routes you to the right command center.</p>
        </div>

        {/* Role portals — informational, show where each role lands */}
        <div className="grid grid-cols-2 gap-2">
          {PORTALS.map(p => {
            const Icon = p.icon;
            const isHl = highlighted === p.role;
            return (
              <button
                key={p.role}
                type="button"
                onClick={() => setHighlighted(isHl ? null : p.role)}
                className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-left transition-all ${isHl ? `${p.border} ${p.bg} ring-1 ring-current` : 'border-zinc-800 bg-zinc-900/20 hover:border-zinc-700'}`}
              >
                <Icon size={14} className={`${p.color} flex-shrink-0 mt-0.5`} />
                <div className="min-w-0">
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${p.color}`}>{p.label}</p>
                  <p className="text-[9px] text-zinc-600 mt-0.5 leading-snug">{p.desc}</p>
                  {isHl && <p className={`text-[8px] mt-1 font-mono ${p.color} opacity-70`}>→ {p.lands}</p>}
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-[9px] text-zinc-700 text-center uppercase tracking-widest">
          Admin role is assigned by the system owner — not self-registered
        </p>

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 pointer-events-none" />
              <input type="email" placeholder="Operator Email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" className="w-full bg-black border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-teal-500 transition-colors" />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 pointer-events-none" />
              <input type="password" placeholder="Access Key" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" className="w-full bg-black border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-teal-500 transition-colors" />
            </div>
          </div>

          {error && (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-red-400 text-[10px] uppercase font-bold tracking-widest">
                <AlertCircle size={12} /> {error}
              </div>
              <Link href="/forgot-password" className="block text-center text-zinc-500 hover:text-white text-[9px] uppercase tracking-tighter border border-zinc-800/50 py-2 rounded-lg transition-colors">
                Forgot Access Key? Initiate Recovery Protocol
              </Link>
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-teal-500 transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><ChevronRight size={14} /> Establish Connection</>}
          </button>
        </form>

        <p className="text-center text-zinc-500 text-xs uppercase tracking-widest">
          New Operator? <Link href="/register" className="text-teal-500 hover:underline">Apply for Access</Link>
        </p>
      </div>
    </div>
  );
}
