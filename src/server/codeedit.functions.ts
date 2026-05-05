import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Action = z.enum([
  "create",
  "refactor",
  "optimize",
  "fix",
  "explain",
  "comment",
  "uncomment",
  "shorten",
  "extend",
  "test",
  "convert",
  "continue",
]);

const InputSchema = z.object({
  code: z.string().max(40000).default(""),
  action: Action,
  instruction: z.string().max(2000).optional().default(""),
  language: z.string().min(1).max(40),
  lang: z.string().min(2).max(8),
});

export const editCode = createServerFn({ method: "POST" })
  .inputValidator((data) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const guide: Record<z.infer<typeof Action>, string> = {
      create: "Write new code from scratch based on the user's instruction.",
      refactor: "Refactor the code for clarity and structure without changing behavior.",
      optimize: "Optimize the code for performance and efficiency, keeping behavior identical.",
      fix: "Find and fix bugs, syntax errors, and logic issues. Keep the original intent.",
      explain: "Explain what the code does in clear plain language. Reply with the explanation only — not code.",
      comment: "Add helpful inline comments and docstrings throughout. Keep the code unchanged otherwise.",
      uncomment: "Remove all comments and docstrings while keeping the code working.",
      shorten: "Shorten the code, removing redundancy while keeping it readable and correct.",
      extend: "Extend the code with sensible additional features or edge-case handling related to the existing logic.",
      test: "Write unit tests for the given code. Reply with only the test code, in an idiomatic test framework for the language.",
      convert: "Convert the code to the requested target language (named in the user's instruction or the language field).",
      continue: "Continue writing the code naturally from where it ends, matching style and conventions.",
    };

    const isExplain = data.action === "explain";

    const system =
      `You are an expert ${data.language} engineer and multilingual code assistant. ${guide[data.action]} ` +
      (isExplain
        ? `Reply ONLY with the explanation as plain text. Do NOT include code blocks unless strictly necessary. Use language code "${data.lang}".`
        : `Reply ONLY with the final code — no preamble, no explanations, no markdown code fences, no backticks. ` +
          `Default target language: ${data.language}. If user instruction specifies another language, follow it.`);

    const user =
      (data.code.trim()
        ? `Current code (${data.language}):\n"""\n${data.code.trim()}\n"""\n\n`
        : "Current code: (empty)\n\n") +
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
      if (res.status === 402)
        throw new Error("AI credits exhausted. Add credits in Settings → Workspace → Usage.");
      throw new Error(`AI request failed [${res.status}]: ${body.slice(0, 200)}`);
    }

    const json = await res.json();
    let text = json.choices?.[0]?.message?.content?.trim() ?? "";
    // Strip accidental markdown fences
    text = text.replace(/^```[a-zA-Z0-9_+-]*\n?/, "").replace(/\n?```$/, "");
    if (!text) throw new Error("AI returned empty response");
    return { code: text };
  });
