import React from "react";
import LandingPage from "../components/LandingPage/LandingPage";

export const metadata = {
  title: "Welcome to Market Order Scanner",
  description: "Search for a stock ticker to view historical charts, stats, options chain, and upcoming events.",
};

export default function Page() {
  return <LandingPage />;
}
