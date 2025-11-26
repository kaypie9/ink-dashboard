import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ iconUrl: null }, { status: 400 });
  }

  try {
    // use Dexscreener search, it works with raw token address too
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(
        address
      )}`
    );

    if (!res.ok) {
      console.error("dexscreener search failed", res.status);
      return NextResponse.json({ iconUrl: null }, { status: 200 });
    }

    const data = await res.json();
    const pairs = Array.isArray((data as any).pairs) ? (data as any).pairs : [];

    // find first pair that has an info.imageUrl
    const withIcon = pairs.find(
      (p: any) => p?.info && typeof p.info.imageUrl === "string"
    );

    const iconUrl: string | null = withIcon?.info?.imageUrl ?? null;

    return NextResponse.json({ iconUrl }, { status: 200 });
  } catch (e) {
    console.error("token-icon api crashed", e);
    return NextResponse.json({ iconUrl: null }, { status: 200 });
  }
}
