import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { ListPlus, FileText, MessageSquare, Languages, PenLine, Code2, Home, Palette, Sun, Moon, Check } from "lucide-react";
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
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3 mr-auto">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ListPlus className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Listable <span className="text-muted-foreground font-normal">by Listly</span>
            </h1>
            <p className="text-xs text-muted-foreground">{t("tagline")}</p>
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={t("language")}>
                    <Languages className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("language")} ({lang.toUpperCase()})</TooltipContent>
              </Tooltip>
            </DropdownMenuTrigger>
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
                  <Button variant="outline" size="icon" aria-label={t("feedback")}>
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
