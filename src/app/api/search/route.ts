import { fetchQuery } from "convex/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { api } from "../../../../convex/_generated/api";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type");
  const query = searchParams.get("query") || undefined;
  const limitStr = searchParams.get("limit") || searchParams.get("size");

  if (!type) {
    return NextResponse.json({ error: "Missing type parameter" }, { status: 400 });
  }

  const limit = limitStr ? parseInt(limitStr, 10) : 50;

  try {
    const result = await fetchQuery(api.searchOptions.getOptions, {
      type,
      query,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching search options:", error);
    return NextResponse.json({ error: "Failed to fetch search options" }, { status: 500 });
  }
}
