import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { ListPlus, FileText, MessageSquare, Languages, PenLine, Code2 } from "lucide-react";
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
import { useI18n, LANG_LABELS, type Lang } from "@/lib/i18n";
import { toast } from "sonner";

const FEEDBACK_EMAIL = "feedback@listly.app";

export function SiteHeader() {
  const { t, lang, setLang } = useI18n();
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

        <nav className="hidden sm:flex items-center gap-1">
          <Link to="/">
            <Button variant={isActive("/") ? "secondary" : "ghost"} size="sm">
              <ListPlus className="h-4 w-4" />
              <span className="hidden md:inline">{t("listmaker")}</span>
            </Button>
          </Link>
          <Link to="/summarize">
            <Button variant={isActive("/summarize") ? "secondary" : "ghost"} size="sm">
              <FileText className="h-4 w-4" />
              <span className="hidden md:inline">{t("summarizer")}</span>
            </Button>
          </Link>
          <Link to="/describe">
            <Button variant={isActive("/describe") ? "secondary" : "ghost"} size="sm">
              <PenLine className="h-4 w-4" />
              <span className="hidden md:inline">{t("describer")}</span>
            </Button>
          </Link>
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" aria-label={t("language")}>
              <Languages className="h-4 w-4" />
              <span className="hidden md:inline uppercase text-xs">{lang}</span>
            </Button>
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
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden md:inline">{t("feedback")}</span>
            </Button>
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
      </div>
    </header>
  );
}
