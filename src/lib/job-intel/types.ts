export type TrendDirection = "rising" | "falling" | "stable";

export interface JobOpening {
  id: string;
  source: string;
  title: string;
  company: string;
  url: string;
  postedAt: string;
  location: string;
  country: string;
  region: string;
  sector: string;
  category: string;
  employmentType: string;
  tags: string[];
}

export interface SourceSnapshot {
  source: string;
  status: "live" | "fallback";
  fetched: number;
  regions: string[];
  message?: string;
}

export interface CategoryTrend {
  category: string;
  sector: string;
  currentOpenings: number;
  previousOpenings: number;
  growthRate: number;
  direction: TrendDirection;
}

export interface SectorTrend {
  sector: string;
  currentOpenings: number;
  previousOpenings: number;
  growthRate: number;
  direction: TrendDirection;
}

export interface TimelinePoint {
  day: string;
  openings: number;
}

export interface CountryDemand {
  country: string;
  openings: number;
}

export interface TrendSnapshot {
  generatedAt: string;
  totalOpenings: number;
  totalSources: number;
  coveredRegions: number;
  categories: CategoryTrend[];
  sectors: SectorTrend[];
  timeline: TimelinePoint[];
  topCountries: CountryDemand[];
  sources: SourceSnapshot[];
  openings: JobOpening[];
}

export interface SourceResult {
  openings: JobOpening[];
  source: SourceSnapshot;
}
