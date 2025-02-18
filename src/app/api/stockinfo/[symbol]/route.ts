import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

function serialize(obj: any): any {
  if (obj instanceof Date) return obj.toISOString();
  if (obj instanceof Number || typeof obj === "number") {
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
    // Get a quote summary with desired modules
    const ticker = await yahooFinance.quoteSummary(symbol, {
      modules: ["price", "calendarEvents", "defaultKeyStatistics"],
    });

    const priceData = ticker.price || {};
    const exchange = priceData.exchangeName || "N/A";

    // For upcoming news, we use calendarEvents.earningsDate as a sample.
    const upcomingNews =
      ticker.calendarEvents && ticker.calendarEvents.earningsDate
        ? [
            {
              title: "Earnings Date",
              publisher: "",
              link: "",
              providerPublishTime: ticker.calendarEvents.earningsDate,
            },
          ]
        : [];

    // Options chain data is not provided by yahoo-finance2 so we return empty arrays.
    const optionsChain = { calls: [], puts: [] };

    // Activity placeholder
    const activity = [
      { timestamp: new Date().toISOString(), description: "No recent activity found." },
    ];

    // Use calendarEvents as calendar data (if available)
    const calendar = ticker.calendarEvents || {};

    const responseData = serialize({
      symbol: symbol.toUpperCase(),
      exchange,
      upcomingNews,
      optionsChain,
      activity,
      calendar,
    });
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching stock info:", error);
    return NextResponse.json({ error: "Error fetching stock info" }, { status: 500 });
  }
}
