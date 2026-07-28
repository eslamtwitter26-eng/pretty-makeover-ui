import { useState, type ReactNode } from "react";
import {
  BarChart2,
  BookOpen,
  Brain,
  Sun,
  Moon,
  Upload,
  LogOut,
  Bot,
  Sliders,
  FileText,
  Menu,
  X,
} from "lucide-react";
import type { Language } from "@/lib/i18n";
import { t, isRTL } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type ActiveTab =
  | "analytics"
  | "glossary"
  | "psychology"
  | "coach"
  | "simulation"
  | "weekly-report";

interface LayoutProps {
  lang: Language;
  setLang: (l: Language) => void;
  theme: "dark" | "light";
  setTheme: (t: "dark" | "light") => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onUploadNew: () => void;
  onLogout: () => void;
  hasData: boolean;
  children: ReactNode;
}

const LANGS: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "ar", label: "ع" },
  { code: "fr", label: "FR" },
];

type TabKey = ActiveTab;
type LabelKey =
  | "analyticsTab"
  | "glossaryTab"
  | "psychologyTab"
  | "coachTab"
  | "simulationTab"
  | "weeklyTab";

const TABS: { key: TabKey; icon: typeof BarChart2; labelKey: LabelKey }[] = [
  { key: "analytics", icon: BarChart2, labelKey: "analyticsTab" },
  { key: "glossary", icon: BookOpen, labelKey: "glossaryTab" },
  { key: "psychology", icon: Brain, labelKey: "psychologyTab" },
  { key: "coach", icon: Bot, labelKey: "coachTab" },
  { key: "simulation", icon: Sliders, labelKey: "simulationTab" },
  { key: "weekly-report", icon: FileText, labelKey: "weeklyTab" },
];

function Brand({ expanded }: { expanded?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
        <span className="font-display text-xs font-bold tracking-wider">EG</span>
      </div>
      {expanded && (
        <span className="truncate font-display text-sm font-bold tracking-tight text-foreground">
          FX Pro Analyser
        </span>
      )}
    </div>
  );
}

export function Layout({
  lang,
  setLang,
  theme,
  setTheme,
  activeTab,
  setActiveTab,
  onUploadNew,
  onLogout,
  hasData,
  children,
}: LayoutProps) {
  const rtl = isRTL(lang);
  const [mobileNav, setMobileNav] = useState(false);

  const activeLabel = TABS.find((tab) => tab.key === activeTab)?.labelKey ?? "analyticsTab";

  const navList = (compact: boolean) => (
    <nav className={cn("flex w-full flex-col gap-1", compact ? "px-2" : "px-3")}>
      {TABS.map(({ key, icon: Icon, labelKey }) => {
        const active = activeTab === key;
        return (
          <button
            key={key}
            onClick={() => {
              setActiveTab(key);
              setMobileNav(false);
            }}
            aria-current={active ? "page" : undefined}
            title={t(lang, labelKey)}
            className={cn(
              compact ? "sidebar-tab" : "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
              !compact && (active
                ? "bg-primary/15 text-foreground"
                : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"),
              compact && active && "active",
            )}
          >
            <Icon className={cn("shrink-0", compact ? "h-5 w-5" : "h-4.5 w-4.5")} />
            <span className={cn(compact ? "mt-1 text-[9px] font-semibold tracking-wide" : "truncate")}>
              {compact ? t(lang, labelKey).split(" ")[0] : t(lang, labelKey)}
            </span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className={cn("flex h-screen overflow-hidden bg-background", rtl && "flex-row-reverse")}>
      {/* Desktop rail */}
      <aside className="hidden w-[76px] shrink-0 flex-col items-center justify-between border-r border-border/60 bg-surface/70 py-6 backdrop-blur-xl md:flex">
        <Brand />
        {navList(true)}
        <button
          onClick={onLogout}
          title={t(lang, "logout")}
          aria-label={t(lang, "logout")}
          className="rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4.5 w-4.5" />
        </button>
      </aside>

      {/* Mobile drawer */}
      {mobileNav && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Close navigation"
            onClick={() => setMobileNav(false)}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <div className="animate-slide-up absolute inset-y-0 start-0 flex w-[264px] flex-col gap-6 border-e border-border bg-surface p-4 shadow-[var(--shadow-elevated)]">
            <div className="flex items-center justify-between">
              <Brand expanded />
              <button
                onClick={() => setMobileNav(false)}
                aria-label="Close navigation"
                className="rounded-lg p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {navList(false)}
            <button
              onClick={onLogout}
              className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              {t(lang, "logout")}
            </button>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-40 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border/60 bg-background/70 px-4 py-3 backdrop-blur-xl sm:px-6 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMobileNav(true)}
              aria-label="Open navigation"
              className="shrink-0 rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground md:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <p className="truncate font-display text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                {t(lang, "appTitle")}
              </p>
              <h1 className="truncate text-base font-bold tracking-tight text-foreground sm:text-lg">
                {t(lang, activeLabel)}
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-success/25 bg-success/10 px-2.5 py-1 lg:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-success">
                {t(lang, "liveAnalysis")}
              </span>
            </div>

            <div className="hidden items-center gap-0.5 rounded-lg border border-border bg-surface p-1 sm:flex">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  aria-pressed={lang === l.code}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors",
                    lang === l.code
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={theme === "dark" ? t(lang, "lightMode") : t(lang, "darkMode")}
              className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {hasData && (
              <button
                onClick={onUploadNew}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Upload className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t(lang, "uploadNew")}</span>
              </button>
            )}
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1550px] space-y-6 px-4 py-6 sm:px-6 md:space-y-8 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
