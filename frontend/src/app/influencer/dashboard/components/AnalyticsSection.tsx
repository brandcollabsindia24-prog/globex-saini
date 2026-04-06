"use client";

import styles from "../InfluencerDashboard.module.css";
import { DashboardPayload } from "../types";

type AnalyticsSectionProps = {
  dashboard: DashboardPayload;
};

export default function AnalyticsSection({ dashboard }: AnalyticsSectionProps) {
  return (
    <section id="analytics-section" className={styles.dashboardInsights}>
      <div className={styles.insightsHeader}>
        <h2>Analytics Dashboard</h2>
        <p>Total earnings, success rate, engagement, profile views and campaign flow in one place.</p>
      </div>

      <div className={styles.statsGrid}>
        <article className={styles.statCard}>
          <h3>Total Earnings</h3>
          <p>INR {dashboard.analytics.totalEarnings.toLocaleString("en-IN")}</p>
        </article>
        <article className={styles.statCard}>
          <h3>Campaign Success Rate</h3>
          <p>{dashboard.analytics.successRate}%</p>
        </article>
        <article className={styles.statCard}>
          <h3>Avg Engagement</h3>
          <p>{dashboard.analytics.avgEngagement}%</p>
        </article>
        <article className={styles.statCard}>
          <h3>Profile Views</h3>
          <p>{dashboard.analytics.profileViews}</p>
        </article>
      </div>
    </section>
  );
}
