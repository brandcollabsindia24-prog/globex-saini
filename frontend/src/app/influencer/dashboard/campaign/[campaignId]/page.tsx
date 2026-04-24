"use client";

import { useEffect, useMemo, useState, useRef } from "react";
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

function normalizeStatus(status: string, paymentStatus?: string): string {
  const normalized = String(status || "").trim().toLowerCase();

  if (normalized === "applied") return "pending";
  if (normalized === "shortlisted") return "in_progress";
  if (normalized === "accepted") {
    // If payment is paid, show as in_progress
    if (paymentStatus === "paid") return "in_progress";
    return "accepted";
  }
  if (normalized === "in_progress") return "in_progress";
  if (normalized === "submitted") return "submitted";
  if (normalized === "revision_required") return "revision_required";
  if (normalized === "completed") return "completed";
  if (normalized === "rejected") return "rejected";

  return "pending";
}

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
  const [userApplication, setUserApplication] = useState<any>(null);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const submissionFormRef = useRef<HTMLDivElement>(null);
  const [submissionFormData, setSubmissionFormData] = useState({
    reelLink: "",
    postLink: "",
    caption: "",
    screenshotFile: null as File | null,
  });
  const [submitting, setSubmitting] = useState(false);

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
        const [campaignResponse, profileResponse, applicationsResponse] = await Promise.allSettled([
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
          axios.get(`${apiBaseUrl}/api/campaigns/influencer/applications`, {
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

        if (applicationsResponse.status === "fulfilled") {
          const applications = applicationsResponse.value.data?.applications || [];
          const applicationForThisCampaign = applications.find((app: any) => app.campaignId?._id === params.campaignId);
          setUserApplication(applicationForThisCampaign || null);
          setApplied(!!applicationForThisCampaign);
        } else {
          setUserApplication(null);
          setApplied(false);
        }
      } catch {
        setCampaign(null);
        setIsProfileComplete(false);
        setVerificationStatus("Pending");
        setUserApplication(null);
        setApplied(false);
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

  const handleSubmitWork = async () => {
    if (!userApplication || submitting) return;

    const session = getAuthSession("influencer");
    if (!session || session.user.role !== "influencer") {
      router.replace("/influencer/login");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      
      if (submissionFormData.reelLink.trim()) formData.append("reelLink", submissionFormData.reelLink.trim());
      if (submissionFormData.postLink.trim()) formData.append("postLink", submissionFormData.postLink.trim());
      if (submissionFormData.caption.trim()) formData.append("caption", submissionFormData.caption.trim());
      
      if (submissionFormData.screenshotFile) formData.append("screenshotFile", submissionFormData.screenshotFile);

      const response = await axios.patch(
        `${apiBaseUrl}/api/campaigns/applications/${userApplication._id}/submit`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        }
      );

      alert("Work submitted successfully!");
      setShowSubmissionForm(false);
      // Reset form
      setSubmissionFormData({
        reelLink: "",
        postLink: "",
        caption: "",
        screenshotFile: null,
      });
      // Refresh the page or update state
      window.location.reload();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Failed to submit work");
      } else {
        alert("Failed to submit work");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const updateFormField = (field: keyof typeof submissionFormData, value: string | File | null) => {
    setSubmissionFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Auto-scroll to form when it opens
  useEffect(() => {
    if (showSubmissionForm && submissionFormRef.current) {
      // Small delay to ensure the form is rendered
      setTimeout(() => {
        submissionFormRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [showSubmissionForm]);

  const isFormValid = () => {
    const { reelLink, postLink, caption, screenshotFile } = submissionFormData;
    
    // Must have either reel URL OR post URL
    const hasReelLink = reelLink.trim().length > 0;
    const hasPostLink = postLink.trim().length > 0;
    const hasContentLink = hasReelLink || hasPostLink;
    
    // Must have caption (required)
    const hasCaption = caption.trim().length > 0;
    
    // Must have screenshot (required)
    const hasScreenshot = !!screenshotFile;
    
    return hasContentLink && hasCaption && hasScreenshot;
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
                {userApplication ? (
                  userApplication.status === "in_progress" || (userApplication.status === "accepted" && userApplication.paymentStatus === "paid") ? (
                    <button
                      type="button"
                      className={styles.applyBtn}
                      onClick={() => setShowSubmissionForm(true)}
                    >
                      Submit Work
                    </button>
                  ) : null
                ) : (
                  <button
                    type="button"
                    className={styles.applyBtn}
                    disabled={applied || applying}
                    onClick={handleApply}
                  >
                    {applied ? "Applied" : applying ? "Applying..." : "Apply"}
                  </button>
                )}
              </section>
            </div>
          </article>
        )}

        {showSubmissionForm && userApplication && (
          <div className={styles.submissionFormCard} ref={submissionFormRef}>
            <div className={styles.submissionFormHeader}>
              <h3>Submit Your Work</h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setShowSubmissionForm(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.submissionFormGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Reel URL <span className={styles.optionalText}>(provide if you created a reel)</span>
                </label>
                <input
                  type="url"
                  value={submissionFormData.reelLink}
                  onChange={(e) => updateFormField("reelLink", e.target.value)}
                  className={styles.formInput}
                  placeholder="https://instagram.com/reel/..."
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Post Image URL <span className={styles.optionalText}>(provide if you created a post)</span>
                </label>
                <input
                  type="url"
                  value={submissionFormData.postLink}
                  onChange={(e) => updateFormField("postLink", e.target.value)}
                  className={styles.formInput}
                  placeholder="https://instagram.com/p/..."
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Caption <span className={styles.requiredText}>*</span>
                </label>
                <textarea
                  value={submissionFormData.caption}
                  onChange={(e) => updateFormField("caption", e.target.value)}
                  className={styles.formTextarea}
                  placeholder="Write your post caption here"
                  rows={4}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Upload Screenshot <span className={styles.requiredText}>*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => updateFormField("screenshotFile", e.target.files?.[0] || null)}
                  className={styles.fileInput}
                />
                {submissionFormData.screenshotFile && (
                  <p className={styles.fileName}>Selected: {submissionFormData.screenshotFile.name}</p>
                )}
              </div>
            </div>

            <div className={styles.formRequirements}>
              <p className={styles.requirementsText}>
                <span className={styles.requiredText}>*</span> Required fields: Caption and Screenshot
              </p>
              <p className={styles.requirementsText}>
                <span className={styles.requiredText}>*</span> Must provide either Reel URL or Post Image URL
              </p>
            </div>

            <div className={styles.submissionFormActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setShowSubmissionForm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.submitBtn}
                onClick={handleSubmitWork}
                disabled={submitting || !isFormValid()}
              >
                {submitting ? "Submitting..." : "Submit Work"}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
