import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet, AlertCircle, ShieldCheck, Sparkles, LineChart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Language } from "@/lib/i18n";
import { t } from "@/lib/i18n";

interface FileUploadProps {
  onFileLoaded: (file: File) => void;
  lang: Language;
  isAnalyzing: boolean;
}

const HIGHLIGHTS = [
  { icon: LineChart, title: "Deep performance analytics", body: "Equity curve, drawdown, expectancy, session and symbol edge." },
  { icon: Sparkles, title: "Behavioural insights", body: "Psychology scoring, revenge-trading and discipline patterns." },
  { icon: ShieldCheck, title: "Private by design", body: "Your report is parsed in the browser — nothing is uploaded." },
];

export function FileUpload({ onFileLoaded, lang, isAnalyzing }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext !== "xlsx" && ext !== "xls") {
        setError("Please upload a MetaTrader report exported as Excel (.xlsx or .xls).");
        return;
      }
      setFileName(file.name);
      onFileLoaded(file);
    },
    [onFileLoaded],
  );

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="upload-glow pointer-events-none absolute inset-0" />

      <div className="relative grid w-full max-w-5xl gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <div className="animate-fade-in space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {t(lang, "appTitle")}
          </span>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
            {t(lang, "uploadTitle")}
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t(lang, "uploadSubtitle")}
          </p>

          <ul className="space-y-3">
            {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">{title}</span>
                  <span className="block text-xs text-muted-foreground">{body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="animate-slide-up neon-card p-6 sm:p-8">
          <label
            className={cn(
              "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-all duration-200",
              isDragging
                ? "scale-[1.01] border-primary bg-primary/10"
                : "border-border hover:border-primary/60 hover:bg-primary/5",
              isAnalyzing && "pointer-events-none opacity-70",
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
          >
            <input
              type="file"
              accept=".xlsx,.xls"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
              disabled={isAnalyzing}
            />

            {isAnalyzing ? (
              <>
                <div className="mb-4 h-11 w-11 animate-spin rounded-full border-4 border-primary/25 border-t-primary" />
                <p className="text-base font-semibold text-foreground">{t(lang, "analyzing")}</p>
                {fileName && (
                  <p className="mt-1 max-w-full truncate text-xs text-muted-foreground">{fileName}</p>
                )}
              </>
            ) : (
              <>
                <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/12 text-primary">
                  {isDragging ? <Upload className="h-6 w-6" /> : <FileSpreadsheet className="h-6 w-6" />}
                </span>
                <p className="text-base font-semibold text-foreground">
                  {isDragging ? "Drop your file to analyse" : "Drag & drop your MetaTrader report"}
                </p>
                <p className="mt-1.5 text-xs text-muted-foreground">{t(lang, "uploadHint")}</p>
                <span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)]">
                  <Upload className="h-4 w-4" />
                  Choose file
                </span>
              </>
            )}
          </label>

          {error && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <p className="mt-5 text-center text-[11px] text-muted-foreground">
            Supported: MetaTrader 4 / 5 Positions report exported as .xlsx
          </p>
        </div>
      </div>
    </div>
  );
}
