'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface IndexCardProps {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  topGainers: { symbol: string; change: number }[];
}

export default function IndexCard({ name, value, change, changePercent, topGainers }: IndexCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const isUp = change >= 0;

  return (
    <div 
      className="relative h-48 w-full cursor-pointer perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="w-full h-full relative preserve-3d transition-all duration-500"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
      >
        {/* Front Side */}
        <div className="absolute inset-0 backface-hidden paper-card rough-edge flex flex-col justify-between p-6">
          <div className="flex justify-between items-start">
            <h3 className="font-serif text-2xl font-bold">{name}</h3>
            {isUp ? <TrendingUp className="text-green-800" /> : <TrendingDown className="text-red-800" />}
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-mono font-bold tracking-tighter truncate">
              {value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className={`text-sm font-mono whitespace-nowrap ${isUp ? 'text-green-800' : 'text-red-800'}`}>
              {isUp ? '+' : ''}{change.toFixed(2)} ({isUp ? '+' : ''}{changePercent.toFixed(2)}%)
            </div>
          </div>
          <div className="text-[10px] font-mono text-ink/30 uppercase tracking-widest">
            Click to see constituents
          </div>
        </div>

        {/* Back Side */}
        <div 
          className="absolute inset-0 backface-hidden paper-card rough-edge bg-paper-dark p-6 flex flex-col"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <h4 className="font-serif text-lg italic mb-2 border-b border-ink/10">Top Specimens</h4>
          <div className="flex-1 space-y-2">
            {topGainers.map((stock) => (
              <div key={stock.symbol} className="flex justify-between items-center text-xs font-mono">
                <span>{stock.symbol}</span>
                <span className={stock.change >= 0 ? 'text-green-800' : 'text-red-800'}>
                  {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
          <div className="text-[10px] font-mono text-ink/30 uppercase tracking-widest mt-2">
            Click to return
          </div>
        </div>
      </motion.div>
    </div>
  );
}
