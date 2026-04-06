"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthSession } from "../../../lib/authStorage";
import { authFetchJson } from "../../../lib/authFetch";
import PageShell from "../../../components/PageShell";
import styles from "../dashboard/InfluencerDashboard.module.css";

const PLATFORM_ICON_META: Record<string, { label: string; icon: string }> = {
  instagram: { label: "Instagram", icon: "/instagram-icon.svg" },
  youtube: { label: "YouTube", icon: "/youtube-icon.  git push -u origin mainsvg" },
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

type FilterValue = "all" | "pending" | "accepted" | "in_progress" | "submitted" | "completed" | "rejected";

const FILTER_TABS: Array<{ label: string; value: FilterValue }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "In Progress", value: "in_progress" },
  { label: "Submitted", value: "submitted" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
];

function normalizeStatus(status: string): Exclude<FilterValue, "all"> {
  const normalized = String(status || "").trim().toLowerCase();

  if (normalized === "applied") return "pending";
  if (normalized === "shortlisted") return "in_progress";
  if (normalized === "accepted") return "accepted";
  if (normalized === "in_progress") return "in_progress";
  if (normalized === "submitted") return "submitted";
  if (normalized === "completed") return "completed";
  if (normalized === "rejected") return "rejected";

  return "pending";
}

export default function MyApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterValue>("pending");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || `http://${host}:5000`;

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
      const status = normalizeStatus(item.status);
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
      completed: 0,
      rejected: 0,
    };

    applications.forEach((item) => {
      const status = normalizeStatus(item.status);
      counts[status] += 1;
    });

    return counts;
  }, [applications]);

  const filteredApplications = useMemo(() => {
    if (activeFilter === "all") return applications;

    return applications.filter((item) => normalizeStatus(item.status) === activeFilter);
  }, [activeFilter, applications]);

  return (
    <PageShell title="My Applications" subtitle="View every campaign you have applied for in one place.">

      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <div className="border p-4 rounded shadow-sm bg-white">
          <p className="text-sm text-slate-500">Total Applied</p>
          <p className="text-2xl font-bold">{totals.total}</p>
        </div>
        <div className="border p-4 rounded shadow-sm bg-white">
          <p className="text-sm text-slate-500">Currently Working</p>
          <p className="text-2xl font-bold">{totals.accepted}</p>
        </div>
        <div className="border p-4 rounded shadow-sm bg-white">
          <p className="text-sm text-slate-500">Paid Campaigns</p>
          <p className="text-2xl font-bold">{totals.paid}</p>
        </div>
      </div>

      <div className="mb-6 overflow-x-auto">
        <div className="inline-flex min-w-max items-center gap-2 rounded-xl border border-slate-700/30 bg-slate-900/30 p-1">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.value;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveFilter(tab.value)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/40"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
                aria-pressed={isActive}
              >
                {tab.label} ({tabCounts[tab.value]})
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
        <div className={styles.cardsContainer}>
          {filteredApplications.map((app) => {
            const imageUrl = resolveCampaignImageUrl(app.campaignId?.imageFile, apiBaseUrl);
            const campaignId = String(app.campaignId?._id || "").trim();

            return (
            <article
              key={app._id}
              className={`${styles.card} ${styles.campaignCard}`}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (!campaignId) return;
                router.push(`/influencer/dashboard/campaign/${campaignId}`);
              }}
              onKeyDown={(event) => {
                if ((event.key === "Enter" || event.key === " ") && campaignId) {
                  event.preventDefault();
                  router.push(`/influencer/dashboard/campaign/${campaignId}`);
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

              <h2 className={styles.campaignCardTitle}>{app.campaignId?.title || "Campaign"}</h2>

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
            </article>
          );})}
        </div>
      )}
    </PageShell>
  );
}