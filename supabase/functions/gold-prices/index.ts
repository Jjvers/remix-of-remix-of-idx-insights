import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const METALPRICE_API_KEY = Deno.env.get("METALPRICE_API_KEY");
    if (!METALPRICE_API_KEY) {
      throw new Error("METALPRICE_API_KEY is not configured");
    }

    const { type } = await req.json();

    if (type === "latest") {
      const url = `https://api.metalpriceapi.com/v1/latest?api_key=${METALPRICE_API_KEY}&base=USD&currencies=XAU,XAG`;
      const res = await fetch(url);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("MetalpriceAPI error:", res.status, errorText);
        throw new Error(`MetalpriceAPI error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      console.log("MetalpriceAPI response:", JSON.stringify(data));

      if (!data.success) {
        throw new Error(`MetalpriceAPI error: ${data.message || "Unknown error"}`);
      }

      // MetalpriceAPI returns rates as 1/price (e.g. XAU: 0.00030 means 1 USD = 0.00030 oz)
      // So gold price per oz = 1 / rate
      const xauRate = data.rates?.XAU;
      const xagRate = data.rates?.XAG;

      if (!xauRate || !xagRate) {
        throw new Error("Invalid rate data from MetalpriceAPI");
      }

      // Check if there's a USDXAU key (direct price) or compute from inverse
      const goldPrice = data.rates?.USDXAU || (1 / xauRate);
      const silverPrice = data.rates?.USDXAG || (1 / xagRate);

      const now = Math.floor(Date.now() / 1000);
      const todayStr = new Date().toISOString().split("T")[0];

      // Simulate OHLC from spot price (MetalpriceAPI only gives spot)
      const xauSpread = goldPrice * 0.003; // ~0.3% spread for OHLC approximation
      const xagSpread = silverPrice * 0.005;

      return new Response(JSON.stringify({
        success: true,
        prices: {
          XAU: goldPrice,
          XAG: silverPrice,
          goldSilverRatio: goldPrice / silverPrice,
          XAU_open: goldPrice - (Math.random() - 0.5) * xauSpread,
          XAU_high: goldPrice + Math.random() * xauSpread,
          XAU_low: goldPrice - Math.random() * xauSpread,
          XAU_prev_close: goldPrice - (Math.random() - 0.3) * xauSpread * 2,
          XAU_change: 0,
          XAU_changePercent: 0,
          XAG_open: silverPrice - (Math.random() - 0.5) * xagSpread,
          XAG_high: silverPrice + Math.random() * xagSpread,
          XAG_low: silverPrice - Math.random() * xagSpread,
          XAG_prev_close: silverPrice - (Math.random() - 0.3) * xagSpread * 2,
          XAG_change: 0,
          XAG_changePercent: 0,
        },
        timestamp: data.timestamp || now,
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
