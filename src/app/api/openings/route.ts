import { NextRequest, NextResponse } from "next/server";

import { getLatestOpenings } from "@/lib/job-intel";

export const revalidate = 1800;

export async function GET(request: NextRequest) {
  const limitParam = request.nextUrl.searchParams.get("limit");
  const parsedLimit = limitParam ? Number.parseInt(limitParam, 10) : 40;
  const openings = await getLatestOpenings(parsedLimit);

  return NextResponse.json({
    count: openings.length,
    openings,
  });
}
