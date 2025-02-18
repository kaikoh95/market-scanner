"use client";
import React from "react";
import styles from "@/components/CalendarCard/CalendarCard.module.scss";
import { formatNumber } from "@/utils/formatNumber";

interface CalendarCardProps {
  calendar: Record<string, any>;
}

const CalendarCard: React.FC<CalendarCardProps> = ({ calendar }) => {
  // Recursive function to render a value.
  const renderValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "object") {
      // If it's an object (and not an array), render its keys recursively.
      if (!Array.isArray(value)) {
        return (
          <ul className={styles.nestedList}>
            {Object.entries(value).map(([subKey, subVal]) => (
              <li key={subKey}>
                <strong>{subKey}:</strong> {renderValue(subVal)}
              </li>
            ))}
          </ul>
        );
      }
      // If it's an array, render each item.
      return (
        <ul className={styles.nestedList}>
          {value.map((item: any, idx: number) => (
            <li key={idx}>{renderValue(item)}</li>
          ))}
        </ul>
      );
    }
    // If a number, format it.
    if (typeof value === "number") {
      return formatNumber(value);
    }
    return String(value);
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.header}>Upcoming Events</h3>
      {Object.entries(calendar).map(([key, value]) => (
        <div key={key} className={styles.item}>
          <span className={styles.label}>{key}:</span>{" "}
          <span className={styles.value}>{renderValue(value)}</span>
        </div>
      ))}
    </div>
  );
};

export default CalendarCard;
