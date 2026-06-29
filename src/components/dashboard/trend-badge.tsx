import type { TrendDirection } from "@/lib/job-intel/types";

interface TrendBadgeProps {
  direction: TrendDirection;
  growthRate: number;
}

const DIRECTION_LABEL: Record<TrendDirection, string> = {
  rising: "Rising",
  falling: "Falling",
  stable: "Stable",
};

export function TrendBadge({ direction, growthRate }: TrendBadgeProps) {
  const colorClass =
    direction === "rising"
      ? "bg-emerald-100 text-emerald-800"
      : direction === "falling"
        ? "bg-rose-100 text-rose-800"
        : "bg-amber-100 text-amber-800";

  const signedRate = growthRate > 0 ? `+${growthRate}%` : `${growthRate}%`;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${colorClass}`}
    >
      <span>{DIRECTION_LABEL[direction]}</span>
      <span>{signedRate}</span>
    </span>
  );
}
