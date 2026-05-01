import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Copy, Check, Sparkles, Loader2, Link as LinkIcon, ExternalLink, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { generateList } from "@/server/generate.functions";
import { SiteHeader } from "@/components/site-header";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/list")({
  component: ListPage,
  head: () => ({
    meta: [
      { title: "List Maker — Listable by Listly" },
      {
        name: "description",
        content:
          "Create custom lists with any columns you want. Add rows, copy as text, CSV, or markdown. 100% free, no signup.",
      },
    ],
  }),
});

type Row = Record<string, string>;

function ListPage() {
  const { t } = useI18n();
  const [listName, setListName] = useState("");
  const [columns, setColumns] = useState<string[]>(["name", "value"]);
  const [linkColumns, setLinkColumns] = useState<string[]>([]);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [newCol, setNewCol] = useState("");
  const [rows, setRows] = useState<Row[]>([{ name: "", value: "" }]);
  const [copied, setCopied] = useState<string | null>(null);
  const [count, setCount] = useState(10);
  const [generating, setGenerating] = useState(false);

  const toggleLinkColumn = (c: string) =>
    setLinkColumns((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const handleGenerate = async () => {
    if (!listName.trim()) {
      toast.error("Add a list name first");
      return;
    }
    setGenerating(true);
    try {
      const result = await generateList({
        data: { listName: listName.trim(), columns, count },
      });
      if (!result.rows.length) {
        toast.error("No rows returned. Try a different list name.");
        return;
      }
      setRows(result.rows);
      toast.success(`Generated ${result.rows.length} rows`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const addColumn = () => {
    const c = newCol.trim();
    if (!c || columns.includes(c)) return;
    setColumns([...columns, c]);
    setRows(rows.map((r) => ({ ...r, [c]: "" })));
    setNewCol("");
  };

  const removeColumn = (c: string) => {
    if (columns.length <= 1) return;
    setColumns(columns.filter((x) => x !== c));
    setRows(
      rows.map((r) => {
        const { [c]: _, ...rest } = r;
        return rest;
      }),
    );
  };

  const addRow = () =>
    setRows([...rows, Object.fromEntries(columns.map((c) => [c, ""]))]);

  const removeRow = (i: number) =>
    setRows(rows.length > 1 ? rows.filter((_, idx) => idx !== i) : rows);

  const updateCell = (i: number, c: string, v: string) =>
    setRows(rows.map((r, idx) => (idx === i ? { ...r, [c]: v } : r)));

  const exports = useMemo(() => {
    const title = listName.trim() || "Untitled list";
    const text = [
      title,
      "",
      ...rows.map((r, i) =>
        `${i + 1}. ` + columns.map((c) => `${c}: ${r[c] || ""}`).join(" | "),
      ),
    ].join("\n");

    const csv = [
      columns.join(","),
      ...rows.map((r) =>
        columns
          .map((c) => {
            const v = (r[c] || "").replace(/"/g, '""');
            return /[",\n]/.test(v) ? `"${v}"` : v;
          })
          .join(","),
      ),
    ].join("\n");

    const md = [
      `# ${title}`,
      "",
      `| ${columns.join(" | ")} |`,
      `| ${columns.map(() => "---").join(" | ")} |`,
      ...rows.map((r) => `| ${columns.map((c) => r[c] || "").join(" | ")} |`),
    ].join("\n");

    return { text, csv, md };
  }, [listName, columns, rows]);

  const copy = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    toast.success(`Copied as ${key.toUpperCase()}`);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <section className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            {t("list_name")}
          </label>
          <Input
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            placeholder={t("list_placeholder")}
            className="h-14 text-xl font-semibold"
          />
        </section>

        <Card className="p-4 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                {t("autofill")}
              </label>
              <p className="text-xs text-muted-foreground">
                {t("autofill_hint")}
              </p>
            </div>
            <div className="flex items-end gap-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">{t("rows")}</label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={count}
                  onChange={(e) =>
                    setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))
                  }
                  className="h-10 w-20"
                />
              </div>
              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="h-10"
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-1.5" />
                )}
                {t("generate")}
              </Button>
            </div>
          </div>
        </Card>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted-foreground">
              {t("columns")}
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {columns.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground"
              >
                {c}
                <button
                  onClick={() => removeColumn(c)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label={`Remove ${c}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
            <div className="flex gap-2">
              <Input
                value={newCol}
                onChange={(e) => setNewCol(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColumn())}
                placeholder={t("add_column")}
                className="h-9 w-40"
              />
              <Button onClick={addColumn} size="sm" variant="secondary">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground">
            {t("rows")}
          </label>
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="w-12 px-3 py-2.5 text-left font-medium text-muted-foreground">
                      #
                    </th>
                    {columns.map((c) => (
                      <th
                        key={c}
                        className="px-3 py-2.5 text-left font-medium text-foreground"
                      >
                        {c}
                      </th>
                    ))}
                    <th className="w-12" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr
                      key={i}
                      className="border-t border-border/60 hover:bg-muted/30"
                    >
                      <td className="px-3 py-1.5 text-muted-foreground tabular-nums">
                        {i + 1}
                      </td>
                      {columns.map((c) => (
                        <td key={c} className="px-2 py-1.5">
                          <Input
                            value={r[c] || ""}
                            onChange={(e) => updateCell(i, c, e.target.value)}
                            className="h-8 border-transparent bg-transparent shadow-none focus-visible:bg-background focus-visible:border-input"
                            placeholder={c}
                          />
                        </td>
                      ))}
                      <td className="px-2">
                        <button
                          onClick={() => removeRow(i)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          aria-label="Remove row"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Button onClick={addRow} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {t("add_row")}
          </Button>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted-foreground">
              {t("copy_list")}
            </label>
            <div className="flex gap-2">
              {(["text", "csv", "md"] as const).map((k) => (
                <Button
                  key={k}
                  size="sm"
                  variant={copied === k ? "default" : "secondary"}
                  onClick={() => copy(k, exports[k])}
                >
                  {copied === k ? (
                    <Check className="h-4 w-4 mr-1.5" />
                  ) : (
                    <Copy className="h-4 w-4 mr-1.5" />
                  )}
                  {k.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
          <Card className="p-4">
            <pre className="max-h-80 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground font-mono">
              {exports.text}
            </pre>
          </Card>
        </section>

        <footer className="pt-6 pb-10 text-center text-xs text-muted-foreground">
          {t("footer")}
        </footer>
      </main>
    </div>
  );
}
