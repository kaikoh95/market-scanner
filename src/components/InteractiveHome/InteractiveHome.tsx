"use client";

import React from "react";
import { useRouter } from "next/navigation";
import PriceVolumeChart from "@/components/PriceVolumeChart/PriceVolumeChart";
import StockStats from "@/components/StockStats/StockStats";
import StockInfo from "@/components/StockInfo/StockInfo";
import UpcomingEvents from "@/components/UpcomingEvents/UpcomingEvents";
import OrderBookDashboard from "@/components/OrderBookDashboard/OrderBookDashboard";
import OptionsChainPage from "@/components/OptionsChain/OptionsChainPage";
import AlertsDashboard from "@/components/AlertsDashboard/AlertsDashboard";
import { MdHome } from "react-icons/md";
import { useTheme, ThemeProvider } from "@/components/ThemeContext/ThemeContext";
import styles from "@/components/InteractiveHome/InteractiveHome.module.scss";

function InteractiveHomeContent({ symbol }: { symbol: string }) {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <div className={styles.container}>
      <nav className={styles.navBar}>
        <div className={styles.navTitle} onClick={() => router.push("/")}>
          <MdHome size={32} />
          Market Order Scanner
        </div>
        <div className={styles.navLinks}>
          {/* You can add additional navigation links here if needed */}
        </div>
      </nav>
      <div className={styles.card}>
        <PriceVolumeChart symbol={symbol} />
      </div>
      <div className={styles.card}>
        <StockStats symbol={symbol} />
      </div>
      <div className={styles.card}>
        <StockInfo symbol={symbol} />
      </div>
      <div className={styles.card}>
        <UpcomingEvents symbol={symbol} />
      </div>
      <div className={styles.card}>
        <OptionsChainPage symbol={symbol} />
      </div>
      <div className={styles.card}>
        <OrderBookDashboard symbol={symbol} />
      </div>
      <div className={styles.card}>
        <AlertsDashboard />
      </div>
    </div>
  );
}

export default function InteractiveHome({ symbol }: { symbol: string }) {
  return (
    <ThemeProvider>
      <InteractiveHomeContent symbol={symbol} />
    </ThemeProvider>
  );
}
