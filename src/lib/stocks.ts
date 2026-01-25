import YahooFinance from 'yahoo-finance2';


const yahooFinance = new YahooFinance({
  validation: {
    logErrors: false
  }
});



export function formatSymbol(symbol: string, exchange: 'NSE' | 'BSE' = 'NSE') {
  const upper = symbol.toUpperCase();
  if (upper.endsWith('.NS') || upper.endsWith('.BO')) return upper;
  return exchange === 'NSE' ? `${upper}.NS` : `${upper}.BO`;
}

export async function getStockQuote(symbol: string) {
  try {
    const quote = await yahooFinance.quote(symbol) as any;
    if (!quote) return null;

    
    let summary: any = {};
    if (quote.quoteType === 'EQUITY') {
      try {
        summary = await yahooFinance.quoteSummary(symbol, {
          modules: ['assetProfile', 'defaultKeyStatistics', 'financialData']
        });
      } catch (e) {
        
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
    const result = await yahooFinance.historical(symbol, {
      period1,
      period2,
      interval,
    }) as any[];
    return result.map(item => ({
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
    const result = await yahooFinance.search(symbol) as any;
    return (result.news as any[] || []).map(article => ({
      title: article.title as string,
      publisher: article.publisher as string,
      link: article.link as string,
      time: new Date(article.providerPublishTime * 1000),
    }));
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    return [];
  }
}

export async function searchStocks(query: string) {
  try {
    let result = await yahooFinance.search(query) as any;
    const indianResults = (result.quotes as any[]).filter(q => q.symbol && (q.symbol.endsWith('.NS') || q.symbol.endsWith('.BO')));
    const upperQuery = query.toUpperCase();

    if (indianResults.length < 2 && query.length >= 2 && query.length < 5) {
      const candidates = [`${upperQuery}.NS`, `${upperQuery}.BO`, `${upperQuery}INFRA.NS`, `${upperQuery}INFRA.BO` ];
      for (const symbol of candidates) {
        try {
          const q = await yahooFinance.quote(symbol) as any;
          if (q && q.symbol) {
            const existingSymbols = new Set(result.quotes.map((q: any) => q.symbol));
            if (!existingSymbols.has(q.symbol)) {
              result.quotes.push({ symbol: q.symbol, shortname: q.shortName, longname: q.longName, exchange: q.exchangeName });
            }
          }
        } catch (e) { }
      }
    }

    const mappedResults = (result.quotes as any[])
      .filter(q => q.symbol)
      .map(q => {
        let score = 0;
        const symbol = q.symbol as string;
        const name = (q.shortname || q.longname || '') as string;
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

    return mappedResults.map(({ score, isIndian, ...rest }) => rest);
  } catch (error) {
    console.error(`Error searching for ${query}:`, error);
    return [];
  }
}
