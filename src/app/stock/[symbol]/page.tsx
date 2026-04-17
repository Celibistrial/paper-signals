import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Calendar, Globe, Landmark, Newspaper, FileText, Activity, Microscope, X, CandlestickChart, LineChart } from 'lucide-react';
import { getStockQuote, getStockHistory, getStockNews } from '@/lib/stocks';
import PaperCard from '@/components/PaperCard';
import SimpleChart from '@/components/SimpleChart';
import TimeframeSelector from '@/components/TimeframeSelector';
import SectorIndustryList from '@/components/SectorIndustryList';
import { formatDistanceToNow } from 'date-fns';

export async function generateMetadata({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  const quote = await getStockQuote(decodeURIComponent(symbol));
  if (!quote) return { title: 'Stock Not Found' };
  return { title: `${quote.name} (${quote.symbol})`, description: `Real-time stock price and history for ${quote.name} on the ${quote.exchange}.` };
}

export default async function StockPage({
  params,
  searchParams,
}: {
  params: Promise<{ symbol: string }>;
  searchParams: Promise<{ range?: string; ma?: string; bb?: string; vol?: string; dive?: string; rsi?: string; view?: string }>;
}) {
  const { symbol: encodedSymbol } = await params;
  const { range: rangeStr, ma: showMA, bb: showBB, vol: showVol, dive: isDive, rsi: showRSI, view: viewMode } = await searchParams;
  const symbol = decodeURIComponent(encodedSymbol);
  
  let startDate: Date;
  let interval: '1d' | '1wk' | '1mo' = '1d';
  let rangeLabel = '';

  if (rangeStr === 'max') {
    startDate = new Date(0); interval = '1mo'; rangeLabel = 'All-Time';
  } else {
    const days = parseInt(rangeStr || '30');
    const now = new Date().getTime();
    startDate = new Date(now - days * 24 * 60 * 60 * 1000);
    rangeLabel = days >= 1825 ? '5-Year' : days >= 365 ? '1-Year' : `${days}-Day`;
    if (days >= 1825) interval = '1wk'; else if (days >= 365) interval = '1d';
  }
  
  const [quote, history, news] = await Promise.all([
    getStockQuote(symbol),
    getStockHistory(symbol, startDate, new Date(), interval),
    getStockNews(symbol)
  ]);

  if (!quote) notFound();

  const isUp = quote.change && quote.change >= 0;

  const getIndicatorLink = (key: string, current: string | undefined) => {
    const p = new URLSearchParams({
      range: rangeStr || '30',
      ma: showMA || 'false',
      bb: showBB || 'false',
      vol: showVol || 'false',
      dive: isDive || 'false',
      rsi: showRSI || 'false',
      view: viewMode || 'line'
    });
    if (key === 'view') p.set(key, current === 'candle' ? 'line' : 'candle');
    else p.set(key, current === 'true' ? 'false' : 'true');
    return `?${p.toString()}`;
  };

  const chartIndicators = { ma: showMA === 'true', bb: showBB === 'true', vol: showVol === 'true', rsi: showRSI === 'true' };
  const currentView = (viewMode as 'line' | 'candle') || 'line';

  if (isDive === 'true') {
    return (
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <Link href={`?range=${rangeStr || '30'}`} className="inline-flex items-center gap-2 text-ink/60 hover:text-ink transition-colors font-serif italic"><X className="w-4 h-4" /> Exit Dive Mode</Link>
          <div className="flex flex-wrap gap-2">
            <Link href={getIndicatorLink('view', viewMode)} className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest px-3 py-1.5 border-2 border-ink/10 hover:border-ink/30 transition-all">{currentView === 'line' ? <CandlestickChart className="w-4 h-4" /> : <LineChart className="w-4 h-4" />} {currentView === 'line' ? 'Candles' : 'Line'}</Link>
            <Link href={getIndicatorLink('ma', showMA)} className={`text-xs font-mono uppercase tracking-widest px-3 py-1.5 border-2 transition-all ${showMA === 'true' ? 'bg-ink text-paper-light border-ink' : 'border-ink/10 hover:border-ink/30'}`}>MA(20)</Link>
            <Link href={getIndicatorLink('bb', showBB)} className={`text-xs font-mono uppercase tracking-widest px-3 py-1.5 border-2 transition-all ${showBB === 'true' ? 'bg-ink text-paper-light border-ink' : 'border-ink/10 hover:border-ink/30'}`}>Bollinger</Link>
            <Link href={getIndicatorLink('vol', showVol)} className={`text-xs font-mono uppercase tracking-widest px-3 py-1.5 border-2 transition-all ${showVol === 'true' ? 'bg-ink text-paper-light border-ink' : 'border-ink/10 hover:border-ink/30'}`}>Volume</Link>
            <Link href={getIndicatorLink('rsi', showRSI)} className={`text-xs font-mono uppercase tracking-widest px-3 py-1.5 border-2 transition-all ${showRSI === 'true' ? 'bg-ink text-paper-light border-ink' : 'border-ink/10 hover:border-ink/30'}`}>RSI</Link>
          </div>
        </div>
        <PaperCard hover={false} className="p-12 min-h-[70vh] flex flex-col justify-center">
          <div className="flex justify-between items-end mb-12 border-b border-ink/5 pb-8">
            <div><h1 className="text-5xl md:text-6xl font-serif font-bold tracking-tight mb-2">{quote.name}</h1><p className="text-2xl text-ink/40 font-mono tracking-widest">{quote.symbol} • {rangeLabel} ANALYSIS</p></div>
            <div className="text-right"><div className="text-7xl font-mono font-bold tracking-tighter">₹{quote.price?.toLocaleString('en-IN')}</div><div className={`text-3xl font-mono ${isUp ? 'text-green-800' : 'text-red-800'}`}>{isUp ? '+' : ''}{quote.change?.toFixed(2)} ({quote.changePercent?.toFixed(2)}%)</div></div>
          </div>
          <div className="flex-1"><SimpleChart data={history} color={isUp ? '#166534' : '#991b1b'} indicators={chartIndicators} viewMode={currentView} /></div>
          <div className="mt-12 flex justify-between items-center"><TimeframeSelector /><div className="text-[10px] font-mono uppercase text-ink/20 tracking-[0.5em]">Deep Specimen Investigation</div></div>
        </PaperCard>
        <div className="paper-texture-overlay" />
      </main>
    );
  }

  return (
    <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-ink/60 hover:text-ink transition-colors font-serif italic"><ArrowLeft className="w-4 h-4" /> Return to the Ledger</Link>
        <Link href="?dive=true" className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-paper-light font-mono text-xs uppercase tracking-widest hover:rotate-1 transition-transform shadow-lg"><Microscope className="w-4 h-4" /> In-depth Dive</Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-12">
          <PaperCard hover={false} className="p-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-12">
              <div>
                <div className="flex items-center gap-2 mb-2"><span className="text-xs uppercase tracking-widest px-2 py-0.5 bg-ink/5 border border-ink/10 rounded font-mono">{quote.exchange}</span><span className="text-xs italic text-ink/40 font-serif">Market State: {quote.marketState}</span></div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold tracking-tight break-words max-w-[15ch] md:max-w-none">{quote.name}</h1>
                <p className="text-base md:text-lg text-ink/60 font-mono mt-1">{quote.symbol}</p>
              </div>
              <div className="text-left md:text-right flex flex-col items-start md:items-end">
                <div className="text-4xl md:text-5xl lg:text-6xl font-bold font-mono tracking-tighter whitespace-nowrap">₹{quote.price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                <div className={`flex items-center gap-1 text-2xl font-mono ${isUp ? 'text-green-800' : 'text-red-800'}`}>{isUp ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}<span>{quote.change?.toFixed(2)} ({quote.changePercent?.toFixed(2)}%)</span></div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-ink/10 pb-4">
                <h3 className="font-serif text-xl italic flex items-center gap-2"><Calendar className="w-4 h-4" /> {rangeLabel} Record</h3>
                <TimeframeSelector />
              </div>
              <div className="py-8"><SimpleChart data={history} color={isUp ? '#166534' : '#991b1b'} indicators={{ ma: showMA === 'true', bb: false, vol: false, rsi: false }} /></div>
            </div>
            <div className="mt-8 pt-8 border-t border-ink/10"><SectorIndustryList sector={quote.sector} industry={quote.industry} /></div>
          </PaperCard>
          {quote.description && (
            <div className="space-y-4">
              <h3 className="font-serif text-2xl italic flex items-center gap-2 border-b-2 border-ink/10 pb-2"><FileText className="w-5 h-5" /> Company Dossier</h3>
              <PaperCard delay={0.1}>
                <p className="font-serif leading-relaxed text-ink/80 first-letter:text-4xl first-letter:font-bold first-letter:mr-1 first-letter:float-left">{quote.description}</p>
                {quote.website && <div className="mt-6 pt-4 border-t border-ink/5"><a href={quote.website} target="_blank" rel="noopener noreferrer" className="text-xs font-mono italic text-ink/40 hover:text-ink transition-colors">Official Records: {quote.website}</a></div>}
              </PaperCard>
            </div>
          )}
          <div className="space-y-6">
            <h3 className="font-serif text-2xl italic flex items-center gap-2 border-b-2 border-ink/10 pb-2"><Newspaper className="w-5 h-5" /> Recent Dispatches</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {news.length > 0 ? news.map((article: any, i: number) => (
                <PaperCard key={i} delay={0.2 + i * 0.1} className="h-full group">
                  <div className="flex flex-col h-full">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-ink/40 mb-2">{article.publisher} • {formatDistanceToNow(new Date(article.time), { addSuffix: true })}</div>
                    <h4 className="font-serif text-lg font-bold leading-tight mb-4 flex-1">{article.title}</h4>
                    <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-xs font-mono uppercase tracking-tighter border-b border-ink/10 group-hover:border-ink self-start transition-all">Read Full Report</a>
                  </div>
                </PaperCard>
              )) : <div className="col-span-2 py-12 text-center font-serif italic text-ink/40 border-2 border-dashed border-ink/10">No recent dispatches found in the archives for this specimen.</div>}
            </div>
          </div>
        </div>
        <div className="space-y-8">
          <PaperCard className="bg-paper-dark" delay={0.3}><h3 className="font-serif text-xl font-bold mb-6">Market Insight</h3><div className="prose prose-sm font-serif italic text-ink/80 leading-relaxed"><p>The value of {quote.name} has shifted by {Math.abs(quote.changePercent || 0).toFixed(2)}% in the latest market session. {isUp ? " Bullish sentiment prevails as prices climb above previous resistance levels." : " Bearish pressure suggests a period of consolidation or correction."}</p><p className="mt-4">Observations from the last {rangeLabel === 'All-Time' ? 'available' : rangeLabel.toLowerCase()} record indicate a {history[0]?.close && quote.price && history[0].close < quote.price ? 'positive' : 'negative'} overall trend in capital allocation.</p></div></PaperCard>
          <PaperCard delay={0.5} className="font-mono"><h3 className="font-serif text-lg font-bold mb-6 flex items-center gap-2"><Activity className="w-4 h-4" /> Vital Statistics</h3><div className="space-y-4 text-sm"><div className="flex justify-between border-b border-ink/5 pb-1"><span className="text-ink/40 uppercase text-[10px]">Market Cap</span><span className="font-bold">₹{(quote.marketCap || 0).toLocaleString('en-IN')}</span></div><div className="flex justify-between border-b border-ink/5 pb-1"><span className="text-ink/40 uppercase text-[10px]">P/E Ratio</span><span className="font-bold">{quote.pe?.toFixed(2) || 'N/A'}</span></div><div className="flex justify-between border-b border-ink/5 pb-1"><span className="text-ink/40 uppercase text-[10px]">Trailing EPS</span><span className="font-bold">{quote.eps?.toFixed(2) || 'N/A'}</span></div><div className="flex justify-between"><span className="text-ink/40 uppercase text-[10px]">Div. Yield</span><span className="font-bold">{quote.dividendYield ? `${(quote.dividendYield * 100).toFixed(2)}%` : 'N/A'}</span></div></div></PaperCard>
          <PaperCard delay={0.6}><h3 className="font-serif text-lg font-bold mb-4 flex items-center gap-2"><Landmark className="w-4 h-4" /> Daily Range</h3><div className="space-y-3 font-mono text-sm"><div className="flex justify-between border-b border-ink/5 pb-1"><span className="text-ink/60">Low/High</span><span className="font-bold whitespace-nowrap">₹{quote.low?.toFixed(2)} - ₹{quote.high?.toFixed(2)}</span></div><div className="flex justify-between"><span className="text-ink/60">Volume</span><span className="font-bold">{quote.volume?.toLocaleString('en-IN')}</span></div></div></PaperCard>
          <PaperCard delay={0.7} className="border-dashed border-2 border-ink/20"><h4 className="font-mono text-xs uppercase tracking-tighter text-ink/40 mb-2">Note from the Ledger</h4><p className="text-xs font-serif italic text-ink/50">All financial specimens listed here are for educational observation. Market dynamics are subject to atmospheric volatility.</p></PaperCard>
        </div>
      </div>
      <div className="paper-texture-overlay" />
    </main>
  );
}
