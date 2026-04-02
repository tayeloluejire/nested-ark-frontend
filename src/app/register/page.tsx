'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth, getRoleRoute, UserRole } from '@/lib/AuthContext';
import { Eye, EyeOff, Loader2, ArrowLeft, Shield, Landmark, HardHat, LogIn, TrendingUp, Truck } from 'lucide-react';

const ROLES = [
  { id: 'INVESTOR',   label: 'Investor',   icon: TrendingUp, desc: 'Fund infrastructure projects' },
  { id: 'CONTRACTOR', label: 'Contractor', icon: HardHat,    desc: 'Execute & bid on projects'   },
  { id: 'SUPPLIER',   label: 'Supplier',   icon: Truck,      desc: 'Material & logistics partner' },
  { id: 'BANK',       label: 'Bank',       icon: Landmark,   desc: 'Capital tranche provider'     },
  { id: 'GOVERNMENT', label: 'Govt',       icon: Shield,     desc: 'Government sponsor'           },
];

export default function RegisterPage() {
  const { register, user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('INVESTOR');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect authenticated users to their correct portal
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      router.replace(getRoleRoute(user.role as UserRole));
    }
  }, [isAuthenticated, authLoading, user, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Full name is required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setIsSubmitting(true);
    try {
      const route = await register(email.trim(), password, name.trim(), role);
      router.replace(route);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Account initialization failed. Try again.');
    } finally { setIsSubmitting(false); }
  };

  if (authLoading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-teal-500" size={28} /></div>;
  if (isAuthenticated) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] p-6">
      <div className="w-full max-w-[520px]">
        <div className="flex items-center mb-8">
          <Link href="/login" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Login
          </Link>
        </div>

        <div className="mb-8 space-y-2">
          <Image src="/nested_ark_icon.png" alt="Logo" width={48} height={48} priority style={{ width: '48px', height: 'auto' }} />
          <h1 className="text-3xl font-bold tracking-tight text-white">Initialize Account</h1>
          <p className="text-zinc-400 text-sm">Select your operator role to engage the infrastructure.</p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleRegister} className="space-y-6">
            {/* Role selector */}
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-3">Select Role</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {ROLES.map(r => {
                  const Icon = r.icon;
                  const isActive = role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                        isActive ? 'border-teal-500 bg-teal-500/10 text-white' : 'border-zinc-800 bg-black text-zinc-500 hover:border-zinc-700'
                      }`}
                    >
                      <Icon size={18} className={isActive ? 'text-teal-500' : 'text-zinc-600'} />
                      <span className="mt-1.5 text-[9px] font-bold uppercase tracking-tight">{r.label}</span>
                      <span className="text-[8px] text-zinc-600 mt-0.5 text-center leading-tight">{r.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Authorized Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-teal-500 transition-colors"
              />
              <input
                type="email"
                placeholder="Verification Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-teal-500 transition-colors"
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Access Password (min. 6 chars)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-teal-500 transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-center space-y-3">
                <p className="text-red-400 text-[10px] uppercase font-bold tracking-widest">{error}</p>
                {(error.toLowerCase().includes('registered') || error.toLowerCase().includes('exists')) && (
                  <Link href="/login" className="flex items-center justify-center gap-2 text-white bg-red-500/20 py-2 rounded-lg text-[10px] font-bold uppercase hover:bg-red-500/30 transition-all">
                    <LogIn size={12} /> Login to existing account
                  </Link>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-teal-500 text-black font-bold uppercase text-xs tracking-[0.2em] hover:bg-teal-400 transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Activate Connection'}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-500 text-xs uppercase tracking-widest mt-6">
          Already registered? <Link href="/login" className="text-teal-500 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
