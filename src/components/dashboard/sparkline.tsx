interface SparklineProps {
  points: number[];
  stroke?: string;
  fill?: string;
}

function buildPath(points: number[], width: number, height: number): string {
  if (points.length === 0) {
    return "";
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(max - min, 1);
  const stepX = width / Math.max(points.length - 1, 1);

  return points
    .map((point, index) => {
      const x = index * stepX;
      const y = height - ((point - min) / range) * height;
      const prefix = index === 0 ? "M" : "L";
      return `${prefix} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export function Sparkline({
  points,
  stroke = "var(--accent-strong)",
  fill = "url(#trendFill)",
}: SparklineProps) {
  const width = 380;
  const height = 100;
  const path = buildPath(points, width, height);
  const fillPath = `${path} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="30-day job opening trend"
      className="h-28 w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent-soft)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--accent-soft)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {path ? (
        <>
          <path d={fillPath} fill={fill} />
          <path d={path} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : null}
    </svg>
  );
}
