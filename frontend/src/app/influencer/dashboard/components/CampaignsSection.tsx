"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../InfluencerDashboard.module.css";
import CampaignFilter from "./CampaignFilter";
import { Campaign } from "../types";

type CampaignsSectionProps = {
  availableCampaigns: Campaign[];
  categoryFilter: string;
  minBudgetFilter: string;
  maxBudgetFilter: string;
  followersFilter: string;
  setCategoryFilter: (value: string) => void;
  setMinBudgetFilter: (value: string) => void;
  setMaxBudgetFilter: (value: string) => void;
  setFollowersFilter: (value: string) => void;
};

const PLATFORM_ICON_META: Record<string, { label: string; icon: string }> = {
  instagram: { label: "Instagram", icon: "/instagram-icon.svg" },
  youtube: { label: "YouTube", icon: "/youtube-icon.svg" },
  facebook: { label: "Facebook", icon: "/facebook-icon.svg" },
};

const PLATFORM_ORDER = ["instagram", "youtube", "facebook"] as const;

function getSelectedPlatforms(description: string): string[] {
  const line = description
    .split("\n")
    .map((item) => item.trim())
    .find((item) => item.toLowerCase().startsWith("platforms:"));

  if (!line) {
    return [];
  }

  const raw = line.slice(line.indexOf(":") + 1);
  const selected = raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return PLATFORM_ORDER.filter((key) => selected.includes(key));
}

function formatBudget(value: string | number): string {
  const numeric = Number(String(value).replace(/[^\d.]/g, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) return "N/A";
  return `Rs. ${new Intl.NumberFormat("en-IN").format(Math.round(numeric))}`;
}

function parseNumeric(value: string | number | undefined): number {
  const numeric = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

export default function CampaignsSection({
  availableCampaigns,
  categoryFilter,
  minBudgetFilter,
  maxBudgetFilter,
  followersFilter,
  setCategoryFilter,
  setMinBudgetFilter,
  setMaxBudgetFilter,
  setFollowersFilter,
}: CampaignsSectionProps) {
  const router = useRouter();

  const [draftCategoryFilter, setDraftCategoryFilter] = useState(categoryFilter);
  const [draftMinBudgetFilter, setDraftMinBudgetFilter] = useState(minBudgetFilter);
  const [draftMaxBudgetFilter, setDraftMaxBudgetFilter] = useState(maxBudgetFilter);
  const [draftFollowersFilter, setDraftFollowersFilter] = useState(followersFilter);

  useEffect(() => {
    setDraftCategoryFilter(categoryFilter);
  }, [categoryFilter]);

  useEffect(() => {
    setDraftMinBudgetFilter(minBudgetFilter);
  }, [minBudgetFilter]);

  useEffect(() => {
    setDraftMaxBudgetFilter(maxBudgetFilter);
  }, [maxBudgetFilter]);

  useEffect(() => {
    setDraftFollowersFilter(followersFilter);
  }, [followersFilter]);

  const visibleCampaigns = useMemo(() => {
    const categoryQuery = categoryFilter.trim().toLowerCase();
    const minBudget = parseNumeric(minBudgetFilter);
    const maxBudget = parseNumeric(maxBudgetFilter);
    const minFollowers = parseNumeric(followersFilter);

    return availableCampaigns.filter((campaign) => {
      const categoryMatches = !categoryQuery || String(campaign.category || "").toLowerCase().includes(categoryQuery);
      const budgetValue = parseNumeric(campaign.budget);
      const followersValue = parseNumeric(campaign.followersRequired);

      const minBudgetMatches = !minBudget || budgetValue >= minBudget;
      const maxBudgetMatches = !maxBudget || budgetValue <= maxBudget;
      const followersMatches = !minFollowers || followersValue >= minFollowers;

      return categoryMatches && minBudgetMatches && maxBudgetMatches && followersMatches;
    });
  }, [availableCampaigns, categoryFilter, followersFilter, maxBudgetFilter, minBudgetFilter]);

  return (
    <section id="campaigns-section" className={styles.brandCards}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2>Available Campaigns</h2>
        <p className="text-sm text-slate-500">Showing {visibleCampaigns.length} of {availableCampaigns.length}</p>
      </div>
      <div className="mt-4 mb-6">
        <CampaignFilter
          categoryFilter={draftCategoryFilter}
          minBudgetFilter={draftMinBudgetFilter}
          maxBudgetFilter={draftMaxBudgetFilter}
          followersFilter={draftFollowersFilter}
          setCategoryFilter={setDraftCategoryFilter}
          setMinBudgetFilter={setDraftMinBudgetFilter}
          setMaxBudgetFilter={setDraftMaxBudgetFilter}
          setFollowersFilter={setDraftFollowersFilter}
          onSearch={() => {
            setCategoryFilter(draftCategoryFilter);
            setMinBudgetFilter(draftMinBudgetFilter);
            setMaxBudgetFilter(draftMaxBudgetFilter);
            setFollowersFilter(draftFollowersFilter);
          }}
        />
      </div>
      {visibleCampaigns.length === 0 ? (
        <p>No campaign matches current filters.</p>
      ) : (
        <div className={styles.cardsContainer}>
          {visibleCampaigns.map((campaign) => (
            <article
              key={campaign._id}
              className={`${styles.card} ${styles.campaignCard}`}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/influencer/dashboard/campaign/${campaign._id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  router.push(`/influencer/dashboard/campaign/${campaign._id}`);
                }
              }}
            >
              {campaign.imageFile ? (
                <img src={campaign.imageFile} alt={campaign.title} className={styles.campaignImg} />
              ) : (
                <div className={styles.campaignImagePlaceholder}>No Image</div>
              )}
              <h3 className={styles.campaignCardTitle}>{campaign.title}</h3>
              <div className={styles.campaignBudgetRow}>
                <p className={styles.campaignBudgetText}>Budget: {formatBudget(campaign.budget)}</p>
                <div className={styles.campaignPlatformIcons}>
                  {getSelectedPlatforms(campaign.description).map((platformKey) => {
                    const meta = PLATFORM_ICON_META[platformKey];
                    return (
                      <img
                        key={platformKey}
                        src={meta.icon}
                        alt={meta.label}
                        title={meta.label}
                        className={styles.campaignPlatformIcon}
                      />
                    );
                  })}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
