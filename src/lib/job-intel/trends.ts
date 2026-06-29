import { growthRate, trendDirection } from "@/lib/job-intel/taxonomy";
import type {
  CategoryTrend,
  CountryDemand,
  JobOpening,
  SectorTrend,
  TimelinePoint,
} from "@/lib/job-intel/types";

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 30;

function daysAgo(timestamp: number, days: number): number {
  return timestamp - days * DAY_MS;
}

function inRange(value: number, from: number, to: number): boolean {
  return value >= from && value < to;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function groupCount<T>(items: JobOpening[], getKey: (item: JobOpening) => T): Map<T, number> {
  const grouped = new Map<T, number>();

  for (const item of items) {
    const key = getKey(item);
    grouped.set(key, (grouped.get(key) ?? 0) + 1);
  }

  return grouped;
}

export function buildTimeline(openings: JobOpening[], now = new Date()): TimelinePoint[] {
  const nowTimestamp = now.getTime();
  const timeline: TimelinePoint[] = [];

  for (let dayOffset = WINDOW_DAYS - 1; dayOffset >= 0; dayOffset -= 1) {
    const start = daysAgo(nowTimestamp, dayOffset + 1);
    const end = daysAgo(nowTimestamp, dayOffset);

    const total = openings.filter((job) => {
      const postedAt = new Date(job.postedAt).getTime();
      return inRange(postedAt, start, end);
    }).length;

    timeline.push({
      day: new Date(end).toISOString().slice(0, 10),
      openings: total,
    });
  }

  return timeline;
}

export function buildCategoryTrends(openings: JobOpening[], now = new Date()): CategoryTrend[] {
  const nowTimestamp = now.getTime();
  const currentFrom = daysAgo(nowTimestamp, WINDOW_DAYS);
  const previousFrom = daysAgo(nowTimestamp, WINDOW_DAYS * 2);

  const currentWindow = openings.filter((opening) => {
    const postedAt = new Date(opening.postedAt).getTime();
    return inRange(postedAt, currentFrom, nowTimestamp);
  });

  const previousWindow = openings.filter((opening) => {
    const postedAt = new Date(opening.postedAt).getTime();
    return inRange(postedAt, previousFrom, currentFrom);
  });

  const currentMap = groupCount(currentWindow, (opening) => opening.category);
  const previousMap = groupCount(previousWindow, (opening) => opening.category);
  const sectorMap = new Map<string, string>();

  openings.forEach((opening) => {
    if (!sectorMap.has(opening.category)) {
      sectorMap.set(opening.category, opening.sector);
    }
  });

  const categories = new Set([...currentMap.keys(), ...previousMap.keys()]);

  return [...categories]
    .map((category) => {
      const current = currentMap.get(category) ?? 0;
      const previous = previousMap.get(category) ?? 0;
      const rate = growthRate(current, previous);

      return {
        category,
        sector: sectorMap.get(category) ?? "General",
        currentOpenings: current,
        previousOpenings: previous,
        growthRate: round(rate),
        direction: trendDirection(rate),
      };
    })
    .sort((a, b) => b.currentOpenings - a.currentOpenings)
    .slice(0, 12);
}

export function buildSectorTrends(categories: CategoryTrend[]): SectorTrend[] {
  const grouped = new Map<string, { current: number; previous: number }>();

  categories.forEach((categoryTrend) => {
    const current = grouped.get(categoryTrend.sector);

    grouped.set(categoryTrend.sector, {
      current: (current?.current ?? 0) + categoryTrend.currentOpenings,
      previous: (current?.previous ?? 0) + categoryTrend.previousOpenings,
    });
  });

  return [...grouped.entries()]
    .map(([sector, totals]) => {
      const rate = growthRate(totals.current, totals.previous);

      return {
        sector,
        currentOpenings: totals.current,
        previousOpenings: totals.previous,
        growthRate: round(rate),
        direction: trendDirection(rate),
      };
    })
    .sort((a, b) => b.currentOpenings - a.currentOpenings);
}

export function buildTopCountries(openings: JobOpening[], now = new Date()): CountryDemand[] {
  const nowTimestamp = now.getTime();
  const currentFrom = daysAgo(nowTimestamp, WINDOW_DAYS);

  const currentWindow = openings.filter((opening) => {
    const postedAt = new Date(opening.postedAt).getTime();
    return inRange(postedAt, currentFrom, nowTimestamp);
  });

  const countryMap = groupCount(currentWindow, (opening) => opening.country);

  return [...countryMap.entries()]
    .map(([country, count]) => ({ country, openings: count }))
    .sort((a, b) => b.openings - a.openings)
    .slice(0, 10);
}
