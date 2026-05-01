import { createFileRoute, Link } from "@tanstack/react-router";
import { ListPlus, FileText, PenLine, Code2, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Listable by Listly — Lists made lovable, texts made easier" },
      {
        name: "description",
        content:
          "Free AI tools for lists, summaries, descriptions, and code. No signup, works in your browser.",
      },
    ],
  }),
});

function Home() {
  const { t } = useI18n();

  const tools = [
    {
      to: "/list" as const,
      icon: ListPlus,
      title: t("listmaker"),
      desc: t("home_listmaker_desc"),
    },
    {
      to: "/summarize" as const,
      icon: FileText,
      title: t("summarizer"),
      desc: t("home_summarizer_desc"),
    },
    {
      to: "/describe" as const,
      icon: PenLine,
      title: t("describer"),
      desc: t("home_describer_desc"),
    },
    {
      to: "/code" as const,
      icon: Code2,
      title: t("coder"),
      desc: t("home_coder_desc"),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-6 py-16 space-y-16">
        <section className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {t("home_badge")}
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
            {t("home_hero_1")}{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {t("home_hero_2")}
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t("home_sub")}
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link to="/list">
              <Button size="lg">
                <ListPlus className="h-4 w-4" />
                {t("home_cta_primary")}
              </Button>
            </Link>
            <Link to="/summarize">
              <Button size="lg" variant="outline">
                {t("home_cta_secondary")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tools.map(({ to, icon: Icon, title, desc }) => (
            <Link key={to} to={to} className="group">
              <Card className="h-full p-6 transition-all hover:border-primary/40 hover:shadow-lg group-hover:-translate-y-0.5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold tracking-tight">{title}</h3>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </section>

        <footer className="pt-6 pb-4 text-center text-xs text-muted-foreground">
          {t("footer")}
        </footer>
      </main>
    </div>
  );
}
