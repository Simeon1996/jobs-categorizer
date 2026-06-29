import { unstable_cache } from "next/cache";

import { createSeedOpenings } from "@/lib/job-intel/seed";
import { fetchLiveOpenings } from "@/lib/job-intel/sources";
import { buildCategoryTrends, buildSectorTrends, buildTimeline, buildTopCountries } from "@/lib/job-intel/trends";
import type { JobOpening, SourceSnapshot, TrendSnapshot } from "@/lib/job-intel/types";

const MAX_AGE_DAYS = 60;
const MIN_LIVE_OPENINGS = 120;

function dedupeOpenings(openings: JobOpening[]): JobOpening[] {
  const unique = new Map<string, JobOpening>();

  openings.forEach((opening) => {
    const key = `${opening.source}:${opening.url}:${opening.title}`.toLowerCase();

    if (!unique.has(key)) {
      unique.set(key, opening);
    }
  });

  return [...unique.values()];
}

function filterRecentOpenings(openings: JobOpening[], now = new Date()): JobOpening[] {
  const cutoff = now.getTime() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

  return openings.filter((opening) => {
    const postedAt = new Date(opening.postedAt).getTime();
    return Number.isFinite(postedAt) && postedAt >= cutoff;
  });
}

async function loadSnapshotUncached(): Promise<TrendSnapshot> {
  const now = new Date();
  const liveResults = await fetchLiveOpenings();
  const liveOpenings = liveResults.flatMap((result) => result.openings);
  const sourceSnapshots: SourceSnapshot[] = liveResults.map((result) => result.source);

  let allOpenings = dedupeOpenings(liveOpenings);

  if (allOpenings.length < MIN_LIVE_OPENINGS) {
    const seeded = createSeedOpenings(now);
    allOpenings = dedupeOpenings([...allOpenings, ...seeded]);

    sourceSnapshots.push({
      source: "Global Seed Feed",
      status: "fallback",
      fetched: seeded.length,
      regions: [...new Set(seeded.map((job) => job.region))],
      message: "Added synthetic data to keep trends stable when live sources are limited.",
    });
  }

  const recentOpenings = filterRecentOpenings(allOpenings, now)
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
    .slice(0, 900);

  const categories = buildCategoryTrends(recentOpenings, now);
  const sectors = buildSectorTrends(categories);
  const timeline = buildTimeline(recentOpenings, now);
  const topCountries = buildTopCountries(recentOpenings, now);

  return {
    generatedAt: now.toISOString(),
    totalOpenings: recentOpenings.length,
    totalSources: sourceSnapshots.length,
    coveredRegions: new Set(recentOpenings.map((opening) => opening.region)).size,
    categories,
    sectors,
    timeline,
    topCountries,
    sources: sourceSnapshots.sort((a, b) => b.fetched - a.fetched),
    openings: recentOpenings,
  };
}

export const getTrendSnapshot = unstable_cache(loadSnapshotUncached, ["global-job-trend-snapshot"], {
  revalidate: 60 * 30,
  tags: ["trends", "jobs"],
});

export async function getLatestOpenings(limit = 40): Promise<JobOpening[]> {
  const snapshot = await getTrendSnapshot();
  return snapshot.openings.slice(0, Math.max(1, Math.min(limit, 200)));
}
