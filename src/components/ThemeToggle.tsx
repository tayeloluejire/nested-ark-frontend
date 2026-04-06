'use client';
import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export type Theme = 'dark' | 'light';

// ── Exported helper so other components can read theme reactively ────────────
export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  return (localStorage.getItem('ark-theme') as Theme) || 'dark';
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('ark-theme', theme);
}

// ── The toggle button ────────────────────────────────────────────────────────
export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = getStoredTheme();
    setTheme(saved);
    applyTheme(saved);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) return (
    <div className={`${compact ? 'w-8 h-8' : 'w-9 h-9'} rounded-lg bg-zinc-900 border border-zinc-800 animate-pulse`} />
  );

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`
        relative flex items-center justify-center rounded-lg border transition-all duration-200
        ${compact ? 'w-8 h-8' : 'w-9 h-9'}
        ${isDark
          ? 'border-zinc-800 bg-zinc-900/50 text-amber-400 hover:border-amber-400/50 hover:bg-amber-400/5'
          : 'border-slate-200 bg-white text-slate-700 hover:border-teal-400 hover:bg-teal-50 shadow-sm'
        }
      `}
    >
      <span className={`transition-all duration-300 ${isDark ? 'rotate-0 scale-100' : 'rotate-180 scale-90 opacity-0 absolute'}`}>
        <Sun size={compact ? 13 : 15} />
      </span>
      <span className={`transition-all duration-300 ${!isDark ? 'rotate-0 scale-100' : 'rotate-180 scale-90 opacity-0 absolute'}`}>
        <Moon size={compact ? 13 : 15} />
      </span>
    </button>
  );
}
