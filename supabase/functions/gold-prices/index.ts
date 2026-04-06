import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function fetchYahooData(symbol: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1y`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${symbol}: ${res.status}`);
  }
  const body = await res.json();
  const result = body.chart.result[0];
  const quote = result.indicators.quote[0];
  
  // Map historical data
  const history = result.timestamp.map((ts: number, index: number) => {
    return {
      time: ts, // unix timestamp in seconds
      open: quote.open[index] || 0,
      high: quote.high[index] || 0,
      low: quote.low[index] || 0,
      close: quote.close[index] || 0,
      volume: quote.volume[index] || 0,
    };
  }).filter((c: any) => c.close !== 0 && c.close !== null); // Remove empty data points

  // Latest snapshot info
  const latestClose = result.meta.regularMarketPrice;
  const previousClose = result.meta.previousClose;
  const change = latestClose - previousClose;
  const changePercent = (change / previousClose) * 100;
  
  // Use the very last candle for latest O/H/L
  const lastCandle = history[history.length - 1];

  return {
    latestOpen: lastCandle.open,
    latestHigh: lastCandle.high,
    latestLow: lastCandle.low,
    latestClose: latestClose,
    previousClose: previousClose,
    change: change,
    changePercent: changePercent,
    history: history
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type } = await req.json();

    if (type === "latest") {
      const [xauData, xagData] = await Promise.all([
        fetchYahooData("GC=F"), // Gold Futures
        fetchYahooData("SI=F"), // Silver Futures
      ]);

      const now = Math.floor(Date.now() / 1000);
      const todayStr = new Date().toISOString().split("T")[0];

      return new Response(JSON.stringify({
        success: true,
        prices: {
          XAU: xauData.latestClose,
          XAG: xagData.latestClose,
          goldSilverRatio: xauData.latestClose / xagData.latestClose,
          XAU_open: xauData.latestOpen,
          XAU_high: xauData.latestHigh,
          XAU_low: xauData.latestLow,
          XAU_prev_close: xauData.previousClose,
          XAU_change: xauData.change,
          XAU_changePercent: xauData.changePercent,
          XAG_open: xagData.latestOpen,
          XAG_high: xagData.latestHigh,
          XAG_low: xagData.latestLow,
          XAG_prev_close: xagData.previousClose,
          XAG_change: xagData.change,
          XAG_changePercent: xagData.changePercent,
        },
        history: {
          XAU: xauData.history,
          XAG: xagData.history
        },
        timestamp: now,
        date: todayStr,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid request type. Use 'latest'.");
  } catch (error) {
    console.error("Gold prices error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
