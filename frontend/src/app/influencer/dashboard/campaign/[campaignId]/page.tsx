"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import styles from "../../InfluencerDashboard.module.css";
import { Campaign } from "../../types";
import { getAuthSession } from "../../../../../lib/authStorage";

const FALLBACK_VALUE = "N/A";
const PLATFORM_ICON_META: Record<string, { label: string; icon: string }> = {
  instagram: { label: "Instagram", icon: "/instagram-icon.svg" },
  youtube: { label: "YouTube", icon: "/youtube-icon.svg" },
  facebook: { label: "Facebook", icon: "/facebook-icon.svg" },
};

const PLATFORM_ORDER = ["instagram", "youtube", "facebook"] as const;

function readDetailLine(description: string, label: string): string {
  const match = description
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.toLowerCase().startsWith(`${label.toLowerCase()}:`));

  if (!match) return FALLBACK_VALUE;

  const value = match.slice(match.indexOf(":") + 1).trim();
  return value || FALLBACK_VALUE;
}

function readDescriptionText(description: string): string {
  const firstNonEmptyLine = description
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);

  if (!firstNonEmptyLine) return FALLBACK_VALUE;

  const separator = firstNonEmptyLine.indexOf(":");
  if (separator === -1) return firstNonEmptyLine;

  const value = firstNonEmptyLine.slice(separator + 1).trim();
  return value || firstNonEmptyLine;
}

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

export default function InfluencerCampaignDetailsPage() {
  const params = useParams<{ campaignId: string }>();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"Pending" | "Approved" | "Rejected">("Pending");
  const [showCompleteProfilePrompt, setShowCompleteProfilePrompt] = useState(false);
  const [showVerificationPendingPrompt, setShowVerificationPendingPrompt] = useState(false);

  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || `http://${host}:5000`;

  const profileRequiredFields = ["fullName", "email", "profileImage", "city", "district", "state", "pincode"] as const;

  useEffect(() => {
    const session = getAuthSession("influencer");
    if (!session || session.user.role !== "influencer") {
      router.replace("/influencer/login");
      return;
    }

    const token = session.token;

    const load = async () => {
      try {
        const [campaignResponse, profileResponse] = await Promise.allSettled([
          axios.get(`${apiBaseUrl}/api/campaigns/influencer/active`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get(`${apiBaseUrl}/api/influencers/profile/${session.user.id || session.user._id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (campaignResponse.status === "fulfilled") {
          const campaigns = (campaignResponse.value.data?.campaigns || []) as Campaign[];
          setCampaign(campaigns.find((item) => item._id === params.campaignId) || null);
        } else {
          setCampaign(null);
        }

        if (profileResponse.status === "fulfilled") {
          const profile = profileResponse.value.data || {};
          const profileComplete = profileRequiredFields.every((field) => String(profile[field] || "").trim().length > 0);
          setIsProfileComplete(profileComplete);
          setVerificationStatus((profile.verificationStatus as "Pending" | "Approved" | "Rejected") || "Pending");
        } else {
          setIsProfileComplete(false);
          setVerificationStatus("Pending");
        }
      } catch {
        setCampaign(null);
        setIsProfileComplete(false);
        setVerificationStatus("Pending");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [apiBaseUrl, params.campaignId, router]);

  const detailView = useMemo(() => {
    const rawDescription = campaign?.description || "";

    return {
      description: readDescriptionText(rawDescription),
      website: readDetailLine(rawDescription, "website"),
      instagram: readDetailLine(rawDescription, "instagram handle"),
      platforms: getSelectedPlatforms(rawDescription),
    };
  }, [campaign?.description]);

  const handleApply = async () => {
    if (!campaign || applying || applied) return;

    if (!isProfileComplete) {
      setShowCompleteProfilePrompt(true);
      return;
    }

    if (verificationStatus !== "Approved") {
      setShowCompleteProfilePrompt(false);
      setShowVerificationPendingPrompt(true);
      return;
    }

    setShowCompleteProfilePrompt(false);
    setShowVerificationPendingPrompt(false);

    const session = getAuthSession("influencer");
    if (!session || session.user.role !== "influencer") {
      router.replace("/influencer/login");
      return;
    }

    try {
      setApplying(true);
      const response = await axios.post<{ message?: string; warningMessage?: string }>(
        `${apiBaseUrl}/api/campaigns/${campaign._id}/apply`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        }
      );
      setApplied(true);
      const warningMessage = String(response.data?.warningMessage || "");
      if (warningMessage.toLowerCase().includes("verification pending")) {
        setShowVerificationPendingPrompt(true);
      } else {
        router.push("/influencer/my-applications");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const backendMessage = String(error.response?.data?.message || "");
        if (backendMessage.toLowerCase().includes("complete your profile")) {
          setShowCompleteProfilePrompt(true);
          return;
        }
        if (backendMessage.toLowerCase().includes("verification pending")) {
          setShowVerificationPendingPrompt(true);
          return;
        }
        alert(backendMessage || "Unable to apply right now.");
      } else {
        alert("Unable to apply right now.");
      }
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <p className={styles.detailsLoadingText}>Loading campaign details...</p>;
  }

  if (!campaign) {
    return (
      <section className={styles.campaignDetailPage}>
        <div className={styles.campaignDetailShell}>
          <button type="button" className={styles.backArrowBtn} onClick={() => router.back()}>
            <span>{"<"}</span> Back
          </button>
          <p className={styles.detailsLoadingText}>Campaign not found.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.campaignDetailPage}>
      <div className={styles.campaignDetailShell}>
        <button type="button" className={styles.backArrowBtn} onClick={() => router.back()}>
          <span>{"<"}</span> Back
        </button>

        {showCompleteProfilePrompt ? (
          <div className={styles.completeProfileCard}>
            <h3>Complete Your Profile First</h3>
            <p>Please complete your profile before applying to campaigns.</p>
            <p>A complete profile increases your chances of getting selected.</p>
            <button
              type="button"
              className={styles.completeProfileBtn}
              onClick={() => router.push("/influencer/dashboard?openProfileForm=1")}
            >
              Complete Profile
            </button>
          </div>
        ) : showVerificationPendingPrompt ? (
          <div className={styles.verificationPendingCard}>
            <h3>Verification Pending</h3>
            <p>Your profile is under review. You can still apply to campaigns,</p>
            <p>but brands may only consider verified profiles.</p>
            <button
              type="button"
              className={styles.verificationPendingBtn}
              onClick={() => setShowVerificationPendingPrompt(false)}
            >
              OK
            </button>
          </div>
        ) : (
          <article className={styles.campaignDetailCard}>
            {campaign.imageFile ? <img src={campaign.imageFile} alt={campaign.title} className={styles.campaignDetailImage} /> : null}
            <h1>{campaign.title}</h1>

            <div className={styles.campaignDetailsVertical}>
              <section className={styles.detailSection}>
                <p className={styles.detailLine}><span>Budget:</span> INR {campaign.budget}</p>
                <p className={styles.detailLine}><span>Description: <br /></span> {detailView.description}</p> <br />
                <p className={styles.detailLine}><span>Website: <br /></span> {detailView.website}</p>
                <p className={styles.detailLine}><span>Insta: <br /></span> {detailView.instagram}</p> <br />
                <p className={styles.detailLine}><span>Category: <br /></span> {campaign.category || FALLBACK_VALUE}</p>
                <p className={styles.detailLine}><span>Requirement Platform:</span></p>
                {detailView.platforms.length > 0 ? (
                  <div className={styles.campaignPlatformIcons}>
                    {detailView.platforms.map((platformKey) => {
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
                ) : (
                  <p className={styles.detailLine}>{FALLBACK_VALUE}</p>
                )}
                <p className={styles.detailLine}><span>Followers Required:</span> {campaign.followersRequired || 0}</p>
                <p className={styles.detailLine}><span>Timeline:</span> {campaign.timeline || FALLBACK_VALUE}</p>
                <button
                  type="button"
                  className={styles.applyBtn}
                  disabled={applied || applying}
                  onClick={handleApply}
                >
                  {applied ? "Applied" : applying ? "Applying..." : "Apply"}
                </button>
              </section>
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
