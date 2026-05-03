import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { ListPlus, FileText, MessageSquare, Languages, PenLine, Code2, Home, Palette, Sun, Moon, Check, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useI18n, LANG_LABELS, type Lang } from "@/lib/i18n";
import { useTheme, ACCENTS, type Accent } from "@/lib/theme";
import { toast } from "sonner";

const FEEDBACK_EMAIL = "feedback@listly.app";

export function SiteHeader() {
  const { t, lang, setLang } = useI18n();
  const { mode, toggleMode, accent, setAccent } = useTheme();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("Suggestion");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  const isActive = (p: string) => location.pathname === p;

  const send = () => {
    if (!message.trim()) {
      toast.error("Please write a message");
      return;
    }
    const subject = encodeURIComponent(`[Listable] ${type}`);
    const body = encodeURIComponent(
      `${message}\n\n—\nFrom: ${email || "anonymous"}\nLang: ${lang}\nPage: ${location.pathname}`,
    );
    window.location.href = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;
    setOpen(false);
    setMessage("");
    setEmail("");
    toast.success("Opening your email app…");
  };

  return (
    <header className="border-b border-border/60 bg-card/50 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-5xl px-3 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center gap-2 sm:gap-3">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 mr-auto min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ListPlus className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-semibold tracking-tight truncate">
              Listable <span className="text-muted-foreground font-normal hidden sm:inline">by Listly</span>
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">{t("tagline")}</p>
          </div>
        </Link>

        <TooltipProvider delayDuration={200}>
          <nav className="flex items-center gap-1">
            {[
              { to: "/" as const, icon: Home, label: t("home") },
              { to: "/list" as const, icon: ListPlus, label: t("listmaker") },
              { to: "/summarize" as const, icon: FileText, label: t("summarizer") },
              { to: "/describe" as const, icon: PenLine, label: t("describer") },
              { to: "/code" as const, icon: Code2, label: t("coder") },
              { to: "/edit" as const, icon: Wand2, label: t("editor") },
            ].map(({ to, icon: Icon, label }) => (
              <Tooltip key={to}>
                <TooltipTrigger asChild>
                  <Link to={to}>
                    <Button
                      variant={isActive(to) ? "secondary" : "ghost"}
                      size="icon"
                      aria-label={label}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>
            ))}
          </nav>

          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={t("theme")}>
                    <Palette className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>{t("theme")}</TooltipContent>
            </Tooltip>
            <PopoverContent align="end" className="w-64 space-y-4">
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">{t("theme_mode")}</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={toggleMode}
                >
                  {mode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {mode === "dark" ? t("theme_light") : t("theme_dark")}
                </Button>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">{t("theme_accent")}</div>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(ACCENTS) as Accent[]).map((a) => (
                    <button
                      key={a}
                      onClick={() => setAccent(a)}
                      aria-label={ACCENTS[a].label}
                      title={ACCENTS[a].label}
                      className="relative h-9 w-full rounded-md border border-border/60 transition-transform hover:scale-105"
                      style={{ backgroundColor: ACCENTS[a].swatch }}
                    >
                      {accent === a && (
                        <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={t("language")}>
                    <Languages className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>{t("language")} ({lang.toUpperCase()})</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end">
              {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
                <DropdownMenuItem
                  key={l}
                  onClick={() => setLang(l)}
                  className={lang === l ? "font-semibold" : ""}
                >
                  {LANG_LABELS[l]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" aria-label={t("feedback")} className="sm:hidden">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("feedback")}</TooltipContent>
              </Tooltip>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("feedback_title")}</DialogTitle>
              <DialogDescription>
                We read every message. Choose a type and tell us what's on your mind.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t("feedback_type")}</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Suggestion">{t("type_suggestion")}</SelectItem>
                    <SelectItem value="Complaint">{t("type_complaint")}</SelectItem>
                    <SelectItem value="Feedback">{t("type_feedback")}</SelectItem>
                    <SelectItem value="Help">{t("type_help")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t("your_message")}</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="…"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t("your_email")}</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>{t("cancel")}</Button>
              <Button onClick={send}>{t("send")}</Button>
            </DialogFooter>
          </DialogContent>
          </Dialog>
        </TooltipProvider>
      </div>
    </header>
  );
}
