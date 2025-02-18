import React from "react";
import OptionsChainPage from "@/components/OptionsChain/OptionsChainPage";

export const metadata = {
  title: "Options Chain",
  description: "Full options chain data for selected stock.",
};

export default async function OptionsPage({
  params,
}: {
  params: Promise<{ ticker: string }>
}) {
  const { ticker } = await params;
  return <OptionsChainPage symbol={ticker} />;
}
