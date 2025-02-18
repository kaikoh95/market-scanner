// components/HistoricalData.tsx
"use client";

import React, { useEffect, useState } from "react";

interface HistoricalEvent {
  symbol: string;
  price: number;
  volume: number;
  side: string;
  timestamp: string;
}

interface HistoricalDataProps {
  symbol: string;
}

const HistoricalData: React.FC<HistoricalDataProps> = ({ symbol }) => {
  const [data, setData] = useState<HistoricalEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchHistoricalData = async () => {
    try {
      const response = await fetch(`/api/historical/${symbol}`);
      const historicalData = await response.json();
      setData(historicalData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching historical data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoricalData();
  }, [symbol]);

  return (
    <div>
      <h2>Historical Data for {symbol}</h2>
      {loading ? (
        <p>Loading historical data...</p>
      ) : data.length === 0 ? (
        <p>No historical data available.</p>
      ) : (
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Time</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Price</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Volume</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Side</th>
            </tr>
          </thead>
          <tbody>
            {data.map((event, idx) => (
              <tr key={idx}>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {new Date(event.timestamp).toLocaleTimeString()}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  ${event.price}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {event.volume}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {event.side}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HistoricalData;
