"use client";

import styles from "../InfluencerDashboard.module.css";
import { DashboardPayload, STATUS_LABEL } from "../types";

type ApplicationStatusProps = {
  dashboard: DashboardPayload;
};

export default function ApplicationStatus({ dashboard }: ApplicationStatusProps) {
  return (
    <section id="application-status-section" className={styles.brandCards}>
      <h2>Campaign Application Status Tracking</h2>
      <div className="space-y-3">
        {dashboard.applications.length === 0 ? <p>No applications yet.</p> : null}
        {dashboard.applications.map((app) => (
          <article key={app._id} className={styles.card}>
            <p className="text-xs text-slate-500">Campaign</p>
            <h3 className="text-lg font-semibold">{app.campaignId?.title || "Campaign"}</h3>
            <p className="text-sm mt-1">Status: {STATUS_LABEL[app.status]}</p>
            <p className="text-sm">Payment: {app.paymentStatus || "pending"}</p>
            <p className="text-sm">Amount: INR {Number(app.paymentAmount || app.campaignId?.budget || 0)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
