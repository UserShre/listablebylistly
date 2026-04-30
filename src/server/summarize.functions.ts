import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  input: z.string().min(1).max(20000),
  mode: z.enum(["summary", "description", "keypoints", "tldr", "code"]),
  length: z.enum(["short", "medium", "long"]),
  lang: z.string().min(2).max(8),
});

function isUrl(s: string) {
  try {
    const u = new URL(s.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

async function fetchUrlText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 ListableBot/1.0" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Could not fetch URL (${res.status})`);
  const html = await res.text();
  // Strip scripts/styles, then tags
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.slice(0, 12000);
}

export const summarize = createServerFn({ method: "POST" })
  .inputValidator((data) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    let source = data.input.trim();
    let kind: "url" | "text" | "code" = "text";
    if (data.mode === "code") {
      kind = "code";
    } else if (isUrl(source)) {
      kind = "url";
      try {
        source = await fetchUrlText(source);
      } catch (e) {
        throw new Error(e instanceof Error ? e.message : "URL fetch failed");
      }
      if (!source) throw new Error("No readable content found at that URL");
    }

    const lengthGuide = {
      short: "1-2 concise sentences",
      medium: "a short paragraph (3-5 sentences)",
      long: "2-3 detailed paragraphs",
    }[data.length];

    const modeGuide = {
      summary: "Write a faithful summary of the content.",
      description: "Write a clear description of what this is and what it does.",
      keypoints: "Return the key points as a markdown bullet list.",
      tldr: "Write a single-line TL;DR.",
      code: "Summarize what this code does: its purpose, main functions/classes, inputs, outputs, and notable logic. Use a markdown bullet list.",
    }[data.mode];

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
            content: `You are a precise multilingual writer. ${modeGuide} Length: ${lengthGuide}. Reply ONLY in language code "${data.lang}". No preamble, no quotes around the answer.`,
          },
          {
            role: "user",
            content: `Source type: ${kind}\n\nContent:\n${source}`,
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
    const text = json.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) throw new Error("AI returned empty response");
    return { text };
  });
