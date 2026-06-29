import {
  inferCategory,
  inferCountry,
  inferRegion,
  normalizeText,
  toIsoDate,
} from "@/lib/job-intel/taxonomy";
import type { JobOpening, SourceResult, SourceSnapshot } from "@/lib/job-intel/types";

interface RemoteOkJob {
  id?: number;
  position?: string;
  company?: string;
  location?: string;
  date?: string;
  url?: string;
  tags?: string[];
}

interface ArbeitnowJob {
  slug: string;
  title: string;
  company_name: string;
  location: string;
  remote: boolean;
  url: string;
  created_at: string;
  tags: string[];
  job_types: string[];
}

interface ArbeitnowResponse {
  data: ArbeitnowJob[];
}

interface GreenhouseJob {
  id: number;
  title: string;
  updated_at: string;
  absolute_url: string;
  location?: { name?: string };
}

interface GreenhouseResponse {
  jobs: GreenhouseJob[];
}

const FETCH_TIMEOUT_MS = 8000;
const GREENHOUSE_BOARDS = ["stripe", "airbnb", "datadog", "notion", "doordash"];

async function safeFetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "global-job-pulse/1.0",
      },
      next: {
        revalidate: 1800,
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeJob(input: {
  id: string;
  source: string;
  title?: string;
  company?: string;
  url?: string;
  postedAt?: string;
  location?: string;
  tags?: string[];
  employmentType?: string;
}): JobOpening {
  const title = normalizeText(input.title, "Unknown Role");
  const tags = Array.isArray(input.tags)
    ? input.tags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
    : [];
  const location = normalizeText(input.location, "Remote - Worldwide");
  const country = inferCountry(location);
  const region = inferRegion(country);
  const categoryData = inferCategory(title, tags);

  return {
    id: `${input.source.toLowerCase().replace(/\s+/g, "-")}-${input.id}`,
    source: input.source,
    title,
    company: normalizeText(input.company, "Unknown Company"),
    url: normalizeText(input.url, "https://example.com"),
    postedAt: toIsoDate(input.postedAt),
    location,
    country,
    region,
    sector: categoryData.sector,
    category: categoryData.category,
    employmentType: normalizeText(input.employmentType, "Full-time"),
    tags,
  };
}

async function fetchRemoteOkJobs(): Promise<JobOpening[]> {
  const response = await safeFetchJson<RemoteOkJob[]>("https://remoteok.com/api");

  return response
    .filter((job) => Boolean(job?.position && job?.url))
    .slice(0, 160)
    .map((job) =>
      normalizeJob({
        id: String(job.id ?? `${job.company}-${job.position}`),
        source: "RemoteOK",
        title: job.position,
        company: job.company,
        location: job.location,
        postedAt: job.date,
        url: job.url,
        tags: job.tags,
        employmentType: "Full-time",
      })
    );
}

async function fetchArbeitnowJobs(): Promise<JobOpening[]> {
  const response = await safeFetchJson<ArbeitnowResponse>(
    "https://www.arbeitnow.com/api/job-board-api"
  );

  return response.data.slice(0, 200).map((job) =>
    normalizeJob({
      id: job.slug,
      source: "Arbeitnow",
      title: job.title,
      company: job.company_name,
      location: job.location,
      postedAt: job.created_at,
      url: job.url,
      tags: job.tags,
      employmentType: Array.isArray(job.job_types) && job.job_types.length > 0
        ? job.job_types.join(", ")
        : job.remote
          ? "Remote"
          : "Full-time",
    })
  );
}

async function fetchGreenhouseBoard(boardToken: string): Promise<JobOpening[]> {
  const response = await safeFetchJson<GreenhouseResponse>(
    `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs`
  );

  return response.jobs.slice(0, 120).map((job) =>
    normalizeJob({
      id: String(job.id),
      source: "Greenhouse",
      title: job.title,
      company: boardToken.replace(/(^.|-.?)/g, (chunk) => chunk.replace("-", " ").toUpperCase()),
      location: job.location?.name,
      postedAt: job.updated_at,
      url: job.absolute_url,
      tags: [],
      employmentType: "Full-time",
    })
  );
}

async function fetchGreenhouseJobs(): Promise<JobOpening[]> {
  const settled = await Promise.allSettled(GREENHOUSE_BOARDS.map((board) => fetchGreenhouseBoard(board)));

  return settled.flatMap((entry) => (entry.status === "fulfilled" ? entry.value : []));
}

function summarizeSource(source: string, openings: JobOpening[], status: SourceSnapshot["status"], message?: string): SourceSnapshot {
  const regions = [...new Set(openings.map((opening) => opening.region))].slice(0, 8);

  return {
    source,
    status,
    fetched: openings.length,
    regions,
    message,
  };
}

async function executeSource(
  source: string,
  runner: () => Promise<JobOpening[]>
): Promise<SourceResult> {
  try {
    const openings = await runner();

    if (openings.length === 0) {
      return {
        openings: [],
        source: summarizeSource(source, [], "fallback", "Source responded with no openings."),
      };
    }

    return {
      openings,
      source: summarizeSource(source, openings, "live"),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected source failure";

    return {
      openings: [],
      source: summarizeSource(source, [], "fallback", message),
    };
  }
}

export async function fetchLiveOpenings(): Promise<SourceResult[]> {
  const settled = await Promise.all([
    executeSource("RemoteOK", fetchRemoteOkJobs),
    executeSource("Arbeitnow", fetchArbeitnowJobs),
    executeSource("Greenhouse", fetchGreenhouseJobs),
  ]);

  return settled;
}
