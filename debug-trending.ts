import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({
  validation: {
    logErrors: true // Enable for debugging
  }
});

async function debug() {
  console.log('--- Testing US Region ---');
  try {
    const usResult = await yahooFinance.trendingSymbols('US');
    console.log('US Success! Found:', usResult.quotes.length, 'symbols');
    console.log('First 3 US Symbols:', usResult.quotes.slice(0, 3).map(q => q.symbol));
  } catch (e) {
    console.log('US Failed');
  }

  console.log('\n--- Testing IN Region ---');
  try {
    // Some regions might require the second argument (options)
    const inResult = await yahooFinance.trendingSymbols('IN');
    console.log('IN Success! Found:', inResult.quotes.length, 'symbols');
    console.log('First 3 IN Symbols:', inResult.quotes.slice(0, 3).map(q => q.symbol));
  } catch (e: any) {
    console.log('IN Failed with message:', e.message);
    // If it's a validation error, the raw result is often in the error object
    if (e.result) {
      console.log('Raw result from IN:', e.result);
    }
  }
}

debug();
