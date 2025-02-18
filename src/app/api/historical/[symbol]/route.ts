import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export async function GET(
  request: Request,
  context: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await context.params;
  const { searchParams } = new URL(request.url);
  const time_range = searchParams.get("time_range") || "day";

  // Calculate period1 based on the time_range
  const now = new Date();
  let period1: Date;

  switch (time_range) {
    case "day":
      period1 = new Date(now.getTime() - 1 * 24 * 3600 * 1000);
      break;
    case "5day":
      period1 = new Date(now.getTime() - 5 * 24 * 3600 * 1000);
      break;
    case "week":
      period1 = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
      break;
    case "month":
      period1 = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
      break;
    case "1year":
      period1 = new Date(now.getTime() - 365 * 24 * 3600 * 1000);
      break;
    case "5year":
      period1 = new Date(now.getTime() - 5 * 365 * 24 * 3600 * 1000);
      break;
    case "max":
      period1 = new Date(0); // Epoch
      break;
    default:
      period1 = new Date(now.getTime() - 1 * 24 * 3600 * 1000);
      break;
  }
  const period2 = now;

  // Update interval mapping to use only accepted values: "1d", "1wk", or "1mo"
  const intervalMapping: Record<string, string> = {
    day: "1d",
    "5day": "1d",
    week: "1d",
    month: "1d",
    "1year": "1mo",
    "5year": "1mo",
    max: "1mo",
  };
  const interval = (intervalMapping[time_range] || "1d") as "1d" | "1mo" | "1wk" | undefined;

  try {
    const data = await yahooFinance.historical(symbol, {
      period1,
      period2,
      interval,
    });
    const events = data.map((row) => ({
      symbol: symbol.toUpperCase(),
      price: Number(row.close.toFixed(2)),
      volume: row.volume,
      side: "trade",
      timestamp: row.date.toISOString(),
    }));
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching historical data:", error);
    return NextResponse.json([], { status: 500 });
  }
}
