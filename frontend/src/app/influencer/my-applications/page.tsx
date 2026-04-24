"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAuthSession } from "../../../lib/authStorage";
import { authFetchJson } from "../../../lib/authFetch";
import PageShell from "../../../components/PageShell";
import styles from "./MyApplications.module.css";

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

function resolveCampaignImageUrl(imageFile: string | undefined, apiBaseUrl: string): string {
  const raw = String(imageFile || "").trim();
  if (!raw) return "";

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  const normalizedPath = raw.replace(/\\/g, "/").replace(/^\/+/, "");
  return `${apiBaseUrl}/${normalizedPath}`;
}

type Application = {
  _id: string;
  status: string;
  paymentStatus?: "pending" | "paid";
  paymentAmount?: number;
  rejectionReason?: string;
  contentSubmission?: {
    reelLink?: string;
    postLink?: string;
    screenshotLink?: string;
    caption?: string;
    feedback?: string;
    approvalStatus?: string;
    submittedAt?: string | null;
  };
  campaignId?: {
    _id?: string;
    title?: string;
    budget?: number;
    timeline?: string;
    description?: string;
    imageFile?: string;
    status?: string;
    brandId?: {
      name?: string;
      brandName?: string;
    };
  };
};

type FilterValue = "all" | "pending" | "accepted" | "in_progress" | "submitted" | "revision_required" | "completed" | "rejected";

const FILTER_TABS: Array<{ label: string; value: FilterValue }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "in_progress" },
  { label: "Submitted", value: "submitted" },
  { label: "Revision Required", value: "revision_required" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
];

type SubmissionState = {
  reelLink: string;
  postLink: string;
  screenshotLink: string;
  caption: string;
  reelFile: File | null;
  postFile: File | null;
  screenshotFile: File | null;
};

function normalizeStatus(status: string, paymentStatus?: string): Exclude<FilterValue, "all"> {
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

export default function MyApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterValue>("pending");
  const [filterInitialized, setFilterInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyAppId, setBusyAppId] = useState<string | null>(null);
  const [appErrors, setAppErrors] = useState<Record<string, string>>({});
  const [formStateByApp, setFormStateByApp] = useState<Record<string, SubmissionState>>({});
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [formExpandedId, setFormExpandedId] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || `http://${host}:5000`;

  const checkScroll = () => {
    if (!cardsContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = cardsContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: "left" | "right") => {
    if (!cardsContainerRef.current) return;
    const scrollAmount = 300;
    const newScrollLeft = cardsContainerRef.current.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount);
    cardsContainerRef.current.scrollTo({ left: newScrollLeft, behavior: "smooth" });
  };

  // Initialize filter from localStorage
  useEffect(() => {
    const savedFilter = localStorage.getItem("myApplicationsFilter") as FilterValue | null;
    if (savedFilter) {
      setActiveFilter(savedFilter);
    }
    setFilterInitialized(true);
  }, []);

  // Save filter to localStorage whenever it changes
  useEffect(() => {
    if (filterInitialized) {
      localStorage.setItem("myApplicationsFilter", activeFilter);
    }
  }, [activeFilter, filterInitialized]);

  // Setup scroll listener for cards container
  useEffect(() => {
    const container = cardsContainerRef.current;
    if (!container) return;

    checkScroll();
    container.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      container.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const getStatusLabel = (status: string) => {
    const normalized = String(status || "").trim().toLowerCase();
    if (normalized === "accepted") return "Accepted";
    if (normalized === "in_progress") return "In Progress";
    if (normalized === "submitted") return "Submitted";
    if (normalized === "revision_required") return "Revision Required";
    if (normalized === "completed") return "Completed";
    if (normalized === "rejected") return "Rejected";
    if (normalized === "applied") return "Pending";
    if (normalized === "shortlisted") return "Shortlisted";
    return status || "Unknown";
  };

  const getInitialSubmissionState = (application: Application): SubmissionState => ({
    reelLink: application.contentSubmission?.reelLink || "",
    postLink: application.contentSubmission?.postLink || "",
    screenshotLink: application.contentSubmission?.screenshotLink || "",
    caption: application.contentSubmission?.caption || "",
    reelFile: null,
    postFile: null,
    screenshotFile: null,
  });

  const getFormState = (application: Application): SubmissionState => {
    return formStateByApp[application._id] || getInitialSubmissionState(application);
  };

  const setAppFormField = (
    applicationId: string,
    field: keyof SubmissionState,
    value: string | File | null
  ) => {
    setFormStateByApp((prev) => ({
      ...prev,
      [applicationId]: {
        ...(prev[applicationId] || {
          reelLink: "",
          postLink: "",
          screenshotLink: "",
          caption: "",
          reelFile: null,
          postFile: null,
          screenshotFile: null,
        }),
        [field]: value,
      },
    }));
  };

  const updateApplication = (updated: Application) => {
    setApplications((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
  };

  const handleStartWork = async (applicationId: string) => {
    setBusyAppId(applicationId);
    setAppErrors((prev) => ({ ...prev, [applicationId]: "" }));

    try {
      const response = await authFetchJson<{ application: Application }>(
        "influencer",
        `${apiBaseUrl}/api/campaigns/applications/${applicationId}/start`,
        {
          method: "PATCH",
        }
      );

      if (response.application) {
        updateApplication(response.application);
      }
    } catch (error: any) {
      setAppErrors((prev) => ({
        ...prev,
        [applicationId]: error.message || "Unable to start work",
      }));
    } finally {
      setBusyAppId(null);
    }
  };

  const buildSubmissionFormData = (state: SubmissionState) => {
    const formData = new FormData();
    if (state.reelLink.trim()) formData.append("reelLink", state.reelLink.trim());
    if (state.postLink.trim()) formData.append("postLink", state.postLink.trim());
    if (state.caption.trim()) formData.append("caption", state.caption.trim());

    if (state.reelFile) formData.append("reelFile", state.reelFile);
    if (state.postFile) formData.append("postFile", state.postFile);
    if (state.screenshotFile) formData.append("screenshotFile", state.screenshotFile);

    return formData;
  };

  const handleSubmitWork = async (application: Application, isResubmit: boolean) => {
    setBusyAppId(application._id);
    setAppErrors((prev) => ({ ...prev, [application._id]: "" }));

    try {
      const formState = getFormState(application);
      const formData = buildSubmissionFormData(formState);
      const endpoint = isResubmit ? "resubmit" : "submit";

      const response = await authFetchJson<{ application: Application }>(
        "influencer",
        `${apiBaseUrl}/api/campaigns/applications/${application._id}/${endpoint}`,
        {
          method: "PATCH",
          body: formData,
        }
      );

      if (response.application) {
        updateApplication(response.application);
      }
    } catch (error: any) {
      setAppErrors((prev) => ({
        ...prev,
        [application._id]: error.message || "Unable to submit work",
      }));
    } finally {
      setBusyAppId(null);
    }
  };

  const renderSubmissionSection = (app: Application) => {
    const status = normalizeStatus(app.status, app.paymentStatus);
    const formState = getFormState(app);
    const isReadOnly = status === "submitted" || status === "completed" || status === "rejected";
    const submissionDetails = app.contentSubmission;
    const isExpanded = expandedCardId === app._id;
    const isFormExpanded = formExpandedId === app._id;

    return (
      <div className={styles.sectionPanel}>
        <div className={styles.sectionRow}>
          <p className={styles.sectionTitle}>Status: {getStatusLabel(app.status)}</p>
          <div className={styles.sectionButtonRow}>
            {status === "accepted" && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void handleStartWork(app._id);
                }}
                disabled={busyAppId === app._id}
                className={`${styles.buttonBase} ${styles.buttonPrimary} ${busyAppId === app._id ? styles.buttonDisabled : ""}`}
              >
                {busyAppId === app._id ? "Starting..." : "Start Work"}
              </button>
            )}
            {status === "in_progress" && isExpanded && !isFormExpanded && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  router.push(`/influencer/dashboard/campaign/${app.campaignId?._id}`);
                }}
                className={`${styles.buttonBase} ${styles.buttonSuccess}`}
              >
                Submit Work
              </button>
            )}
            {status === "revision_required" && !isExpanded && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setExpandedCardId(app._id);
                }}
                className={`${styles.buttonBase} ${styles.buttonWarning}`}
              >
                Resubmit Work
              </button>
            )}
          </div>
        </div>

        {status === "in_progress" && isFormExpanded && (
          <div className={styles.sectionPanel}>
            <div className={styles.sectionRow}>
              <p className={styles.sectionText}>Upload your work details and submit when ready.</p>
              <button type="button" onClick={() => {
                setExpandedCardId(null);
                setFormExpandedId(null);
              }} className={styles.closeButton}>
                ✕
              </button>
            </div>

            <div className={styles.gridTwo}>
              <label className={styles.formGroup}>
                <span className={styles.labelText}>Reel URL</span>
                <input
                  type="url"
                  value={formState.reelLink}
                  onChange={(event) => setAppFormField(app._id, "reelLink", event.target.value)}
                  className={styles.formInput}
                  placeholder="https://..."
                />
              </label>
              <label className={styles.formGroup}>
                <span className={styles.labelText}>Upload Reel</span>
                <input
                  type="file"
                  accept="video/*,image/*"
                  onChange={(event) => setAppFormField(app._id, "reelFile", event.target.files?.[0] || null)}
                  className={styles.fileInput}
                />
                {formState.reelFile ? <p className={styles.helperText}>Selected: {formState.reelFile.name}</p> : null}
              </label>
            </div>

            <div className={styles.gridTwo}>
              <label className={styles.formGroup}>
                <span className={styles.labelText}>Post Image URL</span>
                <input
                  type="url"
                  value={formState.postLink}
                  onChange={(event) => setAppFormField(app._id, "postLink", event.target.value)}
                  className={styles.formInput}
                  placeholder="https://..."
                />
              </label>
              <label className={styles.formGroup}>
                <span className={styles.labelText}>Upload Post Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setAppFormField(app._id, "postFile", event.target.files?.[0] || null)}
                  className={styles.fileInput}
                />
                {formState.postFile ? <p className={styles.helperText}>Selected: {formState.postFile.name}</p> : null}
              </label>
            </div>

            <label className={`${styles.formGroup} ${styles.formGroupBlock}`}>
              <span className={styles.labelText}>Caption</span>
              <textarea
                value={formState.caption}
                onChange={(event) => setAppFormField(app._id, "caption", event.target.value)}
                className={styles.formTextarea}
                placeholder="Write your post caption here"
              />
            </label>

            <label className={`${styles.formGroup} ${styles.formGroupBlock}`}>
              <span className={styles.labelText}>Upload Screenshot</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setAppFormField(app._id, "screenshotFile", event.target.files?.[0] || null)}
                className={styles.fileInput}
              />
              {formState.screenshotFile ? <p className={styles.helperText}>Selected: {formState.screenshotFile.name}</p> : null}
            </label>

            <div className={styles.actionRow}>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void handleSubmitWork(app, false);
                }}
                disabled={busyAppId === app._id}
                className={`${styles.buttonBase} ${styles.buttonSuccess} ${busyAppId === app._id ? styles.buttonDisabled : ""}`}
              >
                {busyAppId === app._id ? "Submitting..." : "Submit Work"}
              </button>
              {appErrors[app._id] ? <p className={styles.errorText}>{appErrors[app._id]}</p> : null}
            </div>
          </div>
        )}

        {status === "revision_required" && isExpanded && (
          <div className={styles.sectionPanel}>
            <div className={styles.sectionRow}>
              <div className={`${styles.sectionPanel} ${styles.infoPanelOrange}`}>
                <p className={styles.infoPanelTitle}>Revision Requested</p>
                <p>{submissionDetails?.feedback || "The brand has requested revisions."}</p>
              </div>
              <button type="button" onClick={() => {
                setExpandedCardId(null);
                setFormExpandedId(null);
              }} className={styles.closeButton}>
                ✕
              </button>
            </div>

            <div className={styles.gridTwo}>
              <label className={styles.formGroup}>
                <span className={styles.labelText}>Reel URL</span>
                <input
                  type="url"
                  value={formState.reelLink}
                  onChange={(event) => setAppFormField(app._id, "reelLink", event.target.value)}
                  className={styles.formInput}
                  placeholder="https://..."
                />
              </label>
              <label className={styles.formGroup}>
                <span className={styles.labelText}>Upload Reel</span>
                <input
                  type="file"
                  accept="video/*,image/*"
                  onChange={(event) => setAppFormField(app._id, "reelFile", event.target.files?.[0] || null)}
                  className={styles.fileInput}
                />
                {formState.reelFile ? <p className={styles.helperText}>Selected: {formState.reelFile.name}</p> : null}
              </label>
            </div>

            <div className={styles.gridTwo}>
              <label className={styles.formGroup}>
                <span className={styles.labelText}>Post Image URL</span>
                <input
                  type="url"
                  value={formState.postLink}
                  onChange={(event) => setAppFormField(app._id, "postLink", event.target.value)}
                  className={styles.formInput}
                  placeholder="https://..."
                />
              </label>
              <label className={styles.formGroup}>
                <span className={styles.labelText}>Upload Post Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setAppFormField(app._id, "postFile", event.target.files?.[0] || null)}
                  className={styles.fileInput}
                />
                {formState.postFile ? <p className={styles.helperText}>Selected: {formState.postFile.name}</p> : null}
              </label>
            </div>

            <label className={`${styles.formGroup} ${styles.formGroupBlock}`}>
              <span className={styles.labelText}>Caption</span>
              <textarea
                value={formState.caption}
                onChange={(event) => setAppFormField(app._id, "caption", event.target.value)}
                className={styles.formTextarea}
                placeholder="Write your post caption here"
              />
            </label>

            <label className={`${styles.formGroup} ${styles.formGroupBlock}`}>
              <span className={styles.labelText}>Upload Screenshot</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setAppFormField(app._id, "screenshotFile", event.target.files?.[0] || null)}
                className={styles.fileInput}
              />
              {formState.screenshotFile ? <p className={styles.helperText}>Selected: {formState.screenshotFile.name}</p> : null}
            </label>

            <div className={styles.actionRow}>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void handleSubmitWork(app, true);
                }}
                disabled={busyAppId === app._id}
                className={`${styles.buttonBase} ${styles.buttonInfo} ${busyAppId === app._id ? styles.buttonDisabled : ""}`}
              >
                {busyAppId === app._id ? "Resubmitting..." : "Resubmit"}
              </button>
              {appErrors[app._id] ? <p className={styles.errorText}>{appErrors[app._id]}</p> : null}
            </div>
          </div>
        )}

        {status === "submitted" && (
          <div className={`${styles.sectionPanel} ${styles.infoPanelBlue}`}>
            <p className={styles.infoPanelTitle}>Submitted, waiting for brand review</p>
            {submissionDetails?.submittedAt ? (
              <p className={styles.sectionText}>Submitted on {new Date(submissionDetails.submittedAt).toLocaleDateString()}</p>
            ) : null}
          </div>
        )}

        {status === "completed" && (
          <div className={`${styles.sectionPanel} ${styles.infoPanelGreen}`}>
            <p className={styles.infoPanelTitle}>Work Approved</p>
            <p>Your submission has been approved by the brand.</p>
          </div>
        )}

        {status === "rejected" && (
          <div className={`${styles.sectionPanel} ${styles.infoPanelRed}`}>
            <p className={styles.infoPanelTitle}>Rejected</p>
            <p>{app.rejectionReason || "No reason was provided."}</p>
          </div>
        )}

        {isReadOnly && submissionDetails && (
          <div className={`${styles.sectionPanel} ${styles.infoPanelWhite}`}>
            <p className={styles.infoPanelTitle}>Submission Details</p>
            {submissionDetails.reelLink ? (
              <p className={styles.sectionText}><span className={styles.labelText}>Reel:</span> <a className={styles.infoPanelLink} href={submissionDetails.reelLink} target="_blank" rel="noreferrer">View</a></p>
            ) : null}
            {submissionDetails.postLink ? (
              <p className={styles.sectionText}><span className={styles.labelText}>Post:</span> <a className={styles.infoPanelLink} href={submissionDetails.postLink} target="_blank" rel="noreferrer">View</a></p>
            ) : null}
            {submissionDetails.caption ? (
              <p className={styles.sectionText}><span className={styles.labelText}>Caption:</span> {submissionDetails.caption}</p>
            ) : null}
            {submissionDetails.feedback ? (
              <p className={styles.sectionText}><span className={styles.labelText}>Brand feedback:</span> {submissionDetails.feedback}</p>
            ) : null}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    const session = getAuthSession("influencer");
    if (!session) {
      router.replace("/influencer/login");
      return;
    }

    const fetchApplications = async () => {
      try {
        const response = await authFetchJson<{ applications?: Application[] }>(
          "influencer",
          `${apiBaseUrl}/api/campaigns/influencer/applications`,
          {
            method: "GET",
          }
        );

        setApplications(response.applications || []);
      } catch (error) {
        console.error("Failed to fetch applications", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchApplications();
  }, [apiBaseUrl, router]);

  const totals = useMemo(() => {
    const total = applications.length;
    const accepted = applications.filter((item) => {
      const status = normalizeStatus(item.status, item.paymentStatus);
      return status === "accepted" || status === "in_progress";
    }).length;
    const paid = applications.filter((item) => item.paymentStatus === "paid").length;
    return { total, accepted, paid };
  }, [applications]);

  const tabCounts = useMemo(() => {
    const counts: Record<FilterValue, number> = {
      all: applications.length,
      pending: 0,
      accepted: 0,
      in_progress: 0,
      submitted: 0,
      revision_required: 0,
      completed: 0,
      rejected: 0,
    };

    applications.forEach((item) => {
      const status = normalizeStatus(item.status, item.paymentStatus);
      counts[status] += 1;
    });

    return counts;
  }, [applications]);

  const filteredApplications = useMemo(() => {
    if (activeFilter === "all") return applications;

    return applications.filter((item) => normalizeStatus(item.status, item.paymentStatus) === activeFilter);
  }, [activeFilter, applications]);

  return (
    <PageShell  title="My Applications" subtitle="View every campaign you have applied for in one place.">
      <div className={styles.pageContainer}>

      {/* Stats Cards with Enhanced Design */}
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={styles.statCardInner}>
            <div className={`${styles.statCardIcon} ${styles.iconBlue}`}>
              <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className={styles.statCardLabel}>Total Applied</p>
              <p className={styles.statCardValue}>
                Total Applied <span>{totals.total}</span>
              </p>
            </div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statCardInner}>
            <div className={`${styles.statCardIcon} ${styles.iconGreen}`}>
              <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className={styles.statCardLabel}>Currently Working</p>
              <p className={styles.statCardValue}>
                Currently Working <span>{totals.accepted}</span>
              </p>
            </div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statCardInner}>
            <div className={`${styles.statCardIcon} ${styles.iconPurple}`}>
              <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <p className={styles.statCardLabel}>Paid Campaigns</p>
              <p className={styles.statCardValue}>
                Paid Campaigns <span>{totals.paid}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filter Tabs */}
      <div className={styles.filterTabsWrapper}>
        <div className={styles.filterTabs}>
          {FILTER_TABS.filter((tab) => tab.value !== "all").map((tab) => {
            const isActive = activeFilter === tab.value;
            const count = tabCounts[tab.value];

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveFilter(tab.value)}
                className={`${styles.filterTab} ${isActive ? styles.filterTabActive : styles.filterTabInactive}`}
                aria-pressed={isActive}
              >
                <span className={styles.filterTabInner}>
                  {tab.label}
                  <span className={`${styles.filterCount} ${isActive ? styles.filterCountActive : styles.filterCountInactive}`}>
                    {count}
                  </span>
                </span>
                {isActive && <div className={styles.filterActiveBackground} />}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <p>Loading applications...</p>
      ) : applications.length === 0 ? (
        <p>No applications yet.</p>
      ) : filteredApplications.length === 0 ? (
        <p>No applications found in this filter.</p>
      ) : (
        <div className={styles.cardsWrapper}>
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scroll("left")}
              className={styles.scrollArrowLeft}
              aria-label="Scroll left"
            >
              ‹
            </button>
          )}
          <div className={styles.cardsContainer} ref={cardsContainerRef}>
            {filteredApplications.map((app) => {
            const imageUrl = resolveCampaignImageUrl(app.campaignId?.imageFile, apiBaseUrl);
            const campaignId = String(app.campaignId?._id || "").trim();
            const cardStatus = normalizeStatus(app.status, app.paymentStatus);

            return (
            <article
              key={app._id}
              className={`${styles.card} ${styles.campaignCard}`}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (!campaignId) return;
                const status = normalizeStatus(app.status, app.paymentStatus);
                if (status === "in_progress" || status === "revision_required") {
                  setExpandedCardId(app._id);
                  setFormExpandedId(null);
                } else {
                  router.push(`/influencer/dashboard/campaign/${campaignId}`);
                }
              }}
              onKeyDown={(event) => {
                if ((event.key === "Enter" || event.key === " ") && campaignId) {
                  event.preventDefault();
                  const status = normalizeStatus(app.status, app.paymentStatus);
                  if (status === "in_progress" || status === "revision_required") {
                    setExpandedCardId(app._id);
                    setFormExpandedId(null);
                  } else {
                    router.push(`/influencer/dashboard/campaign/${campaignId}`);
                  }
                }
              }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={app.campaignId?.title || "Campaign"}
                  className={styles.campaignImg}
                />
              ) : (
                <div className={styles.campaignImagePlaceholder}>No Image</div>
              )}

              <div className={styles.campaignHeaderRow}>
                <h2 className={styles.campaignCardTitle}>{app.campaignId?.title || "Campaign"}</h2>
                <span className={`${styles.campaignStatusBadge} ${styles[`status${cardStatus.replace(/_/g, "")}Badge`]}`}>
                  {getStatusLabel(app.status)}
                </span>
              </div>

              <div className={styles.campaignBudgetRow}>
                <p className={styles.campaignBudgetText}>Budget: {formatBudget(app.campaignId?.budget || 0)}</p>
                <div className={styles.campaignPlatformIcons}>
                  {getSelectedPlatforms(app.campaignId?.description || "").map((platformKey) => {
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

              <p className={styles.campaignSummaryLine}>
                <span>Brand:</span> {app.campaignId?.brandId?.name || app.campaignId?.brandId?.brandName || "N/A"}
              </p>
              <p className={styles.campaignOpenHint}>Click card to view full campaign details</p>

              {renderSubmissionSection(app)}
            </article>
          );})}            </div>
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scroll("right")}
              className={styles.scrollArrowRight}
              aria-label="Scroll right"
            >
              ›
            </button>
          )}        </div>
      )}
      </div>
    </PageShell>
  );
}