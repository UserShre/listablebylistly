import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Sparkles, Loader2, Copy, Check, PenLine } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useI18n } from "@/lib/i18n";
import { describe } from "@/server/describe.functions";

export const Route = createFileRoute("/describe")({
  component: DescribePage,
  head: () => ({
    meta: [
      { title: "Description Maker — Listable by Listly" },
      {
        name: "description",
        content:
          "Free AI description generator. Create descriptions for products, websites, apps, people, places and events with custom tone and word count.",
      },
    ],
  }),
});

function DescribePage() {
  const { t, lang } = useI18n();
  const [topic, setTopic] = useState("");
  const [kind, setKind] = useState<"product" | "website" | "app" | "person" | "place" | "event" | "general">("product");
  const [tone, setTone] = useState<"neutral" | "professional" | "friendly" | "playful" | "luxury" | "technical">("professional");
  const [words, setWords] = useState(60);
  const [result, setResult] = useState("");
  const [actualWords, setActualWords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const run = async () => {
    if (!topic.trim()) {
      toast.error("Tell me what to describe");
      return;
    }
    setLoading(true);
    setResult("");
    try {
      const r = await describe({ data: { topic: topic.trim(), kind, tone, words, lang } });
      setResult(r.text);
      setActualWords(r.wordCount);
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
            <PenLine className="h-7 w-7 text-primary" />
            {t("desc_title")}
          </h2>
          <p className="text-muted-foreground">{t("desc_sub")}</p>
        </div>

        <section className="space-y-2">
          <label className="text-sm font-medium">{t("desc_topic_label")}</label>
          <Textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t("desc_topic_ph")}
            rows={4}
            className="text-base"
          />
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">{t("desc_kind")}</label>
            <Select value={kind} onValueChange={(v) => setKind(v as typeof kind)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="product">{t("kind_product")}</SelectItem>
                <SelectItem value="website">{t("kind_website")}</SelectItem>
                <SelectItem value="app">{t("kind_app")}</SelectItem>
                <SelectItem value="person">{t("kind_person")}</SelectItem>
                <SelectItem value="place">{t("kind_place")}</SelectItem>
                <SelectItem value="event">{t("kind_event")}</SelectItem>
                <SelectItem value="general">{t("kind_general")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">{t("desc_tone")}</label>
            <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="neutral">{t("tone_neutral")}</SelectItem>
                <SelectItem value="professional">{t("tone_professional")}</SelectItem>
                <SelectItem value="friendly">{t("tone_friendly")}</SelectItem>
                <SelectItem value="playful">{t("tone_playful")}</SelectItem>
                <SelectItem value="luxury">{t("tone_luxury")}</SelectItem>
                <SelectItem value="technical">{t("tone_technical")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">{t("desc_words")}</label>
            <Input
              type="number"
              min={5}
              max={500}
              value={words}
              onChange={(e) => setWords(Math.max(5, Math.min(500, Number(e.target.value) || 5)))}
              className="h-10"
            />
          </div>
        </div>

        <Button onClick={run} disabled={loading} className="w-full h-10">
          {loading ? (
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-1.5" />
          )}
          {t("desc_go")}
        </Button>

        {(result || loading) && (
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                {t("desc_result")}
                {result && (
                  <span className="ml-2 text-xs text-muted-foreground font-normal">
                    {actualWords} {t("desc_words_count")}
                  </span>
                )}
              </label>
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
