import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

function serialize(obj: any): any {
  if (obj instanceof Date) return obj.toISOString();
  if (typeof obj === "number") {
    return Number.isFinite(obj) ? obj : null;
  }
  if (typeof obj === "object" && obj !== null) {
    if (Array.isArray(obj)) return obj.map(serialize);
    const out: Record<string, any> = {};
    for (const key in obj) {
      out[key] = serialize(obj[key]);
    }
    return out;
  }
  return obj;
}

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  const { symbol } = params;
  try {
    const ticker = await yahooFinance.quoteSummary(symbol, {
      modules: ["price", "defaultKeyStatistics"],
    });
    const info = ticker.price || {};
    const statsData = {
      marketCap: info.marketCap,
      fiftyTwoWeekHigh: info.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: info.fiftyTwoWeekLow,
      trailingPE: info.trailingPE,
      regularMarketOpen: info.regularMarketOpen,
      regularMarketPreviousClose: info.regularMarketPreviousClose,
      forwardPE: info.forwardPE,
      dividendYield: info.dividendYield,
      calendar: ticker.calendarEvents || {},
    };

    return NextResponse.json(serialize(statsData));
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Error fetching stats" }, { status: 500 });
  }
}
