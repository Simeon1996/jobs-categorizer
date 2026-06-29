import { Sparkline } from "@/components/dashboard/sparkline";
import { TrendBadge } from "@/components/dashboard/trend-badge";
import { getTrendSnapshot } from "@/lib/job-intel";

export const revalidate = 1800;

function formatCompact(value: number): string {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(value);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function Home() {
  const snapshot = await getTrendSnapshot();
  const timelinePoints = snapshot.timeline.map((point) => point.openings);
  const fastestGrowing = [...snapshot.categories]
    .sort((a, b) => b.growthRate - a.growthRate)
    .find((category) => category.growthRate > 0);
  const strongestDemand = snapshot.categories[0];
  const risingCount = snapshot.categories.filter((category) => category.direction === "rising").length;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_8%_10%,#f6d6ae_0,transparent_40%),radial-gradient(circle_at_92%_4%,#b8e4dc_0,transparent_36%),linear-gradient(145deg,#fbf7ee_0%,#f2f6ef_56%,#edf1f8_100%)]">
      <div className="pointer-events-none absolute -left-20 top-28 h-80 w-80 rounded-full bg-[#f5bc7f]/30 blur-3xl motion-float" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-[#97d7cc]/30 blur-3xl motion-float-delayed" />

      <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 md:py-12">
        <header className="glass-panel reveal-up p-6 md:p-8" style={{ animationDelay: "60ms" }}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">Global Job Pulse</p>
              <h1 className="mt-3 max-w-4xl text-3xl leading-tight font-semibold text-slate-900 md:text-5xl">
                Worldwide opening intelligence for what is rising, cooling, and shifting now.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-700 md:text-base">
                Tracks job openings from multiple global sources, normalizes role taxonomy, and monitors
                trend velocity across sectors like Machine Learning, Cybersecurity, and Infrastructure.
              </p>
            </div>
            <div className="rounded-2xl border border-white/75 bg-white/70 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Last refresh</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{formatDate(snapshot.generatedAt)}</p>
              <p className="mt-1 text-xs text-slate-600">Automatic cache refresh every 30 minutes</p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="glass-panel reveal-up p-5" style={{ animationDelay: "120ms" }}>
            <p className="metric-label">Openings (60 days)</p>
            <p className="metric-value">{formatCompact(snapshot.totalOpenings)}</p>
            <p className="metric-hint">Actively tracked and normalized</p>
          </article>

          <article className="glass-panel reveal-up p-5" style={{ animationDelay: "180ms" }}>
            <p className="metric-label">Data Sources</p>
            <p className="metric-value">{snapshot.totalSources}</p>
            <p className="metric-hint">Live feeds plus resilient fallback</p>
          </article>

          <article className="glass-panel reveal-up p-5" style={{ animationDelay: "240ms" }}>
            <p className="metric-label">Regions Covered</p>
            <p className="metric-value">{snapshot.coveredRegions}</p>
            <p className="metric-hint">Global market footprint</p>
          </article>

          <article className="glass-panel reveal-up p-5" style={{ animationDelay: "300ms" }}>
            <p className="metric-label">Fastest Growing</p>
            <p className="metric-value text-3xl">{fastestGrowing?.category ?? "Machine Learning"}</p>
            <p className="metric-hint">
              {fastestGrowing ? `${fastestGrowing.growthRate}% growth` : "Insufficient trend window"}
            </p>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr]">
          <article className="glass-panel reveal-up p-6" style={{ animationDelay: "360ms" }}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="eyebrow">30-Day Momentum</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Global demand curve</h2>
              </div>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white">
                {risingCount} categories rising
              </span>
            </div>
            <div className="mt-4 rounded-2xl border border-white/80 bg-white/65 p-4">
              <Sparkline points={timelinePoints} />
            </div>
          </article>

          <article className="glass-panel reveal-up p-6" style={{ animationDelay: "420ms" }}>
            <p className="eyebrow">Demand Leader</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">{strongestDemand?.category ?? "N/A"}</h2>
            <p className="mt-2 text-sm text-slate-700">
              {strongestDemand?.currentOpenings ?? 0} openings in the current window.
            </p>
            {strongestDemand ? (
              <div className="mt-4">
                <TrendBadge direction={strongestDemand.direction} growthRate={strongestDemand.growthRate} />
              </div>
            ) : null}
            <div className="mt-6 space-y-3">
              {snapshot.topCountries.slice(0, 5).map((country) => (
                <div key={country.country}>
                  <div className="mb-1 flex items-center justify-between text-sm text-slate-700">
                    <span>{country.country}</span>
                    <span className="font-semibold text-slate-900">{country.openings}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#f28f4b] to-[#2f7a8f]"
                      style={{ width: `${Math.min(100, (country.openings / (snapshot.topCountries[0]?.openings || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_1fr]">
          <article className="glass-panel reveal-up p-6" style={{ animationDelay: "480ms" }}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Category Trends</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">What is rising and falling</h2>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {snapshot.categories.map((category) => (
                <div
                  key={category.category}
                  className="rounded-2xl border border-white/80 bg-white/65 p-4 backdrop-blur"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-base font-semibold text-slate-900">{category.category}</p>
                      <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{category.sector}</p>
                    </div>
                    <TrendBadge direction={category.direction} growthRate={category.growthRate} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-slate-700">
                    <span>Current: {category.currentOpenings}</span>
                    <span>Previous: {category.previousOpenings}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="glass-panel reveal-up p-6" style={{ animationDelay: "540ms" }}>
            <p className="eyebrow">Source Coverage</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Ingestion health</h2>
            <div className="mt-5 space-y-3">
              {snapshot.sources.map((source) => (
                <div
                  key={source.source}
                  className="rounded-2xl border border-white/80 bg-white/65 p-4 backdrop-blur"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">{source.source}</p>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                        source.status === "live"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {source.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{source.fetched} openings mapped</p>
                  <p className="mt-1 text-xs text-slate-600">{source.regions.join(" • ") || "No region metadata"}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="glass-panel reveal-up p-6" style={{ animationDelay: "600ms" }}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Latest Openings</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Recent global roles</h2>
            </div>
            <a
              href="/api/openings?limit=50"
              className="rounded-full border border-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-900 transition hover:bg-slate-900 hover:text-white"
            >
              JSON feed
            </a>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {snapshot.openings.slice(0, 10).map((opening) => (
              <a
                key={opening.id}
                href={opening.url}
                target="_blank"
                rel="noreferrer"
                className="group rounded-2xl border border-white/85 bg-white/65 p-4 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.1em] text-slate-500">{opening.source}</p>
                  <span className="text-xs text-slate-500">{opening.country}</span>
                </div>
                <h3 className="mt-1 text-lg font-semibold text-slate-900 group-hover:text-[#2f7a8f]">{opening.title}</h3>
                <p className="mt-1 text-sm text-slate-700">{opening.company}</p>
                <p className="mt-2 text-xs text-slate-600">{opening.location}</p>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
