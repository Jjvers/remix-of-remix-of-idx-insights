async function testAll() {
  try {
    const r1 = await fetch('https://stooq.com/q/l/?s=xauusd&f=sd2t2ohlcv&h&e=csv');
    const t1 = await r1.text();
    const lines = t1.trim().split('\n');
    console.log("Stooq XAUUSD header:", lines[0]);
    console.log("Stooq XAUUSD data:", lines[1]);
    // CSV format: Symbol,Date,Time,Open,High,Low,Close,Volume
    const vals = lines[1].split(',');
    console.log("XAUUSD Close:", vals[6]);
    console.log("XAUUSD Date:", vals[1], vals[2]);
  } catch (e) { console.error("Stooq fail:", e.message); }
  
  try {
    const r2 = await fetch('https://stooq.com/q/l/?s=xagusd&f=sd2t2ohlcv&h&e=csv');
    const t2 = await r2.text();
    const lines = t2.trim().split('\n');
    const vals = lines[1].split(',');
    console.log("XAGUSD Close:", vals[6]);
  } catch (e) { console.error("Stooq XAG fail:", e.message); }
  
  try {
    const r3 = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=2m&range=1d', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const d3 = await r3.json();
    const meta = d3.chart.result[0].meta;
    console.log("Yahoo GC=F 2m price:", meta.regularMarketPrice, "at", new Date(meta.regularMarketTime * 1000).toISOString());
  } catch (e) { console.error("Yahoo 2m fail:", e.message); }
}
testAll();
