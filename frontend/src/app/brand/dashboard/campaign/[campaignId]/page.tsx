"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import styles from "../../Dashboard.module.css";
import { Campaign } from "../../types";
import { getAuthSession } from "../../../../../lib/authStorage";

type CampaignDetailsMap = {
  brandName: string;
  platforms: string;
  website: string;
  instagram: string;
  targetAudience: string;
  numberOfInfluencers: string;
};

const DEFAULT_DETAIL = "N/A";

const PLATFORM_META: Record<string, { label: string; iconSrc: string }> = {
  instagram: { label: "Instagram", iconSrc: "/instagram-icon.svg" },
  youtube: { label: "YouTube", iconSrc: "/youtube-icon.svg" },
  facebook: { label: "Facebook", iconSrc: "/facebook-icon.svg" },
};

const PLATFORM_ORDER = ["instagram", "youtube", "facebook"] as const;

function normalizeValue(value: string | undefined): string {
  const trimmed = (value || "").trim();
  return trimmed || DEFAULT_DETAIL;
}

const DESCRIPTION_META_LABELS = new Set([
  "platforms",
  "website",
  "instagram handle",
  "target audience",
  "brand name",
  "location",
  "categories",
  "timeline",
  "eligibility",
  "engagement",
  "deliverables",
  "content style",
  "number of influencers",
]);

function parseDescription(description: string): { intro: string; details: CampaignDetailsMap } {
  const lines = description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const details: CampaignDetailsMap = {
    brandName: DEFAULT_DETAIL,
    platforms: DEFAULT_DETAIL,
    website: DEFAULT_DETAIL,
    instagram: DEFAULT_DETAIL,
    targetAudience: DEFAULT_DETAIL,
    numberOfInfluencers: DEFAULT_DETAIL,
  };

  const introLines: string[] = [];

  lines.forEach((line) => {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) {
      introLines.push(line);
      return;
    }

    const rawLabel = line.slice(0, separatorIndex).trim().toLowerCase();
    const rawValue = line.slice(separatorIndex + 1).trim();

    if (!DESCRIPTION_META_LABELS.has(rawLabel)) {
      introLines.push(line);
      return;
    }

    if (rawLabel === "brand name") details.brandName = normalizeValue(rawValue);
    if (rawLabel === "platforms") details.platforms = normalizeValue(rawValue);
    if (rawLabel === "website") details.website = normalizeValue(rawValue);
    if (rawLabel === "instagram handle") details.instagram = normalizeValue(rawValue);
    if (rawLabel === "target audience") details.targetAudience = normalizeValue(rawValue);
    if (rawLabel === "number of influencers") details.numberOfInfluencers = normalizeValue(rawValue);
  });

  const intro = introLines.join("\n") || "No campaign description provided.";

  return { intro, details };
}

function formatBudget(value: string | number): string {
  const numeric = Number(String(value).replace(/[^\d.]/g, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) return DEFAULT_DETAIL;
  return `Rs. ${new Intl.NumberFormat("en-IN").format(Math.round(numeric))}`;
}

function calculatePricePerInfluencer(budget: string | number, numberOfInfluencers: string): string {
  const budgetNum = Number(String(budget).replace(/[^\d.]/g, ""));
  const influencerNum = Number(String(numberOfInfluencers).replace(/[^\d.]/g, ""));
  
  if (!Number.isFinite(budgetNum) || budgetNum <= 0 || !Number.isFinite(influencerNum) || influencerNum <= 0) {
    return DEFAULT_DETAIL;
  }
  
  const pricePerInfluencer = Math.round(budgetNum / influencerNum);
  return `Rs. ${new Intl.NumberFormat("en-IN").format(pricePerInfluencer)}`;
}

function makeSafeLink(rawLink: string): string {
  if (!rawLink || rawLink === DEFAULT_DETAIL) return "";
  if (rawLink.startsWith("http://") || rawLink.startsWith("https://")) return rawLink;
  return `https://${rawLink}`;
}

function makeInstagramLink(handle: string): string {
  if (!handle || handle === DEFAULT_DETAIL) return "";
  if (handle.startsWith("http://") || handle.startsWith("https://")) return handle;
  const sanitized = handle.replace(/^@/, "");
  return `https://instagram.com/${sanitized}`;
}

function renderCategories(rawCategory: string | undefined) {
  const normalized = (rawCategory || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (normalized.length === 0) {
    return <span className={styles["details-text"]}>N/A</span>;
  }

  return <span className={styles["details-text"]}>{normalized.map((item) => `[${item}]`).join(" ")}</span>;
}

function renderPlatforms(platforms: string) {
  const parts = (platforms || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const selected = new Set(parts.map((platform) => platform.trim().toLowerCase()));

  return (
    <div className={styles["platform-icons-row-fixed"]}>
      {PLATFORM_ORDER.map((key) => {
        const meta = PLATFORM_META[key];
        return (
          <span
            key={key}
            className={`${styles["platform-icon-chip"]} ${selected.has(key) ? styles["platform-icon-chip-done"] : styles["platform-icon-chip-pending"]}`}
            title={`${meta.label}${selected.has(key) ? " (done)" : ""}`}
          >
            <img src={meta.iconSrc} alt={meta.label} className={styles["platform-icon-small"]} />
          </span>
        );
      })}
    </div>
  );
}

function parseCount(value: unknown[] | number | undefined): number {
  if (Array.isArray(value)) return value.length;
  if (typeof value === "number") return value;
  return 0;
}

export default function CampaignDetailsPage() {
  const params = useParams<{ campaignId: string }>();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGoingLive, setIsGoingLive] = useState(false);
  const [goLiveError, setGoLiveError] = useState<string | null>(null);
  const [showGoLiveConfirm, setShowGoLiveConfirm] = useState(false);

  useEffect(() => {
    const token = getAuthSession("brand")?.token;
    if (!token) {
      router.replace("/brand/login");
      return;
    }

    const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || `http://${host}:5000`;

    const loadCampaign = async () => {
      try {
        const res = await axios.get(`${apiBaseUrl}/api/campaigns/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const allCampaigns = (res.data?.campaigns || []) as Campaign[];
        const selected = allCampaigns.find((item) => item._id === params.campaignId) || null;
        setCampaign(selected);
      } catch {
        setCampaign(null);
      } finally {
        setLoading(false);
      }
    };

    void loadCampaign();
  }, [params.campaignId, router]);

  const handleGoLive = async (): Promise<boolean> => {
    if (!campaign) return false;
    
    setIsGoingLive(true);
    setGoLiveError(null);
    
    try {
      const token = getAuthSession("brand")?.token;
      if (!token) {
        setGoLiveError("Authentication required");
        return false;
      }

      const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || `http://${host}:5000`;

      const res = await axios.patch(
        `${apiBaseUrl}/api/campaigns/${campaign._id}`,
        { status: "active" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.campaign) {
        setCampaign(res.data.campaign);
        setGoLiveError(null);
        return true;
      }
      return false;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to go live";
      setGoLiveError(errorMsg);
      return false;
    } finally {
      setIsGoingLive(false);
    }
  };

  const handleGoLiveConfirm = async () => {
    const wentLive = await handleGoLive();
    if (wentLive) {
      setShowGoLiveConfirm(false);
    }
  };

  const handleEdit = () => {
    router.push(`/brand/dashboard/campaign/${campaign?._id}/edit`);
  };

  const parsed = useMemo(() => parseDescription(campaign?.description || ""), [campaign?.description]);
  const websiteUrl = useMemo(() => makeSafeLink(parsed.details.website), [parsed.details.website]);
  const instagramUrl = useMemo(() => makeInstagramLink(parsed.details.instagram), [parsed.details.instagram]);

  if (loading) {
    return <p className={styles["details-loading"]}>Loading campaign details...</p>;
  }

  if (!campaign) {
    return (
      <section className={styles["campaign-detail-page"]}>
        <div className={styles["campaign-detail-shell"]}>
          <button type="button" className={styles["back-arrow-btn"]} onClick={() => router.back()}>
            <span>{"<"}</span> Back
          </button>
          <p className={styles["details-loading"]}>Campaign not found.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles["campaign-detail-page"]}>
      <div className={`${styles["campaign-detail-shell"]} ${showGoLiveConfirm ? styles["campaign-detail-shell-blurred"] : ""}`}>
        <button type="button" className={styles["back-arrow-btn"]} onClick={() => router.back()}>
          <span>{"<"}</span> Back
        </button>

        <article className={styles["campaign-detail-card"]}>
          {campaign.imageFile ? <img src={campaign.imageFile} alt={campaign.title} className={styles["campaign-detail-image"]} /> : null}
          <h1>{campaign.title}</h1>
          <br />
          <div className={styles["campaign-meta-row"]}>
            <p className={styles["campaign-meta-item"]}>
              <span className={styles["line-label"]}>Budget:</span> {formatBudget(campaign.budget)}
            </p>
            <p className={styles["campaign-meta-item"]}>
              <span className={styles["line-label"]}>Influencers:</span> {parsed.details.numberOfInfluencers}
            </p>
          </div>
          <div className={styles["campaign-meta-row"]}>
            <p className={styles["campaign-meta-item"]}>
              <span className={styles["line-label"]}>Price/Influencer:</span> {calculatePricePerInfluencer(campaign.budget, parsed.details.numberOfInfluencers)}
            </p>
            <p className={styles["campaign-meta-item"]}>
              <span className={styles["line-label"]}>Applications:</span> {parseCount(campaign.applications)}
            </p>
          </div>
 <br />
          <div className={styles["campaign-details-vertical"]}>
            <section className={styles["details-section"]}>
              <p className={styles["details-line"]}>
                <span className={styles["line-label"]}>Brand Name:</span> <span className={styles["details-text"]}>{parsed.details.brandName}</span>
              </p>
            </section>

            <section className={styles["details-section"]}>
              <p className={styles["details-line"]}>
                <span className={styles["line-label"]}>Description:</span>{" "}
                <span className={styles["details-description-full"]}>{parsed.intro}</span>
              </p> <br />
              <p className={styles["details-line"]}><span className={styles["line-label"]}>Platform:</span></p>
              {renderPlatforms(parsed.details.platforms)}
            </section>

            <section className={styles["details-section"]}>
              <p className={styles["details-line"]}><span className={styles["line-label"]}>Website:</span></p>
              {websiteUrl ? (
                <a className={`${styles["details-text"]} ${styles["detail-link"]}`} href={websiteUrl} target="_blank" rel="noreferrer">
                  {parsed.details.website}
                </a>
              ) : (
                <p className={styles["details-text"]}>{parsed.details.website}</p>
              )}
            </section>

            <section className={styles["details-section"]}>
              <p className={styles["details-line"]}><span className={styles["line-label"]}>Instagram:</span></p>
              {instagramUrl ? (
                <a className={`${styles["details-text"]} ${styles["detail-link"]}`} href={instagramUrl} target="_blank" rel="noreferrer">
                  {parsed.details.instagram}
                </a>
              ) : (
                <p className={styles["details-text"]}>{parsed.details.instagram}</p>
              )}
            </section>

            <section className={styles["details-section"]}>
              <p className={styles["details-line"]}><span className={styles["line-label"]}>Categories:</span></p>
              {renderCategories(campaign.category)}
            </section>

            <section className={styles["details-section"]}>
              <p className={styles["details-line"]}><span className={styles["line-label"]}>Target Audience: <br /></span> {parsed.details.targetAudience}</p>
            </section>

            <section className={styles["details-section"]}>
              <p className={styles["details-line"]}><span className={styles["line-label"]}>Timeline:</span> {campaign.timeline || DEFAULT_DETAIL}</p>
            </section>
          </div>

          {campaign.status === "pending" || campaign.status === "review" ? (
            <div className={styles["campaign-action-buttons"]}>
              {goLiveError && (
                <p style={{ color: "#dc2626", marginBottom: "8px", fontSize: "14px" }}>
                  {goLiveError}
                </p>
              )}
              <button
                type="button"
                className={styles["edit-btn"]}
                onClick={handleEdit}
                disabled={isGoingLive}
              >
                Edit Campaign
              </button>
              <button
                type="button"
                className={styles["go-live-btn"]}
                onClick={() => setShowGoLiveConfirm(true)}
                disabled={isGoingLive}
              >
                {isGoingLive ? "Going Live..." : "Go Live"}
              </button>
            </div>
          ) : null}
        </article>
      </div>

      {showGoLiveConfirm ? (
        <div className={styles["go-live-confirm-overlay"]}>
          <div className={styles["go-live-confirm-dialog"]} role="dialog" aria-modal="true" aria-label="Go live confirmation">
            <h3>Are you sure you want to go live?</h3>
            <p>Once your campaign is live:</p>
            <ul>
              <li>It will be visible to influencers</li>
              <li>Influencers can start applying</li>
              <li>You will NOT be able to edit important details</li>
            </ul>

            <div className={styles["go-live-confirm-actions"]}>
              <button
                type="button"
                className={styles["go-live-cancel-btn"]}
                onClick={() => setShowGoLiveConfirm(false)}
                disabled={isGoingLive}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles["go-live-confirm-btn"]}
                onClick={handleGoLiveConfirm}
                disabled={isGoingLive}
              >
                {isGoingLive ? "Going Live..." : "Go Live"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
