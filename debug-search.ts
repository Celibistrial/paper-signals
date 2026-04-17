import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

async function debug() {
  const query = 'RELINFRA.NS';
  console.log(`Getting quote for: "${query}"`);
  try {
    const result = await yahooFinance.quote(query);
    console.log('Quote:', { symbol: result.symbol, name: result.shortName });
  } catch {
    console.log('Not found');
  }
}

debug();
