import { useState, useEffect, useCallback } from "react";
import { FileUpload } from "@/components/FileUpload";
import { Layout, type ActiveTab } from "@/components/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { Glossary } from "@/pages/Glossary";
import { Psychology } from "@/pages/Psychology";
import { LoginPage } from "@/pages/LoginPage";
import { AICoach } from "@/pages/AICoach";
import { WhatIfSimulation } from "@/pages/WhatIfSimulation";
import { WeeklyReport } from "@/pages/WeeklyReport";
import { parseMetaTraderExcel } from "@/lib/excelParser";
import { analyzeAll, type AnalysisResult } from "@/lib/tradeAnalysis";
import { useI18n } from "@/components/I18nProvider";
import { Toaster } from "sonner";

type Theme = "dark" | "light";

export function TradingApp() {
  const { lang, setLang } = useI18n();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [activeTab, setActiveTab] = useState<ActiveTab>("analytics");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("egfx_auth")) setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
  }, [theme]);

  const handleFileLoaded = useCallback(async (file: File) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const { trades, equityCurve } = await parseMetaTraderExcel(file);
      if (trades.length === 0) {
        setError(
          "No trade data found in the file. Please make sure this is a MetaTrader Positions report exported as Excel (.xlsx).",
        );
        return;
      }
      setAnalysisResult(analyzeAll(trades, equityCurve));
      setActiveTab("analytics");
    } catch (e) {
      console.error(e);
      setError("Failed to parse the file. Please make sure it's a valid MetaTrader Excel export.");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleUploadNew = useCallback(() => {
    setAnalysisResult(null);
    setError(null);
    setActiveTab("analytics");
  }, []);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("egfx_auth");
    setIsAuthenticated(false);
    setAnalysisResult(null);
    setError(null);
    setActiveTab("analytics");
  }, []);

  if (!isAuthenticated) {
    return <LoginPage onAccessGranted={() => setIsAuthenticated(true)} />;
  }

  if (!analysisResult) {
    return (
      <div className="min-h-screen bg-background">
        {error && (
          <div className="mx-auto max-w-2xl px-6 pt-6">
            <div
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </div>
          </div>
        )}
        <FileUpload onFileLoaded={handleFileLoaded} lang={lang} isAnalyzing={isAnalyzing} />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" theme={theme} />
      <Layout
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onUploadNew={handleUploadNew}
        onLogout={handleLogout}
        hasData
      >
        {activeTab === "analytics" && <Dashboard data={analysisResult} theme={theme} />}
        {activeTab === "glossary" && <Glossary lang={lang} data={analysisResult} theme={theme} />}
        {activeTab === "psychology" && <Psychology data={analysisResult} theme={theme} />}
        {activeTab === "coach" && <AICoach data={analysisResult} theme={theme} />}
        {activeTab === "simulation" && (
          <WhatIfSimulation data={analysisResult} lang={lang} theme={theme} />
        )}
        {activeTab === "weekly-report" && (
          <WeeklyReport data={analysisResult} lang={lang} theme={theme} />
        )}
      </Layout>
    </>
  );
}
