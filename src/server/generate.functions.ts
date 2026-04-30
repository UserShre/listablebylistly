import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  listName: z.string().min(1).max(300),
  columns: z.array(z.string().min(1).max(60)).min(1).max(10),
  count: z.number().int().min(1).max(100),
});

export const generateList = createServerFn({ method: "POST" })
  .inputValidator((data) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const { listName, columns, count } = data;

    const properties: Record<string, { type: string; description: string }> = {};
    for (const c of columns) {
      properties[c] = { type: "string", description: `Value for "${c}"` };
    }

    const tool = {
      type: "function",
      function: {
        name: "return_list",
        description: "Return the requested list as structured rows",
        parameters: {
          type: "object",
          properties: {
            rows: {
              type: "array",
              items: {
                type: "object",
                properties,
                required: columns,
                additionalProperties: false,
              },
            },
          },
          required: ["rows"],
          additionalProperties: false,
        },
      },
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content:
              "Generate accurate, factual lists fast. Keep each cell short (1-6 words). Use 'N/A' if unknown. Never invent data.",
          },
          {
            role: "user",
            content: `List: "${listName}". Return exactly ${count} rows with columns: ${columns.map((c) => `"${c}"`).join(", ")}. Order logically (rank/popularity/date).`,
          },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "return_list" } },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error("Rate limit reached. Try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Settings → Workspace → Usage.");
      throw new Error(`AI request failed [${res.status}]: ${body.slice(0, 200)}`);
    }

    const json = await res.json();
    const call = json.choices?.[0]?.message?.tool_calls?.[0];
    if (!call?.function?.arguments) throw new Error("AI returned no structured data");

    const parsed = JSON.parse(call.function.arguments);
    const rows = (parsed.rows ?? []) as Array<Record<string, string>>;

    // Normalize: ensure every row has every column as a string
    const normalized = rows.map((r) => {
      const out: Record<string, string> = {};
      for (const c of columns) out[c] = String(r[c] ?? "");
      return out;
    });

    return { rows: normalized };
  });
