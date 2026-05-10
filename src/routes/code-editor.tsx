import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Bug,
  MessageSquare,
  EyeOff,
  FlaskConical,
  Repeat,
  ArrowRightToLine,
  Code2,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site-header";
import { useI18n } from "@/lib/i18n";
import { editCode } from "@/server/codeedit.functions";

export const Route = createFileRoute("/code-editor")({
  component: CodeEditorPage,
  head: () => ({
    meta: [
      { title: "AI Code Editor — Listable by Listly" },
      {
        name: "description",
        content:
          "Refactor, optimize, fix, comment, test, convert or continue any code with AI.",
      },
    ],
  }),
});

type Action =
  | "create"
  | "refactor"
  | "optimize"
  | "fix"
  | "explain"
  | "comment"
  | "uncomment"
  | "shorten"
  | "extend"
  | "test"
  | "convert"
  | "continue";

const LANGUAGES = [
  "JavaScript", "TypeScript", "Python", "Java", "C", "C++", "C#", "Go",
  "Rust", "Ruby", "PHP", "Swift", "Kotlin", "HTML", "CSS", "SQL", "Bash", "JSON",
];

function CodeEditorPage() {
  const { lang } = useI18n();
  const [code, setCode] = useState("");
  const [instruction, setInstruction] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [busy, setBusy] = useState<Action | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [explanation, setExplanation] = useState("");

  const run = async (action: Action) => {
    if (action !== "create" && !code.trim()) {
      toast.error("Add some code first, or use Create.");
      return;
    }
    let effectiveInstruction = instruction;
    if (action === "convert") {
      const target = window.prompt("Convert into which language?", instruction || "Python");
      if (!target) return;
      effectiveInstruction = `Convert into ${target}. ${instruction}`.trim();
    }
    setBusy(action);
    setExplanation("");
    try {
      const result = await editCode({
        data: { code, action, instruction: effectiveInstruction, language, lang },
      });
      if (action === "explain") {
        setExplanation(result.code);
      } else {
        setHistory((h) => [...h, code]);
        setCode(result.code);
      }
      toast.success("Done");
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
      setCode(prev);
      return h.slice(0, -1);
    });
  };

  const copy = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Copied");
    setTimeout(() => setCopied(false), 1500);
  };

  const lineCount = code ? code.split("\n").length : 0;

  const actions: { key: Action; icon: typeof Wand2; label: string }[] = [
    { key: "create", icon: Sparkles, label: "Create" },
    { key: "refactor", icon: RefreshCw, label: "Refactor" },
    { key: "optimize", icon: Wand2, label: "Optimize" },
    { key: "fix", icon: Bug, label: "Fix bugs" },
    { key: "explain", icon: BookOpen, label: "Explain" },
    { key: "comment", icon: MessageSquare, label: "Add comments" },
    { key: "uncomment", icon: EyeOff, label: "Remove comments" },
    { key: "shorten", icon: Minimize2, label: "Shorten" },
    { key: "extend", icon: Maximize2, label: "Extend" },
    { key: "test", icon: FlaskConical, label: "Write tests" },
    { key: "convert", icon: Repeat, label: "Convert" },
    { key: "continue", icon: ArrowRightToLine, label: "Continue" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-6">
        <header className="space-y-2">
          <div className="text-3xl font-semibold tracking-tight flex items-center gap-2">
            <Code2 className="h-7 w-7 text-primary" />
            AI Code Editor
          </div>
          <p className="text-muted-foreground">
            Paste your code — then let AI refactor, optimize, fix, comment, test, convert or continue it.
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Language</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Your code</label>
            <span className="text-xs text-muted-foreground tabular-nums">
              {lineCount} lines
            </span>
          </div>
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here… (or leave empty and use Create with an instruction)"
            rows={16}
            spellCheck={false}
            className="font-mono text-sm leading-relaxed"
          />
        </section>

        <section className="space-y-2">
          <label className="text-sm font-medium">Instruction (optional)</label>
          <Input
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g. Use async/await, target Node 20, follow Airbnb style…"
          />
        </section>

        <Card className="p-4 space-y-3 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
          <div className="text-sm font-medium flex items-center gap-1.5">
            <Wand2 className="h-4 w-4 text-primary" />
            Actions
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
          <Button variant="outline" size="sm" onClick={undo} disabled={!history.length}>
            <Undo2 className="h-4 w-4" />
            Undo
          </Button>
          <Button variant="secondary" size="sm" onClick={copy} disabled={!code}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Copy
          </Button>
        </div>

        {explanation && (
          <Card className="p-4 space-y-2">
            <div className="text-sm font-medium flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-primary" />
              Explanation
            </div>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{explanation}</p>
          </Card>
        )}

        <footer className="pt-6 pb-4 text-center text-xs text-muted-foreground">
          Free forever · No signup · Your data stays in your browser
        </footer>
      </main>
    </div>
  );
}
