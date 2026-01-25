'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { clsx } from 'clsx';

const RANGES = [
  { label: '7D', value: '7' },
  { label: '1M', value: '30' },
  { label: '3M', value: '90' },
  { label: '1Y', value: '365' },
  { label: '5Y', value: '1825' },
  { label: 'MAX', value: 'max' },
];

export default function TimeframeSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRange = searchParams.get('range') || '30';

  function setRange(value: string) {
    const params = new URLSearchParams(window.location.search);
    params.set('range', value);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex gap-2">
      {RANGES.map((r) => (
        <button
          key={r.value}
          onClick={() => setRange(r.value)}
          className={clsx(
            "px-3 py-1 text-xs font-mono border-2 transition-all",
            currentRange === r.value 
              ? "bg-ink text-paper-light border-ink" 
              : "bg-transparent text-ink/40 border-ink/10 hover:border-ink/30"
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
