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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { goldPrice, silverPrice } = await req.json();
    const today = new Date().toISOString().split("T")[0];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a precious metals market analyst. Today is ${today}. XAU/USD is around $${goldPrice || 3100} and XAG/USD is around $${silverPrice || 34}. Generate 5-6 expert analyses from REAL well-known precious metals analysts and strategists. Use real people who are known in the gold/commodities space (e.g., Peter Schiff, Ole Hansen, Nicky Shiels, Carsten Menke, Jeff Currie, etc.). Make the analyses realistic and reflect current market conditions.`,
          },
          {
            role: "user",
            content: `Generate expert analyses as JSON. Each: id (string), expertName (string - real analyst), expertTitle (string - real title/firm), instrument ("XAU/USD" or "XAG/USD"), signal ("Strong Buy"|"Buy"|"Neutral"|"Sell"|"Strong Sell"), targetPrice (number), stopLoss (number or null), timeframe (string like "1M", "3M"), analysis (string, 2-3 sentences of realistic analysis), publishedAt (ISO date string within last 7 days), accuracy (number 60-85).`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_analyses",
              description: "Return expert analyses",
              parameters: {
                type: "object",
                properties: {
                  analyses: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        expertName: { type: "string" },
                        expertTitle: { type: "string" },
                        instrument: { type: "string" },
                        signal: { type: "string", enum: ["Strong Buy", "Buy", "Neutral", "Sell", "Strong Sell"] },
                        targetPrice: { type: "number" },
                        stopLoss: { type: "number" },
                        timeframe: { type: "string" },
                        analysis: { type: "string" },
                        publishedAt: { type: "string" },
                        accuracy: { type: "number" },
                      },
                      required: ["id", "expertName", "expertTitle", "instrument", "signal", "targetPrice", "timeframe", "analysis", "publishedAt", "accuracy"],
                    },
                  },
                },
                required: ["analyses"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_analyses" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call response from AI");

    const parsed = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ success: true, analyses: parsed.analyses }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Expert analysis error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
