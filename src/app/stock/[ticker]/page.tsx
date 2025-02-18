import React from "react";
import InteractiveHome from "@/components/InteractiveHome/InteractiveHome";

export const metadata = {
  title: "Stock Details",
  description: "Detailed view of charts, stats, options chain, upcoming events, and more for your selected stock.",
};

export default async function StockPage({
  params,
}: {
  params: Promise<{ ticker: string }>
}) {
  const { ticker } = await params;
  return <InteractiveHome symbol={ticker} />;
}
