import React from "react";
import OptionsChainPage from "@/components/OptionsChain/OptionsChainPage";

export const metadata = {
  title: "Options Chain",
  description: "Full options chain data (calls and puts) for your selected stock.",
};

export default function OptionsPage({ params }: { params: { ticker: string } }) {
  const { ticker } = params;
  return <OptionsChainPage symbol={ticker} />;
}
