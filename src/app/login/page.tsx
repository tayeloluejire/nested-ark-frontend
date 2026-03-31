'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch {
      setError('Invalid credentials. Check email and access key.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <Loader2 className="animate-spin text-teal-500" size={28} />
    </div>
  );
  
  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="text-center">
          <Image src="/nested_ark_icon.png" alt="Logo" width={64} height={64} priority className="mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white tracking-widest uppercase">System Login</h1>
          <p className="text-zinc-500 text-xs mt-2 uppercase tracking-[0.2em]">Credential Verification Required</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
              <input 
                type="email" placeholder="Operator Email" value={email} 
                onChange={(e) => setEmail(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-teal-500" 
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
              <input 
                type="password" placeholder="Access Key" value={password} 
                onChange={(e) => setPassword(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-teal-500" 
              />
            </div>
          </div>

          {error && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-red-400 text-[10px] uppercase font-bold tracking-widest">
                <AlertCircle size={12} /> {error}
              </div>
              <Link href="/forgot-password" title="Initiate Recovery" className="block text-center text-zinc-500 hover:text-white text-[9px] uppercase tracking-tighter border border-zinc-800/50 py-2 rounded-lg transition-colors">
                Forgot Access Key? Initiate Recovery Protocol
              </Link>
            </div>
          )}

          <button 
            type="submit" disabled={isSubmitting} 
            className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-teal-500 transition-all uppercase text-xs tracking-widest flex items-center justify-center"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Establish Connection'}
          </button>
        </form>

        <p className="text-center text-zinc-500 text-xs uppercase tracking-widest">
          New Operator? <Link href="/register" className="text-teal-500 hover:underline">Apply for Access</Link>
        </p>
      </div>
    </div>
  );
}