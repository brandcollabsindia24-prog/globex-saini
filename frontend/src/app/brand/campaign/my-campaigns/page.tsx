"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getAuthSession } from "../../../../lib/authStorage";
import type { Campaign } from "../../dashboard/types";
import styles from "../../dashboard/Dashboard.module.css";

const DASHBOARD_SIGNATURE_FIELDS = [
  "brand name:",
  "platforms:",
  "website:",
  "instagram handle:",
  "target audience:",
];

function isDashboardCreatedCampaign(description: string): boolean {
  const normalized = description.toLowerCase();
  return DASHBOARD_SIGNATURE_FIELDS.every((field) => normalized.includes(field));
}

function resolveApiBaseUrl(): string {
  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
  return process.env.NEXT_PUBLIC_API_BASE_URL || `http://${host}:5005`;
}

function parseCount(value: unknown[] | number | undefined): number {
  if (Array.isArray(value)) return value.length;
  if (typeof value === "number") return value;
  return 0;
}

type CampaignFilterTab = "all" | "pending" | "active" | "completed";

function normalizeStatus(status: string | undefined): string {
  return (status || "").trim().toLowerCase();
}

function getFilterStatus(status: string | undefined): Exclude<CampaignFilterTab, "all"> {
  const normalized = normalizeStatus(status);
  if (["active", "approved", "running", "in_progress"].includes(normalized)) return "active";
  if (["completed", "closed"].includes(normalized)) return "completed";
  return "pending";
}

function formatStatusLabel(status: string | undefined): string {
  const mapped = getFilterStatus(status);
  return mapped.charAt(0).toUpperCase() + mapped.slice(1);
}

function getStatusBadgeClass(status: string | undefined): string {
  const mapped = getFilterStatus(status);
  if (mapped === "active") return styles["campaign-status-active"];
  if (mapped === "completed") return styles["campaign-status-completed"];
  return styles["campaign-status-pending"];
}

function formatBudget(value: string | number): string {
  const numeric = Number(String(value).replace(/[^\d.]/g, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) return "N/A";
  return `Rs. ${new Intl.NumberFormat("en-IN").format(Math.round(numeric))}`;
}

export default function MyCampaignsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeTab, setActiveTab] = useState<CampaignFilterTab>("all");

  useEffect(() => {
    const session = getAuthSession("brand");
    const token = session?.token || "";
    const user = session?.user;

    if (!token || !user || user.role !== "brand") {
      router.replace("/brand/login");
      return;
    }

    const loadCampaigns = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${resolveApiBaseUrl()}/api/campaigns/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCampaigns(response.data?.campaigns || []);
      } catch (error) {
        console.error("Failed to load campaigns:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadCampaigns();
  }, [router]);

  const dashboardCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => isDashboardCreatedCampaign(campaign.description || ""));
  }, [campaigns]);

  const campaignCounts = useMemo(() => {
    return dashboardCampaigns.reduce(
      (acc, campaign) => {
        const mapped = getFilterStatus(campaign.status);
        acc.all += 1;
        acc[mapped] += 1;
        return acc;
      },
      { all: 0, pending: 0, active: 0, completed: 0 }
    );
  }, [dashboardCampaigns]);

  const filteredCampaigns = useMemo(() => {
    if (activeTab === "all") return dashboardCampaigns;
    return dashboardCampaigns.filter((campaign) => getFilterStatus(campaign.status) === activeTab);
  }, [dashboardCampaigns, activeTab]);

  const filterTabs: Array<{ key: CampaignFilterTab; label: string }> = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "active", label: "Active" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <section>
      <div className={styles["brand-dashboard-main"]}>
        <div className={styles["welcome-banner"]}>
          <h1>Manage My Campaigns</h1>
          <p>Only campaigns created from Brand Dashboard form are shown here.</p>

          <div className={styles["cta-buttons"]}>
            <Link href="/brand/dashboard" className={styles["explore-btn"]}>
              Back to Dashboard
            </Link>
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", marginTop: "20px" }}>Loading campaigns...</p>
        ) : dashboardCampaigns.length === 0 ? (
          <div className={styles["empty-state"]}>
            <h3>No dashboard-created campaigns found</h3>
            <p>Brand dashboard ke + Create Campaign button se campaign create kijiye.</p>
          </div>
        ) : (
          <div className={styles["campaign-list"]}>
            <div className={styles["manage-campaign-tabs"]} role="tablist" aria-label="Filter campaigns by status">
              {filterTabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`${styles["manage-campaign-tab"]} ${isActive ? styles["manage-campaign-tab-active"] : ""}`.trim()}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    <span>{tab.label}</span>
                    <span className={styles["manage-campaign-tab-count"]}>{campaignCounts[tab.key]}</span>
                  </button>
                );
              })}
            </div>

            {filteredCampaigns.length === 0 ? (
              <div className={styles["empty-state"]}>
                <h3>No campaigns in {activeTab} status</h3>
                <p>Dusra filter tab select karke baaki campaigns dekh sakte ho.</p>
              </div>
            ) : (
              <div className={styles["campaign-grid"]}>
                {filteredCampaigns.map((campaign) => {
                  return (
                    <article key={campaign._id} className={styles["campaign-card"]}>
                      <div className={styles["manage-campaign-top-action"]}>
                        <button
                          type="button"
                          className={`${styles["manage-action-btn"]} ${styles["manage-action-primary"]}`.trim()}
                          onClick={() => router.push(`/brand/dashboard/campaign/${campaign._id}`)}
                        >
                          View Full Details
                        </button>
                        {getFilterStatus(campaign.status) === "active" ? (
                          <button
                            type="button"
                            className={`${styles["manage-action-btn"]} ${styles["manage-action-success"]}`.trim()}
                            onClick={() => router.push(`/brand/campaign/my-campaigns/${campaign._id}/applicants`)}
                          >
                            View Applicants
                          </button>
                        ) : null}
                      </div>

                      {campaign.imageFile ? (
                        <img src={campaign.imageFile} alt={campaign.title} />
                      ) : (
                        <div className={styles["campaign-image-placeholder"]}>No Image</div>
                      )}

                      <div className={styles["manage-campaign-card-head"]}>
                        <h2>{campaign.title}</h2>
                        <span className={`${styles["campaign-status-badge"]} ${getStatusBadgeClass(campaign.status)}`.trim()}>
                          {formatStatusLabel(campaign.status)}
                        </span>
                      </div>

                      <div className={styles["campaign-meta-row"]}>
                        <p className={styles["campaign-meta-item"]}>
                          <span className={styles["line-label"]}>Budget:</span> {formatBudget(campaign.budget)}
                        </p>
                        <p className={styles["campaign-meta-item"]}>
                          <span className={styles["line-label"]}>Applications:</span> {parseCount(campaign.applications)}
                        </p>
                      </div>

                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
