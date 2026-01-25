'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Loader2, X } from 'lucide-react';

export default function StockSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query === (searchParams.get('q') || '')) return;

      startTransition(() => {
        const params = new URLSearchParams(window.location.search);
        if (query) {
          params.set('q', query);
        } else {
          params.delete('q');
        }
        
        router.replace(`/?${params.toString()}`, { scroll: false });
      });
    }, 300); 

    return () => clearTimeout(timeoutId);
  }, [query, router, searchParams]);

  function handleClear() {
    setQuery('');
  }

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search specimens (e.g. REL, TCS, Tata...)"
          className="w-full bg-paper-dark border-2 border-ink/20 px-4 py-3 pr-12 font-serif text-lg focus:outline-none focus:border-ink/40 transition-colors shadow-inner"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-ink/5 transition-colors rounded-full text-ink/40 hover:text-ink"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="p-2">
            {isPending ? (
              <Loader2 className="w-6 h-6 animate-spin text-ink-muted" />
            ) : (
              <Search className="w-6 h-6 text-ink-muted" />
            )}
          </div>
        </div>
      </div>
      <div className="absolute -bottom-6 left-1 text-[10px] text-ink/40 uppercase tracking-widest font-mono">
        {isPending ? 'Searching archives...' : 'Live Search Active'}
      </div>
    </div>
  );
}
