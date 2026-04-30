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
import { Sparkles, Loader2, Copy, Check, FileText } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useI18n } from "@/lib/i18n";
import { summarize } from "@/server/summarize.functions";

export const Route = createFileRoute("/summarize")({
  component: SummarizePage,
  head: () => ({
    meta: [
      { title: "Summarizer — Listable by Listly" },
      {
        name: "description",
        content:
          "Free AI summarizer for websites, apps, and text. Get summaries, descriptions, key points, or TL;DRs in any language.",
      },
    ],
  }),
});

function SummarizePage() {
  const { t, lang } = useI18n();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"summary" | "description" | "keypoints" | "tldr" | "code">("summary");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const run = async () => {
    if (!input.trim()) {
      toast.error("Paste a URL or text first");
      return;
    }
    setLoading(true);
    setResult("");
    try {
      const r = await summarize({ data: { input: input.trim(), mode, length, lang } });
      setResult(r.text);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(result);
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
            <FileText className="h-7 w-7 text-primary" />
            {t("sum_title")}
          </h2>
          <p className="text-muted-foreground">{t("sum_sub")}</p>
        </div>

        <section className="space-y-2">
          <label className="text-sm font-medium">{t("sum_input_label")}</label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "code" ? t("sum_input_code_ph") : t("sum_input_ph")}
            rows={8}
            className="text-base"
          />
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">{t("sum_mode")}</label>
            <Select value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">{t("mode_summary")}</SelectItem>
                <SelectItem value="description">{t("mode_description")}</SelectItem>
                <SelectItem value="keypoints">{t("mode_keypoints")}</SelectItem>
                <SelectItem value="tldr">{t("mode_tldr")}</SelectItem>
                <SelectItem value="code">{t("mode_code")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">{t("sum_length")}</label>
            <Select value={length} onValueChange={(v) => setLength(v as typeof length)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="short">{t("len_short")}</SelectItem>
                <SelectItem value="medium">{t("len_medium")}</SelectItem>
                <SelectItem value="long">{t("len_long")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={run} disabled={loading} className="w-full h-10">
              {loading ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-1.5" />
              )}
              {t("sum_go")}
            </Button>
          </div>
        </div>

        {(result || loading) && (
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t("sum_result")}</label>
              {result && (
                <Button size="sm" variant="secondary" onClick={copy}>
                  {copied ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
                  {t("copy")}
                </Button>
              )}
            </div>
            <Card className="p-4 min-h-32">
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> …
                </div>
              ) : (
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{result}</div>
              )}
            </Card>
          </section>
        )}
      </main>
    </div>
  );
}
