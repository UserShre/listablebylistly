import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Wand2,
  Loader2,
  Copy,
  Check,
  Undo2,
  RefreshCw,
  Maximize2,
  Minimize2,
  Sparkles,
  CheckCheck,
  Briefcase,
  Smile,
  Baby,
  Languages,
  ArrowRightToLine,
  PenLine,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site-header";
import { useI18n } from "@/lib/i18n";
import { editText } from "@/server/edit.functions";

export const Route = createFileRoute("/edit")({
  component: EditPage,
  head: () => ({
    meta: [
      { title: "AI Text Editor — Listable by Listly" },
      {
        name: "description",
        content:
          "Write, rewrite, extend, shorten, improve, translate or continue any text with AI.",
      },
    ],
  }),
});

type Action =
  | "create"
  | "rewrite"
  | "extend"
  | "shorten"
  | "improve"
  | "fix"
  | "formal"
  | "casual"
  | "simplify"
  | "translate"
  | "continue";

function EditPage() {
  const { t, lang } = useI18n();
  const [text, setText] = useState("");
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState<Action | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const run = async (action: Action) => {
    if (action !== "create" && !text.trim()) {
      toast.error(t("edit_need_text"));
      return;
    }
    setBusy(action);
    try {
      const result = await editText({
        data: { text, action, instruction, lang },
      });
      setHistory((h) => [...h, text]);
      setText(result.text);
      toast.success(t("edit_done"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  };

  const undo = () => {
    setHistory((h) => {
      if (!h.length) return h;
      const prev = h[h.length - 1];
      setText(prev);
      return h.slice(0, -1);
    });
  };

  const copy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(t("copy"));
    setTimeout(() => setCopied(false), 1500);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const actions: { key: Action; icon: typeof Wand2; label: string }[] = [
    { key: "create", icon: Sparkles, label: t("act_create") },
    { key: "rewrite", icon: RefreshCw, label: t("act_rewrite") },
    { key: "extend", icon: Maximize2, label: t("act_extend") },
    { key: "shorten", icon: Minimize2, label: t("act_shorten") },
    { key: "improve", icon: Wand2, label: t("act_improve") },
    { key: "fix", icon: CheckCheck, label: t("act_fix") },
    { key: "formal", icon: Briefcase, label: t("act_formal") },
    { key: "casual", icon: Smile, label: t("act_casual") },
    { key: "simplify", icon: Baby, label: t("act_simplify") },
    { key: "translate", icon: Languages, label: t("act_translate") },
    { key: "continue", icon: ArrowRightToLine, label: t("act_continue") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
            <PenLine className="h-7 w-7 text-primary" />
            {t("edit_title")}
          </h1>
          <p className="text-muted-foreground">{t("edit_sub")}</p>
        </header>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t("edit_text_label")}</label>
            <span className="text-xs text-muted-foreground tabular-nums">
              {wordCount} {t("desc_words_count")}
            </span>
          </div>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("edit_text_ph")}
            rows={12}
            className="font-sans text-base leading-relaxed"
          />
        </section>

        <section className="space-y-2">
          <label className="text-sm font-medium">{t("edit_instruction_label")}</label>
          <Input
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder={t("edit_instruction_ph")}
          />
        </section>

        <Card className="p-4 space-y-3 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
          <div className="text-sm font-medium flex items-center gap-1.5">
            <Wand2 className="h-4 w-4 text-primary" />
            {t("edit_actions")}
          </div>
          <div className="flex flex-wrap gap-2">
            {actions.map(({ key, icon: Icon, label }) => (
              <Button
                key={key}
                size="sm"
                variant={key === "create" ? "default" : "secondary"}
                disabled={busy !== null}
                onClick={() => run(key)}
              >
                {busy === key ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                {label}
              </Button>
            ))}
          </div>
        </Card>

        <div className="flex flex-wrap gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={!history.length}
          >
            <Undo2 className="h-4 w-4" />
            {t("edit_undo")}
          </Button>
          <Button variant="secondary" size="sm" onClick={copy} disabled={!text}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {t("copy")}
          </Button>
        </div>

        <footer className="pt-6 pb-4 text-center text-xs text-muted-foreground">
          {t("footer")}
        </footer>
      </main>
    </div>
  );
}
