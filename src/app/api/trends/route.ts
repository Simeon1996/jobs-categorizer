import { NextResponse } from "next/server";

import { getTrendSnapshot } from "@/lib/job-intel";

export const revalidate = 1800;

export async function GET() {
  const snapshot = await getTrendSnapshot();
  return NextResponse.json(snapshot);
}
