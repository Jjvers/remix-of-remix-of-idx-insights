import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const InstrumentSchema = z.enum(["XAU/USD", "XAG/USD"]);
const RequestSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("latest"),
  }),
  z.object({
    type: z.literal("history"),
    instrument: InstrumentSchema,
    range: z.enum(["5d", "1mo", "3mo", "6mo", "1y"]),
    interval: z.enum(["5m", "15m", "60m", "1d"]),
  }),
]);

type Instrument = z.infer<typeof InstrumentSchema>;

const instrumentMap: Record<Instrument, { yahoo: string; swissquote: string }> = {
  "XAU/USD": { yahoo: "GC=F", swissquote: "XAU/USD" },
  "XAG/USD": { yahoo: "SI=F", swissquote: "XAG/USD" },
};

type ParsedQuote = {
  bid: number;
  ask: number;
  mid: number;
  timestamp: number;
};

type Candle = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

async function fetchJson(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }

  return response.json();
}

async function fetchSwissquoteQuote(instrument: Instrument): Promise<ParsedQuote> {
  const endpoint = `https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/${instrumentMap[instrument].swissquote}`;
  const data = await fetchJson(endpoint);

  const quote = data?.[0]?.spreadProfilePrices?.find((entry: any) => entry.spreadProfile === "premium")
    ?? data?.[0]?.spreadProfilePrices?.[0];

  if (!quote || typeof quote.bid !== "number" || typeof quote.ask !== "number") {
    throw new Error(`Invalid Swissquote quote for ${instrument}`);
  }

  return {
    bid: quote.bid,
    ask: quote.ask,
    mid: (quote.bid + quote.ask) / 2,
    timestamp: Math.floor((data?.[0]?.ts ?? Date.now()) / 1000),
  };
}

async function fetchYahooChart(instrument: Instrument, range: string, interval: string) {
  const symbol = instrumentMap[instrument].yahoo;
  const endpoint = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`;
  const data = await fetchJson(endpoint);
  const result = data?.chart?.result?.[0];

  if (!result) {
    const description = data?.chart?.error?.description ?? "No Yahoo chart data";
    throw new Error(`${symbol} chart error: ${description}`);
  }

  return result;
}

function extractCandles(chartData: any): Candle[] {
  const timestamps: number[] = chartData?.timestamp ?? [];
  const quote = chartData?.indicators?.quote?.[0] ?? {};

  return timestamps.flatMap((timestamp, index) => {
    const open = quote.open?.[index];
    const high = quote.high?.[index];
    const low = quote.low?.[index];
    const close = quote.close?.[index];
    const volume = quote.volume?.[index] ?? 0;

    if ([open, high, low, close].some((value) => typeof value !== "number")) {
      return [];
    }

    return [{
      timestamp,
      open,
      high,
      low,
      close,
      volume: typeof volume === "number" ? volume : 0,
    }];
  });
}

function buildSessionLevels(spotPrice: number, chartData: any, candles: Candle[]) {
  const lastChartClose = candles[candles.length - 1]?.close ?? chartData?.meta?.regularMarketPrice ?? spotPrice;
  const scale = lastChartClose ? spotPrice / lastChartClose : 1;
  const firstOpen = candles[0]?.open ?? chartData?.meta?.regularMarketOpen ?? lastChartClose;
  const highBase = chartData?.meta?.regularMarketDayHigh ?? Math.max(...candles.map((candle) => candle.high));
  const lowBase = chartData?.meta?.regularMarketDayLow ?? Math.min(...candles.map((candle) => candle.low));
  const previousCloseBase = chartData?.meta?.chartPreviousClose ?? candles[candles.length - 2]?.close ?? lastChartClose;

  return {
    open: firstOpen * scale,
    high: highBase * scale,
    low: lowBase * scale,
    previousClose: previousCloseBase * scale,
  };
}

function scaleCandles(candles: Candle[], livePrice: number): Candle[] {
  if (!candles.length) return [];

  const lastBaseClose = candles[candles.length - 1].close;
  const scale = lastBaseClose ? livePrice / lastBaseClose : 1;

  return candles.map((candle, index) => {
    const scaledCandle = {
      timestamp: candle.timestamp,
      open: candle.open * scale,
      high: candle.high * scale,
      low: candle.low * scale,
      close: candle.close * scale,
      volume: candle.volume,
    };

    if (index !== candles.length - 1) {
      return scaledCandle;
    }

    return {
      ...scaledCandle,
      close: livePrice,
      high: Math.max(scaledCandle.high, livePrice),
      low: Math.min(scaledCandle.low, livePrice),
    };
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const requestBody = RequestSchema.safeParse(await req.json());

    if (!requestBody.success) {
      return new Response(JSON.stringify({ success: false, error: requestBody.error.flatten() }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = requestBody.data;

    if (payload.type === "latest") {
      const [xauQuote, xagQuote, xauChart, xagChart] = await Promise.all([
        fetchSwissquoteQuote("XAU/USD"),
        fetchSwissquoteQuote("XAG/USD"),
        fetchYahooChart("XAU/USD", "1d", "1m"),
        fetchYahooChart("XAG/USD", "1d", "1m"),
      ]);

      const xauCandles = extractCandles(xauChart);
      const xagCandles = extractCandles(xagChart);

      if (!xauCandles.length || !xagCandles.length) {
        throw new Error("No market candles available for latest price calculation");
      }

      const goldPrice = xauQuote.mid;
      const silverPrice = xagQuote.mid;
      const xauSession = buildSessionLevels(goldPrice, xauChart, xauCandles);
      const xagSession = buildSessionLevels(silverPrice, xagChart, xagCandles);
      const timestamp = Math.max(xauQuote.timestamp, xagQuote.timestamp);
      const todayStr = new Date(timestamp * 1000).toISOString().split("T")[0];

      return new Response(JSON.stringify({
        success: true,
        prices: {
          XAU: goldPrice,
          XAG: silverPrice,
          goldSilverRatio: goldPrice / silverPrice,
          XAU_bid: xauQuote.bid,
          XAU_ask: xauQuote.ask,
          XAU_open: xauSession.open,
          XAU_high: xauSession.high,
          XAU_low: xauSession.low,
          XAU_prev_close: xauSession.previousClose,
          XAU_change: goldPrice - xauSession.previousClose,
          XAU_changePercent: ((goldPrice - xauSession.previousClose) / xauSession.previousClose) * 100,
          XAG_bid: xagQuote.bid,
          XAG_ask: xagQuote.ask,
          XAG_open: xagSession.open,
          XAG_high: xagSession.high,
          XAG_low: xagSession.low,
          XAG_prev_close: xagSession.previousClose,
          XAG_change: silverPrice - xagSession.previousClose,
          XAG_changePercent: ((silverPrice - xagSession.previousClose) / xagSession.previousClose) * 100,
        },
        timestamp,
        date: todayStr,
        source: "Swissquote + Yahoo Finance",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (payload.type === "history") {
      const [quote, chartData] = await Promise.all([
        fetchSwissquoteQuote(payload.instrument),
        fetchYahooChart(payload.instrument, payload.range, payload.interval),
      ]);

      const rawCandles = extractCandles(chartData);

      if (!rawCandles.length) {
        throw new Error(`No historical candles available for ${payload.instrument}`);
      }

      const candles = scaleCandles(rawCandles, quote.mid);

      return new Response(JSON.stringify({
        success: true,
        instrument: payload.instrument,
        candles,
        timestamp: quote.timestamp,
        source: "Swissquote + Yahoo Finance",
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
