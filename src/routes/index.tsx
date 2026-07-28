import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { I18nProvider } from "@/components/I18nProvider";
import { TradingApp } from "@/components/TradingApp";

const title = "FX Pro Analyser — MetaTrader Performance Dashboard";
const description =
  "Upload your MetaTrader report and get an instant edge audit: equity curve, drawdown, session and symbol performance, plus trading psychology insights.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ClientOnly
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/25 border-t-primary" />
        </div>
      }
    >
      <I18nProvider>
        <TradingApp />
      </I18nProvider>
    </ClientOnly>
  );
}
