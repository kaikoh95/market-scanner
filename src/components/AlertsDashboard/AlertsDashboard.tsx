// /components/AlertsDashboard/AlertsDashboard.tsx
"use client";

import React from "react";
import styles from "./AlertsDashboard.module.scss";

const AlertsDashboard: React.FC = () => {
  return (
    <div className={styles.alertsContainer}>
      <h2>Alerts</h2>
      <p>No live alerts available in historical mode.</p>
    </div>
  );
};

export default AlertsDashboard;
