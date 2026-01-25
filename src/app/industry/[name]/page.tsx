import Link from 'next/link';
import { ArrowLeft, Building2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import PaperCard from '@/components/PaperCard';
import { getStockQuote } from '@/lib/stocks';

export default async function IndustryPage({ params }: { params: Promise<{ name: string }> }) {
  const { name: encodedName } = await params;
  const name = decodeURIComponent(encodedName);
  
  
  const symbols = ['TCS.NS', 'RELIANCE.NS', 'INFY.NS', 'HDFCBANK.NS'];

  const stocks = await Promise.all(
    symbols.map(async (symbol) => await getStockQuote(symbol))
  );

  return (
    <main className="flex-1 container mx-auto px-4 py-12">
      <Link href="/" className="inline-flex items-center gap-2 mb-8 text-ink/60 hover:text-ink transition-colors font-serif italic">
        <ArrowLeft className="w-4 h-4" />
        Return to the Ledger
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b-2 border-ink/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-ink/40 font-mono uppercase tracking-[0.2em] text-xs">
            <Building2 className="w-4 h-4" /> Industry Records
          </div>
          <h1 className="text-5xl font-serif font-bold tracking-tight">{name}</h1>
        </div>
        <div className="font-serif italic text-ink/60">
          Archived Specimens for this Industry
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stocks.map((stock, i) => stock && (
          <Link href={`/stock/${stock.symbol}`} key={stock.symbol}>
            <PaperCard delay={i * 0.1}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold leading-tight">{stock.name}</h3>
                  <p className="text-sm text-ink/60 font-mono">{stock.symbol}</p>
                </div>
                <div className={stock.change && stock.change >= 0 ? 'text-green-800' : 'text-red-800'}>
                  {stock.change && stock.change >= 0 ? <ArrowUpRight /> : <ArrowDownRight />}
                </div>
              </div>
              
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono">
                  ₹{stock.price?.toLocaleString('en-IN')}
                </span>
                <span className={stock.changePercent && stock.changePercent >= 0 ? 'stock-up text-sm' : 'stock-down text-sm'}>
                  {stock.changePercent && stock.changePercent >= 0 ? '+' : ''}
                  {stock.changePercent?.toFixed(2)}%
                </span>
              </div>
            </PaperCard>
          </Link>
        ))}
      </div>
      
      <div className="paper-texture-overlay" />
    </main>
  );
}
