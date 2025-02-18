"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./LandingPage.module.scss";

const LandingPage: React.FC = () => {
  const [ticker, setTicker] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim() !== "") {
      router.push(`/stock/${ticker.trim().toUpperCase()}`);
    }
  };

  return (
    <div className={styles.landingContainer}>
      <h1 className={styles.title}>Market Order Scanner</h1>
      <p className={styles.subtitle}>
        Enter a stock ticker to view historical charts, stats, options chain, and upcoming events.
      </p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="e.g., PLTR, TSLA, NVDA etc."
          className={styles.input}
        />
        <button type="submit" className={styles.searchButton}>
          SEARCH
        </button>
      </form>
    </div>
  );
};

export default LandingPage;
