import type { TrendDirection } from "@/lib/job-intel/types";

interface CategoryRule {
  category: string;
  sector: string;
  keywords: string[];
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    category: "Machine Learning",
    sector: "AI & Data",
    keywords: [
      "machine learning",
      "ml engineer",
      "deep learning",
      "computer vision",
      "nlp",
      "llm",
      "generative ai",
      "ai engineer",
      "ai researcher",
    ],
  },
  {
    category: "Cybersecurity",
    sector: "Security",
    keywords: [
      "security",
      "cyber",
      "soc analyst",
      "penetration",
      "threat",
      "siem",
      "information security",
      "application security",
      "devsecops",
    ],
  },
  {
    category: "Cloud & DevOps",
    sector: "Infrastructure",
    keywords: [
      "devops",
      "sre",
      "site reliability",
      "kubernetes",
      "terraform",
      "cloud engineer",
      "platform engineer",
      "aws",
      "azure",
      "gcp",
      "docker",
    ],
  },
  {
    category: "Data Engineering",
    sector: "AI & Data",
    keywords: [
      "data engineer",
      "etl",
      "analytics engineer",
      "data pipeline",
      "big data",
      "spark",
      "databricks",
      "data platform",
    ],
  },
  {
    category: "Backend Development",
    sector: "Software Engineering",
    keywords: [
      "backend",
      "back-end",
      "api",
      "java",
      "golang",
      "python",
      "node",
      "microservices",
      "distributed systems",
    ],
  },
  {
    category: "Frontend Development",
    sector: "Software Engineering",
    keywords: [
      "frontend",
      "front-end",
      "react",
      "next.js",
      "vue",
      "angular",
      "javascript",
      "typescript",
      "web ui",
    ],
  },
  {
    category: "Mobile Development",
    sector: "Software Engineering",
    keywords: [
      "android",
      "ios",
      "mobile",
      "react native",
      "flutter",
      "swift",
      "kotlin",
    ],
  },
  {
    category: "QA Automation",
    sector: "Software Engineering",
    keywords: [
      "qa",
      "test automation",
      "sdet",
      "playwright",
      "cypress",
      "quality engineer",
    ],
  },
  {
    category: "IT Support",
    sector: "IT Operations",
    keywords: [
      "it support",
      "help desk",
      "technical support",
      "service desk",
      "desktop support",
      "systems administrator",
      "network administrator",
    ],
  },
  {
    category: "Product Management",
    sector: "Product",
    keywords: [
      "product manager",
      "product owner",
      "technical product manager",
      "growth product",
    ],
  },
];

const COUNTRY_PATTERNS: Array<[RegExp, string]> = [
  [/united states|usa|u\.s\.|us\b/i, "United States"],
  [/canada/i, "Canada"],
  [/mexico/i, "Mexico"],
  [/brazil/i, "Brazil"],
  [/argentina/i, "Argentina"],
  [/chile/i, "Chile"],
  [/uk\b|united kingdom|england|scotland|wales/i, "United Kingdom"],
  [/ireland/i, "Ireland"],
  [/germany/i, "Germany"],
  [/france/i, "France"],
  [/spain/i, "Spain"],
  [/italy/i, "Italy"],
  [/netherlands/i, "Netherlands"],
  [/sweden/i, "Sweden"],
  [/norway/i, "Norway"],
  [/poland/i, "Poland"],
  [/portugal/i, "Portugal"],
  [/india/i, "India"],
  [/singapore/i, "Singapore"],
  [/malaysia/i, "Malaysia"],
  [/indonesia/i, "Indonesia"],
  [/philippines/i, "Philippines"],
  [/thailand/i, "Thailand"],
  [/vietnam/i, "Vietnam"],
  [/china/i, "China"],
  [/japan/i, "Japan"],
  [/south korea|korea/i, "South Korea"],
  [/australia/i, "Australia"],
  [/new zealand/i, "New Zealand"],
  [/united arab emirates|uae|dubai|abu dhabi/i, "United Arab Emirates"],
  [/saudi arabia/i, "Saudi Arabia"],
  [/qatar/i, "Qatar"],
  [/south africa/i, "South Africa"],
  [/nigeria/i, "Nigeria"],
  [/kenya/i, "Kenya"],
  [/worldwide|global|anywhere|remote/i, "Worldwide"],
];

const COUNTRY_TO_REGION: Record<string, string> = {
  Worldwide: "Global",
  "United States": "North America",
  Canada: "North America",
  Mexico: "North America",
  Brazil: "Latin America",
  Argentina: "Latin America",
  Chile: "Latin America",
  "United Kingdom": "Europe",
  Ireland: "Europe",
  Germany: "Europe",
  France: "Europe",
  Spain: "Europe",
  Italy: "Europe",
  Netherlands: "Europe",
  Sweden: "Europe",
  Norway: "Europe",
  Poland: "Europe",
  Portugal: "Europe",
  India: "Asia-Pacific",
  Singapore: "Asia-Pacific",
  Malaysia: "Asia-Pacific",
  Indonesia: "Asia-Pacific",
  Philippines: "Asia-Pacific",
  Thailand: "Asia-Pacific",
  Vietnam: "Asia-Pacific",
  China: "Asia-Pacific",
  Japan: "Asia-Pacific",
  "South Korea": "Asia-Pacific",
  Australia: "Asia-Pacific",
  "New Zealand": "Asia-Pacific",
  "United Arab Emirates": "Middle East",
  "Saudi Arabia": "Middle East",
  Qatar: "Middle East",
  "South Africa": "Africa",
  Nigeria: "Africa",
  Kenya: "Africa",
};

export function inferCategory(
  title: string,
  tags: string[]
): Pick<CategoryRule, "category" | "sector"> {
  const haystack = `${title} ${tags.join(" ")}`.toLowerCase();

  const match = CATEGORY_RULES.find((rule) =>
    rule.keywords.some((keyword) => haystack.includes(keyword))
  );

  if (match) {
    return { category: match.category, sector: match.sector };
  }

  return {
    category: "General Tech",
    sector: "Software Engineering",
  };
}

export function inferCountry(location: string): string {
  if (!location) {
    return "Worldwide";
  }

  for (const [pattern, country] of COUNTRY_PATTERNS) {
    if (pattern.test(location)) {
      return country;
    }
  }

  return "Worldwide";
}

export function inferRegion(country: string): string {
  return COUNTRY_TO_REGION[country] ?? "Global";
}

export function toIsoDate(rawDate: string | undefined): string {
  if (!rawDate) {
    return new Date().toISOString();
  }

  const parsed = new Date(rawDate);

  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
}

export function normalizeText(input: string | undefined, fallback: string): string {
  const value = input?.trim();
  return value && value.length > 0 ? value : fallback;
}

export function trendDirection(rate: number): TrendDirection {
  if (rate > 8) {
    return "rising";
  }

  if (rate < -8) {
    return "falling";
  }

  return "stable";
}

export function growthRate(current: number, previous: number): number {
  if (previous === 0 && current === 0) {
    return 0;
  }

  if (previous === 0) {
    return 100;
  }

  return ((current - previous) / previous) * 100;
}
