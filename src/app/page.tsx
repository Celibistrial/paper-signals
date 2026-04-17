import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, Search, Book } from 'lucide-react';
import { clsx } from 'clsx';
import PaperCard from '@/components/PaperCard';
import StockSearch from '@/components/StockSearch';
import IndexCard from '@/components/IndexCard';
import SectorArchive from '@/components/SectorArchive';
import { getStockQuote, searchStocks } from '@/lib/stocks';


const TRENDING_SYMBOLS = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS'];

async function MarketIndices() {
  const [nifty, sensex] = await Promise.all([
    getStockQuote('^NSEI'),
    getStockQuote('^BSESN')
  ]);

  
  const niftyGainers = [
    { symbol: 'RELIANCE', change: 1.2 },
    { symbol: 'TCS', change: 0.8 },
    { symbol: 'HDFCBANK', change: -0.2 }
  ];
  
  const sensexGainers = [
    { symbol: 'INFY', change: 2.1 },
    { symbol: 'ICICIBANK', change: 1.5 },
    { symbol: 'SBIN', change: -0.5 }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
      {nifty && (
        <IndexCard 
          name="NIFTY 50"
          value={nifty.price || 0}
          change={nifty.change || 0}
          changePercent={nifty.changePercent || 0}
          topGainers={niftyGainers}
        />
      )}
      {sensex && (
        <IndexCard 
          name="SENSEX"
          value={sensex.price || 0}
          change={sensex.change || 0}
          changePercent={sensex.changePercent || 0}
          topGainers={sensexGainers}
        />
      )}
    </div>
  );
}

async function TrendingStocks() {
  const stocks = await Promise.all(
    TRENDING_SYMBOLS.map(async (symbol) => {
      const quote = await getStockQuote(symbol);
      return quote;
    })
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {stocks.map((stock, i) => stock && (
        <Link href={`/stock/${stock.symbol}`} key={stock.symbol}>
          <PaperCard delay={i * 0.1}>
            <div className="flex justify-between items-start mb-4 gap-2">
              <div className="min-w-0">
                <h3 className="font-serif text-xl font-bold leading-tight truncate">{stock.name}</h3>
                <p className="text-sm text-ink/60 font-mono">{stock.symbol}</p>
              </div>
              <div className={clsx("shrink-0", stock.change && stock.change >= 0 ? 'text-green-800' : 'text-red-800')}>
                {stock.change && stock.change >= 0 ? <ArrowUpRight /> : <ArrowDownRight />}
              </div>
            </div>
            
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono whitespace-nowrap">
                ₹{stock.price?.toLocaleString('en-IN')}
              </span>
              <span className={clsx("shrink-0 whitespace-nowrap", stock.changePercent && stock.changePercent >= 0 ? 'stock-up text-sm' : 'stock-down text-sm')}>
                {stock.changePercent && stock.changePercent >= 0 ? '+' : ''}
                {stock.changePercent?.toFixed(2)}%
              </span>
            </div>
            
            <div className="mt-4 pt-4 border-t border-ink/5 flex justify-between text-xs font-mono text-ink/40 italic">
              <span>H: ₹{stock.high?.toLocaleString('en-IN')}</span>
              <span>L: ₹{stock.low?.toLocaleString('en-IN')}</span>
            </div>
          </PaperCard>
        </Link>
      ))}
    </div>
  );
}

async function SearchResults({ query }: { query: string }) {
  if (!query) return null;
  const results = await searchStocks(query);

  if (results.length === 0) {
    return (
      <PaperCard className="text-center py-12">
        <Search className="w-12 h-12 mx-auto mb-4 text-ink/20" />
        <h3 className="font-serif text-2xl italic">No specimens found for &quot;{query}&quot;</h3>
        <p className="text-ink/60 mt-2">Try searching for companies like &quot;Reliance&quot; or &quot;Tata&quot;</p>
      </PaperCard>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl italic border-b-2 border-ink/10 pb-2">Search Results: {query}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {results.map((stock: { symbol: string; name: string | undefined; exchange: string | undefined }, i: number) => (
          <Link href={`/stock/${stock.symbol}`} key={stock.symbol}>
            <PaperCard delay={i * 0.05}>
              <h3 className="font-serif text-xl font-bold">{stock.name}</h3>
              <p className="text-sm text-ink/60 font-mono mb-4">{stock.symbol} • {stock.exchange}</p>
              <span className="text-xs px-2 py-1 bg-ink/5 border border-ink/10 rounded uppercase">View Details</span>
            </PaperCard>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <main className="flex-1 container mx-auto px-4 py-12">
      <div className="flex flex-col items-center mb-16 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-serif font-bold tracking-tight">PaperSignals</h1>
          <p className="text-xl font-serif italic text-ink/60">A curated ledger of the Indian Market</p>
        </div>
        
        <StockSearch />
      </div>

      <div className="space-y-12">
        {!q ? (
          <>
            <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 h-48 bg-paper-dark/20 animate-pulse rounded-lg" />}>
              <MarketIndices />
            </Suspense>

            <SectorArchive />

            <div className="flex items-center gap-2 border-b-2 border-ink/10 pb-2">
              <Book className="w-5 h-5 text-ink/60" />
              <h2 className="font-serif text-2xl italic">Daily Market Record</h2>
            </div>
            <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-paper-dark/50 animate-pulse rough-edge" />
              ))}
            </div>}>
              <TrendingStocks />
            </Suspense>
          </>
        ) : (
          <Suspense fallback={<div className="h-96 bg-paper-dark/50 animate-pulse rough-edge" />}>
            <SearchResults query={q} />
          </Suspense>
        )}
      </div>

      {/* Aesthetic overlay */}
      <div className="paper-texture-overlay" />
    </main>
  );
}
