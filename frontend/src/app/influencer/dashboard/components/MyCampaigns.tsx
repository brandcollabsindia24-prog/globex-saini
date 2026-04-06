"use client";

import styles from "../InfluencerDashboard.module.css";
import { DashboardPayload, STATUS_LABEL } from "../types";

type MyCampaignsProps = {
  dashboard: DashboardPayload;
};

function formatBudget(value: string | number): string {
  const numeric = Number(String(value).replace(/[^\d.]/g, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) return "N/A";
  return `Rs. ${new Intl.NumberFormat("en-IN").format(Math.round(numeric))}`;
}

function renderCampaignCards(
  items: DashboardPayload["myCampaigns"]["applied"],
  emptyText: string
) {
  if (items.length === 0) {
    return <p>{emptyText}</p>;
  }

  return (
    <div className={styles.cardsContainer}>
      {items.map((app) => (
        <article key={app._id} className={`${styles.card} ${styles.campaignCard}`}>
          {app.campaignId?.imageFile ? (
            <img src={app.campaignId.imageFile} alt={app.campaignId?.title || "Campaign"} className={styles.campaignImg} />
          ) : (
            <div className={styles.campaignImagePlaceholder}>No Image</div>
          )}

          <h3 className={styles.campaignCardTitle}>{app.campaignId?.title || "Campaign"}</h3>

          <div className={styles.campaignBudgetRow}>
            <p className={styles.campaignBudgetText}>Budget: {formatBudget(app.campaignId?.budget || 0)}</p>
          </div>

          <p className="text-sm text-slate-500">Timeline: {app.campaignId?.timeline || "N/A"}</p>
          <p className="text-sm text-slate-500">Status: {STATUS_LABEL[app.status]}</p>
        </article>
      ))}
    </div>
  );
}

export default function MyCampaigns({ dashboard }: MyCampaignsProps) {
  return (
    <section id="my-campaigns-section" className={styles.brandCards}>
      <h2>My Campaigns</h2>

      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-semibold mb-3">Applied Campaigns</h3>
          {renderCampaignCards(dashboard.myCampaigns.applied, "No applied campaigns.")}
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3">Ongoing Campaigns</h3>
          {renderCampaignCards(dashboard.myCampaigns.ongoing, "No ongoing campaigns.")}
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3">Completed Campaigns</h3>
          {renderCampaignCards(dashboard.myCampaigns.completed, "No completed campaigns.")}
        </div>
      </div>
    </section>
  );
}
