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
  context: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await context.params;
  try {
    const ticker = await yahooFinance.quoteSummary(symbol, {
      modules: ["price", "defaultKeyStatistics"],
    });
    const info = ticker.price;
    
    if (!info) {
      return NextResponse.json(
        { error: "No price data found" },
        { status: 404 }
      );
    }

    const statsData = {
      marketCap: info.marketCap,
      fiftyTwoWeekHigh: null,
      fiftyTwoWeekLow: null,
      trailingPE: null,
      regularMarketOpen: info.regularMarketOpen,
      regularMarketPreviousClose: info.regularMarketPreviousClose,
      forwardPE: null,
      dividendYield: null,
      calendar: ticker.calendarEvents || {},
    };

    return NextResponse.json(serialize(statsData));
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Error fetching stats" }, 
      { status: 500 }
    );
  }
}
