"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import styles from "../Dashboard.module.css";
import { Campaign } from "../types";

type CampaignCardProps = {
  campaign: Campaign;
  applicationsCount: number;
};

function formatBudget(value: string | number): string {
  const numeric = Number(String(value).replace(/[^\d.]/g, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) return "N/A";
  return `Rs. ${new Intl.NumberFormat("en-IN").format(Math.round(numeric))}`;
}

function parseNumberOfInfluencers(description: string, numberOfInfluencers?: number | string): number | null {
  if (numberOfInfluencers) {
    const num = Number(numberOfInfluencers);
    return Number.isFinite(num) && num > 0 ? num : null;
  }
  
  const match = description.match(/Number of Influencers[:\s]+(\d+)/i);
  if (match && match[1]) {
    const num = Number(match[1]);
    return Number.isFinite(num) && num > 0 ? num : null;
  }
  return null;
}

function calculatePricePerInfluencer(budget: string | number, numberOfInfluencers: number): string {
  const budgetNum = Number(String(budget).replace(/[^\d.]/g, ""));
  if (!Number.isFinite(budgetNum) || budgetNum <= 0) return "N/A";
  const pricePerInfluencer = Math.round(budgetNum / numberOfInfluencers);
  return `Rs. ${new Intl.NumberFormat("en-IN").format(pricePerInfluencer)}`;
}

function CampaignCard({ campaign, applicationsCount }: CampaignCardProps) {
  const router = useRouter();
  const numberOfInfluencers = parseNumberOfInfluencers(campaign.description, campaign.numberOfInfluencers);
  const pricePerInfluencer = numberOfInfluencers ? calculatePricePerInfluencer(campaign.budget, numberOfInfluencers) : "N/A";

  const openDetails = () => {
    router.push(`/brand/dashboard/campaign/${campaign._id}`);
  };

  return (
    <div
      className={styles["campaign-card"]}
      onClick={openDetails}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDetails();
        }
      }}
      aria-label={`Open details for ${campaign.title}`}
    >
      {campaign.imageFile ? (
        <img src={campaign.imageFile} alt={campaign.title} />
      ) : (
        <div className={styles["campaign-image-placeholder"]}>No Image</div>
      )}
      <h2>{campaign.title}</h2>
      <div className={styles["campaign-meta-row"]}>
        <p className={styles["campaign-meta-item"]}>
          <span className={styles["line-label"]}>Budget:</span> {formatBudget(campaign.budget)}
        </p>
        <p className={styles["campaign-meta-item"]}>
          <span className={styles["line-label"]}>Influencers:</span> {numberOfInfluencers || "N/A"}
        </p>
      </div>
      <div className={styles["campaign-meta-row"]}>
        <p className={styles["campaign-meta-item"]}>
          <span className={styles["line-label"]}>Price/Influencer:</span> {pricePerInfluencer}
        </p>
        <p className={styles["campaign-meta-item"]}>
          <span className={styles["line-label"]}>Applications:</span> {applicationsCount}
        </p>
      </div>
    </div>
  );
}

export default memo(CampaignCard);
