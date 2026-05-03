import { fetchQuery } from "convex/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { api } from "../../../../convex/_generated/api";
import { AUTOCOMPLETE_TYPES, type AutocompleteType } from "../../../../convex/autocompleteTypes";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const typeParam = searchParams.get("type");
  const query = searchParams.get("query") || undefined;
  const limitStr = searchParams.get("limit") || searchParams.get("size");

  if (!typeParam) {
    return NextResponse.json({ error: "Missing type parameter" }, { status: 400 });
  }

  if (!AUTOCOMPLETE_TYPES.includes(typeParam as AutocompleteType)) {
    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
  }

  const type: AutocompleteType = typeParam as AutocompleteType;
  const limit = limitStr ? parseInt(limitStr, 10) : 50;

  try {
    const result = await fetchQuery(api.autocomplete.getOptions, { type, query, limit });
    return NextResponse.json(result ?? { suggestions: [] });
  } catch (error) {
    console.error("Error fetching search options:", error);
    return NextResponse.json({ error: "Failed to fetch search options" }, { status: 500 });
  }
}
