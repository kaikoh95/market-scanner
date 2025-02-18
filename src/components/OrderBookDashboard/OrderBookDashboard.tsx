"use client";

import React, { useEffect, useState } from "react";
import { formatNumber } from "../../utils/formatNumber";
import { useTheme } from "../ThemeContext/ThemeContext";
import styles from "./OrderBookDashboard.module.scss";

interface Order {
  symbol: string;
  price: number;
  volume: number;
  side: string;
  timestamp: string;
}

interface OrderBookDashboardProps {
  symbol: string;
  theme: "light" | "dark";
}

const OrderBookDashboard: React.FC<OrderBookDashboardProps> = ({ symbol, theme }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRange, setSelectedRange] = useState<string>("day");

  const fetchOrderData = async () => {
    try {
      const response = await fetch(
        `/api/historical/${symbol}?time_range=${selectedRange}`
      );
      const data = await response.json();
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order book data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderData();
    const interval = setInterval(fetchOrderData, 5000);
    return () => clearInterval(interval);
  }, [symbol, selectedRange]);

  return (
    <div 
      className={styles.orderBookContainer}
      data-theme={theme}
    >
      <div className={styles.tableContainer}>
        <h2 className={styles.title}>
          Order Book for {symbol} ({selectedRange})
        </h2>
        {loading ? (
          <p>Loading order book data...</p>
        ) : orders.length === 0 ? (
          <p>No order data available.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Time</th>
                <th>Price</th>
                <th>Volume</th>
                <th>Side</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={index}>
                  <td>{new Date(order.timestamp).toLocaleString()}</td>
                  <td>${formatNumber(order.price)}</td>
                  <td>{formatNumber(order.volume)}</td>
                  <td>{order.side}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className={styles.buttonGroup}>
          <button
            onClick={() => {
              setSelectedRange("day");
              setLoading(true);
            }}
            className={`${styles.tabButton} ${
              selectedRange === "day" ? styles.activeButton : ""
            }`}
          >
            1 Day
          </button>
          <button
            onClick={() => {
              setSelectedRange("5day");
              setLoading(true);
            }}
            className={`${styles.tabButton} ${
              selectedRange === "5day" ? styles.activeButton : ""
            }`}
          >
            5 Days
          </button>
          {/* Add additional buttons for other ranges as needed */}
        </div>
      </div>
    </div>
  );
};

export default OrderBookDashboard;
