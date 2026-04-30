import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Sparkles, Loader2, Copy, Check, Code2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useI18n } from "@/lib/i18n";
import { generateCode } from "@/server/code.functions";

export const Route = createFileRoute("/code")({
  component: CodePage,
  head: () => ({
    meta: [
      { title: "Code Generator — Listable by Listly" },
      {
        name: "description",
        content:
          "Free AI code generator. Describe what you want and get clean code in any language.",
      },
    ],
  }),
});

const LANGUAGES = [
  "JavaScript", "TypeScript", "Python", "Java", "C", "C++", "C#", "Go",
  "Rust", "Ruby", "PHP", "Swift", "Kotlin", "HTML", "CSS", "SQL", "Bash", "JSON",
];

function CodePage() {
  const { t } = useI18n();
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("Python");
  const [style, setStyle] = useState<"concise" | "commented" | "production">("commented");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const run = async () => {
    if (!prompt.trim()) {
      toast.error("Describe what to build");
      return;
    }
    setLoading(true);
    setCode("");
    try {
      const r = await generateCode({ data: { prompt: prompt.trim(), language, style } });
      setCode(r.code);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Copied");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Code2 className="h-7 w-7 text-primary" />
            {t("code_title")}
          </h2>
          <p className="text-muted-foreground">{t("code_sub")}</p>
        </div>

        <section className="space-y-2">
          <label className="text-sm font-medium">{t("code_prompt_label")}</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t("code_prompt_ph")}
            rows={5}
            className="text-base"
          />
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">{t("code_language")}</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">{t("code_style")}</label>
            <Select value={style} onValueChange={(v) => setStyle(v as typeof style)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="concise">{t("style_concise")}</SelectItem>
                <SelectItem value="commented">{t("style_commented")}</SelectItem>
                <SelectItem value="production">{t("style_production")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={run} disabled={loading} className="w-full h-10">
          {loading ? (
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-1.5" />
          )}
          {t("code_go")}
        </Button>

        {(code || loading) && (
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t("code_result")}</label>
              {code && (
                <Button size="sm" variant="secondary" onClick={copy}>
                  {copied ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
                  {t("copy")}
                </Button>
              )}
            </div>
            <Card className="p-0 overflow-hidden">
              {loading ? (
                <div className="p-4 flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> …
                </div>
              ) : (
                <pre className="p-4 overflow-x-auto text-xs font-mono bg-muted/30 max-h-[600px]">
                  <code>{code}</code>
                </pre>
              )}
            </Card>
          </section>
        )}
      </main>
    </div>
  );
}
