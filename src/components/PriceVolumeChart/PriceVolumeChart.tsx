"use client";

import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  LineController,
  BarController,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { formatNumber } from "@/utils/formatNumber";
import { useTheme } from "@/components/ThemeContext/ThemeContext";
import styles from "@/components/PriceVolumeChart/PriceVolumeChart.module.scss";

ChartJS.register(
  LineController,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Order {
  symbol: string;
  price: number;
  volume: number;
  side: string;
  timestamp: string;
}

interface PriceVolumeChartProps {
  symbol: string;
}

const timeRanges = [
  { label: "1 Day", value: "day" },
  { label: "5 Days", value: "5day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "1 Year", value: "1year" },
  { label: "5 Years", value: "5year" },
  { label: "Max", value: "max" },
];

const PriceVolumeChart: React.FC<PriceVolumeChartProps> = ({ symbol }) => {
  const { theme } = useTheme();
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRange, setSelectedRange] = useState<string>("day");
  const [firstPrice, setFirstPrice] = useState<number | null>(null);
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [prevClose, setPrevClose] = useState<number | null>(null);
  const [percentChange, setPercentChange] = useState<string>("N/A");

  const fetchChartData = async () => {
    try {
      const response = await fetch(`/api/historical/${symbol}?time_range=${selectedRange}`);
      const data: Order[] = await response.json();
      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }
      // Sort data by timestamp ascending
      const sorted = data.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      const labels = sorted.map((order) => new Date(order.timestamp).toLocaleString());
      const prices = sorted.map((order) => order.price);
      const volumes = sorted.map((order) => order.volume);

      setFirstPrice(prices[0]);
      setLastPrice(prices[prices.length - 1]);

      setChartData({
        labels,
        datasets: [
          {
            label: "Price",
            data: prices,
            type: "line",
            borderColor: "rgba(0,200,0,1)", // always green line
            backgroundColor: "transparent",
            yAxisID: "y",
            tension: 0.3,
          },
          {
            label: "Volume",
            data: volumes,
            type: "bar",
            borderColor: theme === "dark" ? "rgba(255,99,132,1)" : "rgba(255,99,132,0.8)",
            backgroundColor: theme === "dark" ? "rgba(255,99,132,0.2)" : "rgba(255,99,132,0.4)",
            yAxisID: "y1",
          },
        ],
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setLoading(false);
    }
  };

  // Fetch previous close when in day view
  useEffect(() => {
    const fetchPrevClose = async () => {
      if (selectedRange === "day") {
        try {
          const res = await fetch(`/api/stats/${symbol}`);
          const stats = await res.json();
          if (stats.regularMarketPreviousClose) {
            setPrevClose(stats.regularMarketPreviousClose);
          }
        } catch (error) {
          console.error("Error fetching previous close:", error);
        }
      } else {
        setPrevClose(null);
      }
    };
    fetchPrevClose();
  }, [symbol, selectedRange]);

  useEffect(() => {
    fetchChartData();
    const interval = setInterval(fetchChartData, 5000);
    return () => clearInterval(interval);
  }, [symbol, selectedRange, theme]);

  // Compute percentage change:
  useEffect(() => {
    if (lastPrice !== null) {
      if (selectedRange === "day" && prevClose !== null && prevClose !== 0) {
        const change = ((lastPrice - prevClose) / prevClose) * 100;
        setPercentChange(change.toFixed(2) + "%");
      } else if (firstPrice !== null && firstPrice !== 0) {
        const change = ((lastPrice - firstPrice) / firstPrice) * 100;
        setPercentChange(change.toFixed(2) + "%");
      } else {
        setPercentChange("N/A");
      }
    }
  }, [firstPrice, lastPrice, prevClose, selectedRange]);

  // Color: positive = green, negative = red.
  const percentColor =
    percentChange !== "N/A" && parseFloat(percentChange) >= 0 ? "green" : "red";
  const fontColor = theme === "dark" ? "#fff" : "#000";
  const gridColor = theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: { display: true, text: "Price ($)", color: fontColor },
        ticks: {
          callback: (value) => "$" + formatNumber(Number(value)),
          color: fontColor,
        },
        grid: { color: gridColor },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        title: { display: true, text: "Volume", color: fontColor },
        ticks: {
          callback: (value) => formatNumber(Number(value)),
          color: fontColor,
        },
        grid: { drawOnChartArea: false },
      },
      x: {
        ticks: { color: fontColor },
        grid: { color: gridColor },
      },
    },
    plugins: {
      title: {
        display: true,
        text: `Price & Volume for ${symbol} (${selectedRange})`,
        color: fontColor,
      },
      legend: { labels: { color: fontColor } },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            return `${label}: ${formatNumber(Number(value))}`;
          },
        },
      },
    },
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <div className={styles.stockSymbol}>{symbol}</div>
        {lastPrice !== null && (
          <>
            <div className={styles.latestPrice}>${formatNumber(lastPrice)}</div>
            {selectedRange === "day" && prevClose !== null && (
              <div className={styles.prevClose}>Prev Close: ${formatNumber(prevClose)}</div>
            )}
            <div className={styles.percentChange} style={{ color: percentColor }}>
              {percentChange}
            </div>
          </>
        )}
      </div>
      <div className={styles.buttonGroup}>
        {timeRanges.map((range) => (
          <button
            key={range.value}
            onClick={() => {
              setLoading(true);
              setSelectedRange(range.value);
            }}
            className={`${styles.tabButton} ${
              selectedRange === range.value ? styles.activeButton : ""
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
      {loading ? (
        <p style={{ color: fontColor }}>Loading chart data...</p>
      ) : !chartData ? (
        <p style={{ color: fontColor }}>No chart data available.</p>
      ) : (
        <div className={styles.chartWrapper}>
          <Chart data={chartData} options={options} type="bar" />
        </div>
      )}
    </div>
  );
};

export default PriceVolumeChart;
