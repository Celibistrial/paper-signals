import YahooFinance from 'yahoo-finance2';

type QuoteResult = {
  symbol?: string;
  shortName?: string;
  longName?: string;
  quoteType?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  currency?: string;
  exchangeName?: string;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketVolume?: number;
  marketState?: string;
  marketCap?: number;
  trailingPE?: number;
  trailingEps?: number;
  dividendYield?: number;
};

type AssetProfile = {
  sector?: string;
  industry?: string;
  longBusinessSummary?: string;
  website?: string;
};

type QuoteSummaryResult = {
  assetProfile?: AssetProfile;
};

type ChartQuote = {
  date?: Date;
  close?: number | null;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
};

type ChartResult = {
  quotes?: ChartQuote[];
};

type SearchNewsItem = {
  title?: string;
  publisher?: string;
  link?: string;
  providerPublishTime?: number;
};

type SearchQuoteItem = {
  symbol?: string;
  shortname?: string;
  longname?: string;
  exchange?: string;
  exchangeName?: string;
  shortName?: string;
  longName?: string;
};

type SearchResult = {
  news?: SearchNewsItem[];
  quotes?: SearchQuoteItem[];
};

const yahooFinance = new YahooFinance({
  validation: {
    logErrors: false
  },
  suppressNotices: ['ripHistorical', 'yahooSurvey']
});

export function formatSymbol(symbol: string, exchange: 'NSE' | 'BSE' = 'NSE') {
  const upper = symbol.toUpperCase();
  if (upper.endsWith('.NS') || upper.endsWith('.BO')) return upper;
  return exchange === 'NSE' ? `${upper}.NS` : `${upper}.BO`;
}

export async function getStockQuote(symbol: string) {
  try {
    const quote = await yahooFinance.quote(symbol) as QuoteResult | undefined;
    if (!quote) return null;

    let summary: QuoteSummaryResult = {};
    if (quote.quoteType === 'EQUITY') {
      try {
        summary = await yahooFinance.quoteSummary(symbol, {
          modules: ['assetProfile', 'defaultKeyStatistics', 'financialData']
        });
      } catch {
        // Silently fail summary
      }
    }

    return {
      symbol: quote.symbol as string,
      name: (quote.shortName || quote.longName) as string | undefined,
      price: quote.regularMarketPrice as number | undefined,
      change: quote.regularMarketChange as number | undefined,
      changePercent: quote.regularMarketChangePercent as number | undefined,
      currency: quote.currency as string | undefined,
      exchange: quote.exchangeName as string | undefined,
      high: quote.regularMarketDayHigh as number | undefined,
      low: quote.regularMarketDayLow as number | undefined,
      volume: quote.regularMarketVolume as number | undefined,
      marketState: quote.marketState as string | undefined,
      
      marketCap: quote.marketCap as number | undefined,
      pe: quote.trailingPE as number | undefined,
      eps: quote.trailingEps as number | undefined,
      dividendYield: quote.dividendYield as number | undefined,
      sector: summary?.assetProfile?.sector as string | undefined,
      industry: summary?.assetProfile?.industry as string | undefined,
      description: summary?.assetProfile?.longBusinessSummary as string | undefined,
      website: summary?.assetProfile?.website as string | undefined,
    };
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
}

export async function getStockHistory(
  symbol: string, 
  period1: Date, 
  period2: Date = new Date(),
  interval: '1d' | '1wk' | '1mo' = '1d'
) {
  try {
    const result = await yahooFinance.chart(symbol, {
      period1,
      period2,
      interval,
    }) as ChartResult;
    
    return (result.quotes || [])
      .filter(item => item.date && item.close !== null && item.close !== undefined)
      .map(item => ({
        date: item.date as Date,
        close: item.close as number,
        open: item.open as number | undefined,
        high: item.high as number | undefined,
        low: item.low as number | undefined,
        volume: item.volume as number | undefined,
      }));
  } catch (error) {
    console.error(`Error fetching history for ${symbol}:`, error);
    return [];
  }
}

export async function getStockNews(symbol: string) {
  try {
    const result = await yahooFinance.search(symbol) as SearchResult;
    return (result.news || []).map(article => ({
      title: article.title || '',
      publisher: article.publisher || '',
      link: article.link || '',
      time: new Date((article.providerPublishTime || 0) * 1000),
    }));
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    return [];
  }
}

export async function searchStocks(query: string) {
  try {
    const result = await yahooFinance.search(query) as SearchResult;
    const quotes = result.quotes || [];
    const indianResults = quotes.filter(q => q.symbol && (q.symbol.endsWith('.NS') || q.symbol.endsWith('.BO')));
    const upperQuery = query.toUpperCase();

    if (indianResults.length < 2 && query.length >= 2 && query.length < 5) {
      const candidates = [`${upperQuery}.NS`, `${upperQuery}.BO`, `${upperQuery}INFRA.NS`, `${upperQuery}INFRA.BO` ];
      for (const symbol of candidates) {
        try {
          const q = await yahooFinance.quote(symbol) as QuoteResult | undefined;
          if (q && q.symbol) {
            const existingSymbols = new Set(quotes.map((item) => item.symbol));
            if (!existingSymbols.has(q.symbol)) {
              quotes.push({ symbol: q.symbol, shortname: q.shortName, longname: q.longName, exchange: q.exchangeName });
            }
          }
        } catch {}
      }
    }

    const mappedResults = quotes
      .filter(q => q.symbol)
      .map(q => {
        let score = 0;
        const symbol = q.symbol as string;
        const name = q.shortname || q.longname || '';
        const isIndian = symbol.endsWith('.NS') || symbol.endsWith('.BO');
        if (isIndian) score += 10;
        const symbolBase = symbol.split('.')[0];
        if (symbolBase === upperQuery) score += 20;
        if (symbolBase.startsWith(upperQuery)) score += 15;
        if (name.toUpperCase().startsWith(upperQuery)) score += 5;
        return { symbol, name: name || undefined, exchange: q.exchange as string | undefined, score, isIndian };
      })
      .filter(q => q.isIndian || q.score > 10)
      .sort((a, b) => b.score - a.score);

    return mappedResults.map(({ symbol, name, exchange }) => ({ symbol, name, exchange }));
  } catch (error) {
    console.error(`Error searching for ${query}:`, error);
    return [];
  }
}
