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
            content: `You are a financial calendar analyst. Today is ${today}. Generate 8-10 upcoming real economic events that impact gold prices. Use REAL scheduled events from the global economic calendar (FOMC, CPI, NFP, ECB, PMI, GDP, etc.). Events should span from today to 14 days ahead. Be accurate with typical release times.`,
          },
          {
            role: "user",
            content: `Generate upcoming economic events as JSON. Each event: id (string), title (string), type (string - e.g. "Fed Meeting", "CPI Release", "NFP", "PMI", "GDP", "Other"), date (ISO string), time (string like "13:30 UTC"), country (2-letter code: US, EU, CN, GB, JP), impact ("High"|"Medium"|"Low"), description (string, 1 sentence about gold impact), previous (string or null), forecast (string or null).`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_events",
              description: "Return economic calendar events",
              parameters: {
                type: "object",
                properties: {
                  events: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        title: { type: "string" },
                        type: { type: "string" },
                        date: { type: "string" },
                        time: { type: "string" },
                        country: { type: "string" },
                        impact: { type: "string", enum: ["High", "Medium", "Low"] },
                        description: { type: "string" },
                        previous: { type: "string" },
                        forecast: { type: "string" },
                      },
                      required: ["id", "title", "type", "date", "time", "country", "impact", "description"],
                    },
                  },
                },
                required: ["events"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_events" } },
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

    return new Response(JSON.stringify({ success: true, events: parsed.events }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Economic calendar error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
