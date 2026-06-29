import { inferRegion } from "@/lib/job-intel/taxonomy";
import type { JobOpening } from "@/lib/job-intel/types";

interface SeedBlueprint {
  category: string;
  sector: string;
  current: number;
  previous: number;
  titles: string[];
  tags: string[];
  companies: string[];
}

const SOURCE_POOL = [
  "LinkedIn",
  "Indeed",
  "Glassdoor",
  "Wellfound",
  "Naukri",
  "SEEK",
  "InfoJobs",
  "JobStreet",
  "Bayt",
  "Computrabajo",
];

const LOCATIONS: Array<{ location: string; country: string }> = [
  { location: "San Francisco, United States", country: "United States" },
  { location: "Austin, United States", country: "United States" },
  { location: "Toronto, Canada", country: "Canada" },
  { location: "Mexico City, Mexico", country: "Mexico" },
  { location: "Sao Paulo, Brazil", country: "Brazil" },
  { location: "London, United Kingdom", country: "United Kingdom" },
  { location: "Berlin, Germany", country: "Germany" },
  { location: "Paris, France", country: "France" },
  { location: "Madrid, Spain", country: "Spain" },
  { location: "Amsterdam, Netherlands", country: "Netherlands" },
  { location: "Stockholm, Sweden", country: "Sweden" },
  { location: "Warsaw, Poland", country: "Poland" },
  { location: "Bangalore, India", country: "India" },
  { location: "Hyderabad, India", country: "India" },
  { location: "Singapore", country: "Singapore" },
  { location: "Kuala Lumpur, Malaysia", country: "Malaysia" },
  { location: "Jakarta, Indonesia", country: "Indonesia" },
  { location: "Manila, Philippines", country: "Philippines" },
  { location: "Tokyo, Japan", country: "Japan" },
  { location: "Seoul, South Korea", country: "South Korea" },
  { location: "Sydney, Australia", country: "Australia" },
  { location: "Auckland, New Zealand", country: "New Zealand" },
  { location: "Dubai, United Arab Emirates", country: "United Arab Emirates" },
  { location: "Riyadh, Saudi Arabia", country: "Saudi Arabia" },
  { location: "Johannesburg, South Africa", country: "South Africa" },
  { location: "Lagos, Nigeria", country: "Nigeria" },
  { location: "Nairobi, Kenya", country: "Kenya" },
  { location: "Remote - Worldwide", country: "Worldwide" },
];

const BLUEPRINTS: SeedBlueprint[] = [
  {
    category: "Machine Learning",
    sector: "AI & Data",
    current: 42,
    previous: 26,
    titles: [
      "Machine Learning Engineer",
      "Applied AI Engineer",
      "LLM Platform Engineer",
      "Computer Vision Engineer",
      "NLP Scientist",
    ],
    tags: ["python", "pytorch", "mlops", "llm", "transformers"],
    companies: ["Atlas AI", "Neon Grid", "SignalMind", "Cortex Labs", "Quanta Systems"],
  },
  {
    category: "Cybersecurity",
    sector: "Security",
    current: 34,
    previous: 20,
    titles: [
      "Cybersecurity Analyst",
      "Application Security Engineer",
      "Security Operations Engineer",
      "Threat Detection Specialist",
      "DevSecOps Engineer",
    ],
    tags: ["siem", "threat intel", "soc", "iam", "zero trust"],
    companies: ["ShieldForge", "Aegis Core", "Vault Mesh", "Sentinel Arc", "Red Harbor"],
  },
  {
    category: "Cloud & DevOps",
    sector: "Infrastructure",
    current: 30,
    previous: 29,
    titles: [
      "Platform Engineer",
      "DevOps Engineer",
      "Site Reliability Engineer",
      "Cloud Infrastructure Engineer",
      "Kubernetes Engineer",
    ],
    tags: ["aws", "kubernetes", "terraform", "ci/cd", "observability"],
    companies: ["Northline Cloud", "GridScale", "OrbitOps", "Cloud Harbor", "Infra Loom"],
  },
  {
    category: "Data Engineering",
    sector: "AI & Data",
    current: 26,
    previous: 22,
    titles: [
      "Data Engineer",
      "Analytics Engineer",
      "Data Platform Engineer",
      "Big Data Engineer",
      "Streaming Data Engineer",
    ],
    tags: ["spark", "dbt", "airflow", "snowflake", "kafka"],
    companies: ["ByteRiver", "Metric Hive", "Lakeframe", "PulseData", "Stream Atlas"],
  },
  {
    category: "Backend Development",
    sector: "Software Engineering",
    current: 24,
    previous: 28,
    titles: [
      "Backend Engineer",
      "API Engineer",
      "Distributed Systems Engineer",
      "Senior Software Engineer - Backend",
      "Platform Backend Developer",
    ],
    tags: ["java", "golang", "node", "microservices", "postgres"],
    companies: ["CoreNest", "Pulse API", "Stonebridge", "Serverwave", "Backend Foundry"],
  },
  {
    category: "Frontend Development",
    sector: "Software Engineering",
    current: 18,
    previous: 20,
    titles: [
      "Frontend Engineer",
      "React Developer",
      "UI Engineer",
      "Web Platform Engineer",
      "Senior Frontend Developer",
    ],
    tags: ["react", "typescript", "next.js", "design systems", "web"],
    companies: ["Pixel Current", "Wave UI", "Prism Layer", "Canvas Labs", "Northbound"],
  },
  {
    category: "QA Automation",
    sector: "Software Engineering",
    current: 16,
    previous: 15,
    titles: [
      "QA Automation Engineer",
      "SDET",
      "Quality Engineering Specialist",
      "Automation Test Engineer",
      "Software Quality Engineer",
    ],
    tags: ["playwright", "cypress", "api testing", "automation", "ci"],
    companies: ["Quality Arc", "Test Harbor", "Blue Canary", "Lint Labs", "Assurely"],
  },
  {
    category: "IT Support",
    sector: "IT Operations",
    current: 14,
    previous: 18,
    titles: [
      "IT Support Specialist",
      "Technical Support Engineer",
      "Help Desk Analyst",
      "Systems Support Engineer",
      "Service Desk Technician",
    ],
    tags: ["windows", "networking", "service desk", "itil", "troubleshooting"],
    companies: ["Deskline", "AssistOps", "Support Wave", "Metro IT", "Nodecare"],
  },
];

function pickFrom<T>(items: T[], seed: number): T {
  return items[Math.abs(seed) % items.length];
}

function createPostedAt(now: number, seed: number, currentWindow: boolean): string {
  const dayOffset = currentWindow ? Math.abs(seed % 30) : 30 + Math.abs(seed % 30);
  const hourOffset = Math.abs(seed % 24);
  return new Date(now - dayOffset * 24 * 60 * 60 * 1000 - hourOffset * 60 * 60 * 1000).toISOString();
}

function toSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function createSeedOpenings(now = new Date()): JobOpening[] {
  const nowTimestamp = now.getTime();
  const jobs: JobOpening[] = [];

  BLUEPRINTS.forEach((blueprint, blueprintIndex) => {
    const buildPosting = (currentWindow: boolean, count: number, offset: number) => {
      for (let i = 0; i < count; i += 1) {
        const baseSeed = blueprintIndex * 1000 + offset * 100 + i;
        const locationChoice = pickFrom(LOCATIONS, baseSeed + 7);
        const titleChoice = pickFrom(blueprint.titles, baseSeed + 13);
        const companyChoice = pickFrom(blueprint.companies, baseSeed + 17);
        const sourceChoice = pickFrom(SOURCE_POOL, baseSeed + 19);

        jobs.push({
          id: `seed-${toSlug(blueprint.category)}-${currentWindow ? "cur" : "prev"}-${i}`,
          source: sourceChoice,
          title: titleChoice,
          company: companyChoice,
          url: `https://example.com/jobs/${toSlug(companyChoice)}-${toSlug(titleChoice)}-${baseSeed}`,
          postedAt: createPostedAt(nowTimestamp, baseSeed + 23, currentWindow),
          location: locationChoice.location,
          country: locationChoice.country,
          region: inferRegion(locationChoice.country),
          sector: blueprint.sector,
          category: blueprint.category,
          employmentType: i % 7 === 0 ? "Contract" : "Full-time",
          tags: blueprint.tags,
        });
      }
    };

    buildPosting(true, blueprint.current, 1);
    buildPosting(false, blueprint.previous, 2);
  });

  return jobs;
}
