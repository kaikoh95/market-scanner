"use client";

import React, { useEffect, useState } from "react";
import styles from "@/components/OptionsChain/OptionsChainPage.module.scss";

interface Option {
  contractSymbol: string;
  expiration: string; // ISO date string
  strike: number;
  lastPrice: number;
  bid: number;
  ask: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
}

interface OptionsChainData {
  calls: Option[];
  puts: Option[];
}

interface StockInfo {
  symbol: string;
  optionsChain: OptionsChainData;
}

interface OptionsChainPageProps {
  symbol: string;
}

const OptionsChainPage: React.FC<OptionsChainPageProps> = ({ symbol }) => {
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedExpiry, setSelectedExpiry] = useState<string>("");

  // Fetch options chain data from backend /stockinfo/{symbol}
  useEffect(() => {
    const fetchOptionsChain = async () => {
      try {
        const res = await fetch(`/api/stockinfo/${symbol}`);
        const data = await res.json();
        if (data.optionsChain) {
          // Filter out expired options from calls and puts
          const today = new Date();
          data.optionsChain.calls = (data.optionsChain.calls || []).filter(
            (opt: Option) => new Date(opt.expiration) >= today
          );
          data.optionsChain.puts = (data.optionsChain.puts || []).filter(
            (opt: Option) => new Date(opt.expiration) >= today
          );
        }
        setStockInfo(data);
      } catch (error) {
        console.error("Error fetching options chain:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOptionsChain();
  }, [symbol]);

  // Always compute expiries (even if stockInfo is null)
  const expiries = stockInfo && stockInfo.optionsChain && stockInfo.optionsChain.calls
    ? Array.from(
        new Set(stockInfo.optionsChain.calls.map((opt: Option) => opt.expiration))
      ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    : [];

  // Set default selected expiry if not already set
  useEffect(() => {
    if (expiries.length > 0 && !selectedExpiry) {
      setSelectedExpiry(expiries[0]);
    }
  }, [expiries, selectedExpiry]);

  // Filter options based on the selected expiration
  const filteredCalls =
    stockInfo && stockInfo.optionsChain
      ? stockInfo.optionsChain.calls.filter(
          (opt: Option) => opt.expiration === selectedExpiry
        )
      : [];
  const filteredPuts =
    stockInfo && stockInfo.optionsChain
      ? stockInfo.optionsChain.puts.filter(
          (opt: Option) => opt.expiration === selectedExpiry
        )
      : [];

  const renderOptionsTable = (options: Option[]) => (
    <table className={styles.optionsTable}>
      <thead>
        <tr>
          <th>Contract</th>
          <th>Strike</th>
          <th>Last</th>
          <th>Bid</th>
          <th>Ask</th>
          <th>Volume</th>
          <th>OI</th>
          <th>IV</th>
        </tr>
      </thead>
      <tbody>
        {options.map((option) => (
          <tr key={option.contractSymbol}>
            <td>{option.contractSymbol}</td>
            <td>{option.strike.toFixed(2)}</td>
            <td>{option.lastPrice.toFixed(2)}</td>
            <td>{option.bid.toFixed(2)}</td>
            <td>{option.ask.toFixed(2)}</td>
            <td>{option.volume ?? "N/A"}</td>
            <td>{option.openInterest ?? "N/A"}</td>
            <td>{(option.impliedVolatility * 100).toFixed(2)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className={styles.container}>
      {loading && <p className={styles.loading}>Loading options chain...</p>}
      {!loading && (!stockInfo || !stockInfo.optionsChain) && (
        <p className={styles.error}>No options chain data available.</p>
      )}
      {!loading && stockInfo && stockInfo.optionsChain && (
        <>
          <h1 className={styles.pageTitle}>
            Options Chain for {stockInfo.symbol}
          </h1>

          <div className={styles.dropdownContainer}>
            <label htmlFor="expirySelect">Select Expiration:</label>
            <select
              id="expirySelect"
              value={selectedExpiry}
              onChange={(e) => setSelectedExpiry(e.target.value)}
            >
              {expiries.map((expiry) => (
                <option key={expiry} value={expiry}>
                  {new Date(expiry).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Call Options</h2>
            {filteredCalls.length > 0 ? (
              renderOptionsTable(filteredCalls)
            ) : (
              <p className={styles.noData}>
                No call options available for this expiration.
              </p>
            )}
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Put Options</h2>
            {filteredPuts.length > 0 ? (
              renderOptionsTable(filteredPuts)
            ) : (
              <p className={styles.noData}>
                No put options available for this expiration.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OptionsChainPage;
