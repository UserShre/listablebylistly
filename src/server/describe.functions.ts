import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  topic: z.string().min(1).max(2000),
  kind: z.enum(["product", "website", "app", "person", "place", "event", "general"]),
  tone: z.enum(["neutral", "professional", "friendly", "playful", "luxury", "technical"]),
  words: z.number().int().min(5).max(500),
  lang: z.string().min(2).max(8),
});

export const describe = createServerFn({ method: "POST" })
  .inputValidator((data) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const { topic, kind, tone, words, lang } = data;
    const min = Math.max(5, Math.floor(words * 0.9));
    const max = Math.ceil(words * 1.1);

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
            content: `You write polished descriptions. Subject type: ${kind}. Tone: ${tone}. Target: about ${words} words (between ${min} and ${max}). Reply ONLY in language code "${lang}". Output the description only — no preamble, no quotes, no headings.`,
          },
          {
            role: "user",
            content: `Write a description of: ${topic}`,
          },
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
    const text = (json.choices?.[0]?.message?.content ?? "").trim();
    if (!text) throw new Error("AI returned empty response");
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    return { text, wordCount };
  });
