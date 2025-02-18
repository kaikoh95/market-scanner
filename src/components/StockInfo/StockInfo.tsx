// /components/StockInfo/StockInfo.tsx
"use client";
import React, { useEffect, useState } from "react";
import CalendarCard from "@/components/CalendarCard/CalendarCard";
import styles from "@/components/StockInfo/StockInfo.module.scss";

interface NewsItem {
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: number;
}

interface OptionsChain {
  calls: any[];
  puts: any[];
}

interface StockInfoData {
  symbol: string;
  exchange: string;
  upcomingNews: NewsItem[];
  optionsChain: OptionsChain;
  activity: { timestamp: string; description: string }[];
  calendar: any;
}

interface StockInfoProps {
  symbol: string;
}

const StockInfo: React.FC<StockInfoProps> = ({ symbol }) => {
  const [stockInfo, setStockInfo] = useState<StockInfoData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStockInfo = async () => {
      try {
        const res = await fetch(`/api/stockinfo/${symbol}`);
        const data = await res.json();
        setStockInfo(data);
      } catch (error) {
        console.error("Error fetching stock info:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStockInfo();
  }, [symbol]);

  if (loading) return <p className={styles.loading}>Loading stock info...</p>;
  if (!stockInfo) return <p className={styles.error}>No stock info available.</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>
        {stockInfo.symbol} - {stockInfo.exchange}
      </h2>
      <div className={styles.cardSection}>
        <h3 className={styles.sectionHeader}>Upcoming News</h3>
        {stockInfo.upcomingNews.length > 0 ? (
          <ul className={styles.newsList}>
            {stockInfo.upcomingNews.map((news, idx) => (
              <li key={idx} className={styles.newsItem}>
                <a href={news.link} target="_blank" rel="noopener noreferrer">
                  {news.title || "No Title"} — {news.publisher || "Unknown"}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No upcoming news available.</p>
        )}
      </div>
      <div className={styles.cardSection}>
        <h3 className={styles.sectionHeader}>Options Chain Summary</h3>
        <p>Calls: {stockInfo.optionsChain.calls.length} items</p>
        <p>Puts: {stockInfo.optionsChain.puts.length} items</p>
      </div>
      <div className={styles.cardSection}>
        <h3 className={styles.sectionHeader}>Recent Activity</h3>
        {stockInfo.activity.length > 0 ? (
          <ul className={styles.activityList}>
            {stockInfo.activity.map((act, idx) => (
              <li key={idx}>
                {new Date(act.timestamp).toLocaleString()}: {act.description}
              </li>
            ))}
          </ul>
        ) : (
          <p>No recent activity.</p>
        )}
      </div>
      {stockInfo.calendar && Object.keys(stockInfo.calendar).length > 0 && (
        <div className={styles.cardSection}>
            <CalendarCard calendar={stockInfo.calendar} />
        </div>
        )}
    </div>
  );
};

export default StockInfo;
