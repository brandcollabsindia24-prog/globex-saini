"use client";

import { memo } from "react";
import styles from "../Dashboard.module.css";
import { DashboardMetrics } from "../types";

type StatsCardsProps = {
  metrics: DashboardMetrics;
  shortlistedCount: number;
};

function StatsCards({ metrics, shortlistedCount }: StatsCardsProps) {
  return (
    <div className={styles["stats-grid"]}>
      <div className={styles["stat-card"]}>
        <p>Total Campaigns</p>
        <h3>{metrics.total}</h3>
      </div>
      <div className={styles["stat-card"]}>
        <p>Active Campaigns</p>
        <h3>{metrics.active}</h3>
      </div>
      <div className={styles["stat-card"]}>
        <p>Completed Campaigns</p>
        <h3>{metrics.completed}</h3>
      </div>
      <div className={styles["stat-card"]}>
        <p>Applications Received</p>
        <h3>{metrics.totalApplications}</h3>
      </div>
      <div className={styles["stat-card"]}>
        <p>Total Budget Planned</p>
        <h3>INR {metrics.totalBudget.toLocaleString("en-IN")}</h3>
      </div>
      <div className={styles["stat-card"]}>
        <p>Influencers Shortlisted</p>
        <h3>{shortlistedCount || metrics.selectedInfluencers}</h3>
      </div>
    </div>
  );
}

export default memo(StatsCards);
