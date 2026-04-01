'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import api from '@/lib/api';
import { TrendingUp, Globe, ShieldCheck, DollarSign, Zap } from 'lucide-react';

interface TickerItem {
  type: string;
  text: string;
  link?: string;
}

export default function MarketTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const tickerRef = useRef<HTMLDivElement>(null);

  const fetchTicker = useCallback(async () => {
    try {
      const res = await api.get('/api/ticker');
      if (res.data.items?.length > 0) {
        setItems(res.data.items);
      } else {
        // Fallback items while data loads
        setItems([
          { type: 'RATE', text: 'Loading live rates...' },
          { type: 'LEDGER', text: 'Connecting to ledger...' },
        ]);
      }
    } catch {
      // Silent fail — show static items
    }
  }, []);

  useEffect(() => {
    fetchTicker();
    const interval = setInterval(fetchTicker, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [fetchTicker]);

  const getIcon = (type: string) => {
    if (type === 'INVESTMENT') return <TrendingUp size={10} className="text-emerald-500 flex-shrink-0" />;
    if (type === 'RATE') return <DollarSign size={10} className="text-amber-400 flex-shrink-0" />;
    if (type === 'AD') return <Zap size={10} className="text-teal-400 flex-shrink-0" />;
    if (type === 'LEDGER') return <ShieldCheck size={10} className="text-teal-500 flex-shrink-0" />;
    return <Globe size={10} className="text-zinc-500 flex-shrink-0" />;
  };

  const getColor = (type: string) => {
    if (type === 'INVESTMENT') return 'text-emerald-400';
    if (type === 'RATE') return 'text-amber-400';
    if (type === 'AD') return 'text-teal-400';
    if (type === 'LEDGER') return 'text-teal-500';
    return 'text-zinc-400';
  };

  // Duplicate items for seamless loop
  const displayItems = [...items, ...items];

  return (
    <div className="w-full bg-black border-b border-zinc-800 py-1.5 overflow-hidden relative">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

      <div
        ref={tickerRef}
        className="flex items-center gap-0 animate-[ticker_40s_linear_infinite]"
        style={{
          width: 'max-content',
          animation: 'ticker 40s linear infinite',
        }}
      >
        {displayItems.map((item, idx) => (
          <span key={idx} className={`flex items-center gap-1.5 px-6 text-[10px] font-mono font-bold uppercase tracking-widest ${getColor(item.type)} border-r border-zinc-800/60 whitespace-nowrap`}>
            {getIcon(item.type)}
            {item.link ? (
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                {item.text}
              </a>
            ) : item.text}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
