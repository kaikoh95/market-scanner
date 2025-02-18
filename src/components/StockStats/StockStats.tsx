// /components/StockStats/StockStats.tsx
"use client";

import React, { useEffect, useState } from "react";
import { formatNumber } from "../../utils/formatNumber";
import { MdShowChart } from "react-icons/md";
import styles from "./StockStats.module.scss";
import CalendarCard from "../CalendarCard/CalendarCard";

interface StockStatsProps {
  symbol: string;
}

interface Stats {
  marketCap?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  trailingPE?: number;
  regularMarketOpen?: number;
  regularMarketPreviousClose?: number;
  forwardPE?: number;
  dividendYield?: number;
  calendar?: any;
}

const StockStats: React.FC<StockStatsProps> = ({ symbol }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/stats/${symbol}`);
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stock stats:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [symbol]);

  if (loading) return <p>Loading stock stats...</p>;
  if (!stats) return <p>No stats available.</p>;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <MdShowChart size={28} />
        <span>{symbol} Stats</span>
      </div>
      <div className={styles.grid}>
        <div className={styles.statItem}>
          <span className={styles.label}>Market Cap</span>
          <span className={styles.value}>
            {stats.marketCap ? formatNumber(stats.marketCap) : "N/A"}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.label}>52W High</span>
          <span className={styles.value}>
            {stats.fiftyTwoWeekHigh ? formatNumber(stats.fiftyTwoWeekHigh) : "N/A"}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.label}>52W Low</span>
          <span className={styles.value}>
            {stats.fiftyTwoWeekLow ? formatNumber(stats.fiftyTwoWeekLow) : "N/A"}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.label}>Trailing PE</span>
          <span className={styles.value}>
            {stats.trailingPE?.toFixed(2) || "N/A"}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.label}>Open</span>
          <span className={styles.value}>
            {stats.regularMarketOpen !== undefined ? stats.regularMarketOpen.toFixed(2) : "N/A"}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.label}>Prev Close</span>
          <span className={styles.value}>
            {stats.regularMarketPreviousClose?.toFixed(2) || "N/A"}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.label}>Forward PE</span>
          <span className={styles.value}>
            {stats.forwardPE !== undefined ? stats.forwardPE.toFixed(2) : "N/A"}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.label}>Dividend Yield</span>
          <span className={styles.value}>
            {stats.dividendYield?.toFixed(2) || "N/A"}
          </span>
        </div>
      </div>
      {stats.calendar && Object.keys(stats.calendar).length > 0 && (
        <div className={styles.calendar}>
          <CalendarCard calendar={stats.calendar} />
        </div>
      )}
    </div>
  );
};

export default StockStats;
