"use client";

import { memo } from "react";
import styles from "../Dashboard.module.css";
import { Campaign } from "../types";
import CampaignCard from "./CampaignCard";

type CampaignListProps = {
  campaigns: Campaign[];
  parseCount: (value: unknown[] | number | undefined) => number;
};

function CampaignList({ campaigns, parseCount }: CampaignListProps) {
  return (
    <div className={styles["campaign-list"]}>
      <h1>Your Campaigns</h1>

      {campaigns.length === 0 ? (
        <div className={styles["empty-state"]}>
          <h3>No campaigns found</h3>
          <p>Create a campaign or change your filters to view results.</p>
        </div>
      ) : (
        <div className={styles["campaign-grid"]}>
          {campaigns.map((item) => (
            <CampaignCard key={item._id} campaign={item} applicationsCount={parseCount(item.applications)} />
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(CampaignList);
