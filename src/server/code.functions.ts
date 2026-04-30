import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  prompt: z.string().min(1).max(4000),
  language: z.string().min(1).max(40),
  style: z.enum(["concise", "commented", "production"]),
});

export const generateCode = createServerFn({ method: "POST" })
  .inputValidator((data) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const { prompt, language, style } = data;

    const styleGuide = {
      concise: "Keep it minimal — no comments unless essential.",
      commented: "Add helpful inline comments explaining key parts.",
      production: "Write production-quality code: error handling, types, edge cases.",
    }[style];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert programmer. Output ONLY a single fenced code block in ${language}. ${styleGuide} No prose before or after the code block.`,
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error("Rate limit reached. Try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Settings → Workspace → Usage.");
      throw new Error(`AI request failed [${res.status}]: ${body.slice(0, 200)}`);
    }

    const json = await res.json();
    let text = (json.choices?.[0]?.message?.content ?? "").trim();
    // Strip surrounding fenced code block if present
    const fence = text.match(/^```[a-zA-Z0-9_-]*\n([\s\S]*?)\n```$/);
    if (fence) text = fence[1].trim();
    if (!text) throw new Error("AI returned empty response");
    return { code: text };
  });
