'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect once auth check is complete
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505]">
        <Loader2 className="animate-spin text-teal-500" size={28} />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <nav className="border-b border-zinc-800 bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-lg font-bold tracking-tighter uppercase">
            Nested Ark <span className="text-teal-500">OS</span>
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-teal-500 text-black px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-teal-400 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <p className="text-teal-500 text-[10px] uppercase font-bold tracking-[0.3em] mb-6">
          Infrastructure Investment System
        </p>
        <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic mb-6">
          Global Infrastructure<br />Investment Platform
        </h2>
        <p className="text-zinc-400 text-lg mb-10 max-w-2xl mx-auto">
          Connect project sponsors, contractors, and investors to build the
          infrastructure the world needs.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="bg-white text-black px-8 py-4 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-teal-500 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="border border-zinc-700 text-white px-8 py-4 rounded-xl font-bold uppercase text-xs tracking-widest hover:border-teal-500 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </section>
    </div>
  );
}
