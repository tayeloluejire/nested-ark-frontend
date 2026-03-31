'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ChevronLeft, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '@/lib/api'; // Import your axios instance

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // REAL API CALL: Adjust the endpoint path if your backend uses a different one
      await api.post('/api/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Protocol failed. Verify email and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="text-center">
          <Image src="/nested_ark_icon.png" alt="Logo" width={64} height={64} priority className="mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white tracking-widest uppercase">Recovery Protocol</h1>
          <p className="text-zinc-500 text-xs mt-2 uppercase tracking-[0.2em]">Reset Operator Access Key</p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          {!submitted ? (
            <form onSubmit={handleRecovery} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                <input 
                  type="email" 
                  placeholder="Registered Operator Email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="w-full bg-black border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-teal-500 transition-colors" 
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-[10px] uppercase font-bold tracking-widest bg-red-400/10 p-2 rounded-lg">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-teal-500 transition-all uppercase text-xs tracking-widest flex items-center justify-center disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Request Reset Link'}
              </button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="flex justify-center">
                <ShieldCheck className="text-teal-500" size={48} />
              </div>
              <p className="text-sm text-zinc-300 italic">"Instructions dispatched to encrypted channel."</p>
              <p className="text-xs text-zinc-500 font-mono">{email}</p>
              <p className="text-[10px] text-teal-500 uppercase tracking-widest">Check inbox and spam folders</p>
            </div>
          )}
        </div>

        <Link href="/login" className="flex items-center justify-center gap-2 text-zinc-500 hover:text-white text-xs uppercase tracking-widest transition-colors">
          <ChevronLeft size={14} /> Return to Login
        </Link>
      </div>
    </div>
  );
}