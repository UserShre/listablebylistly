import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Action = z.enum([
  "create",
  "rewrite",
  "extend",
  "shorten",
  "improve",
  "fix",
  "formal",
  "casual",
  "simplify",
  "translate",
  "continue",
]);

const InputSchema = z.object({
  text: z.string().max(20000).default(""),
  action: Action,
  instruction: z.string().max(2000).optional().default(""),
  lang: z.string().min(2).max(8),
});

export const editText = createServerFn({ method: "POST" })
  .inputValidator((data) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const guide: Record<z.infer<typeof Action>, string> = {
      create: "Write a new piece of text based on the user's instruction. If no current text is provided, create from scratch.",
      rewrite: "Rewrite the text keeping the same meaning but with fresh wording and structure.",
      extend: "Expand the text with more detail, examples, and depth — roughly 1.5×–2× longer. Stay on topic.",
      shorten: "Shorten the text to about half its length without losing the core message.",
      improve: "Improve clarity, flow, word choice, and tone. Keep the meaning.",
      fix: "Fix grammar, spelling, and punctuation. Make minimal stylistic changes.",
      formal: "Rewrite in a more formal, professional tone.",
      casual: "Rewrite in a friendlier, more casual tone.",
      simplify: "Simplify the language so a 12-year-old could easily understand it.",
      translate: "Translate the text faithfully into the target language.",
      continue: "Continue the text naturally from where it ends, matching tone and style.",
    };

    const system =
      `You are a careful, multilingual writing assistant. ${guide[data.action]} ` +
      `Reply ONLY with the final text — no preamble, no quotes, no explanations, no markdown code fences. ` +
      `Output language code: "${data.lang}".`;

    const user =
      (data.text.trim() ? `Current text:\n"""\n${data.text.trim()}\n"""\n\n` : "Current text: (empty)\n\n") +
      (data.instruction.trim()
        ? `User instruction: ${data.instruction.trim()}`
        : "User instruction: (none — apply the action with sensible defaults)");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
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
