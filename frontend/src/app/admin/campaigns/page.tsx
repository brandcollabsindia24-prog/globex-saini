"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./AdminCampaigns.module.css";
import { getAuthSession } from "../../../lib/authStorage";

type Brand = {
  _id: string;
  brandName?: string;
  name?: string;
};

type Campaign = {
  _id: string;
  title: string;
  description: string;
  budget: number;
  status: "pending" | "active" | "approved" | "completed" | "closed" | "rejected";
  imageFile?: string;
  applications?: unknown[] | number;
  brandId?: {
    _id: string;
    brandName?: string;
    name?: string;
  };
};

const PLATFORM_ICON_META: Record<string, { label: string; icon: string }> = {
  instagram: { label: "Instagram", icon: "/instagram-icon.svg" },
  youtube: { label: "YouTube", icon: "/youtube-icon.svg" },
  facebook: { label: "Facebook", icon: "/facebook-icon.svg" },
};

const PLATFORM_ORDER = ["instagram", "youtube", "facebook"] as const;

function resolveApiBaseUrl(): string {
  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
  return process.env.NEXT_PUBLIC_API_BASE_URL || `http://${host}:5000`;
}

function resolveCampaignImageUrl(imageFile?: string): string {
  const raw = (imageFile || "").trim();
  if (!raw) return "";

  // Handle malformed Windows-style slashes just in case old records have them.
  const normalized = raw.replace(/\\/g, "/");

  if (/^https?:\/\//i.test(normalized)) {
    // If DB has localhost URL and app is opened from LAN IP, rewrite host for visibility on other devices.
    const currentHost = typeof window !== "undefined" ? window.location.hostname : "localhost";
    return normalized.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, `http://${currentHost}:5000`);
  }

  if (normalized.startsWith("/")) {
    return `${resolveApiBaseUrl()}${normalized}`;
  }

  return `${resolveApiBaseUrl()}/${normalized}`;
}

function getSelectedPlatforms(description: string): string[] {
  const line = description
    .split("\n")
    .map((entry) => entry.trim())
    .find((entry) => entry.toLowerCase().startsWith("platforms:"));

  if (!line) return [];

  const raw = line.slice(line.indexOf(":") + 1);
  const selected = raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return PLATFORM_ORDER.filter((key) => selected.includes(key));
}

function parseDescriptionField(description: string, label: string): string {
  const line = description
    .split("\n")
    .map((entry) => entry.trim())
    .find((entry) => entry.toLowerCase().startsWith(`${label.toLowerCase()}:`));

  if (!line) return "N/A";
  return line.split(":").slice(1).join(":").trim() || "N/A";
}

function parseApplicationsCount(value: unknown[] | number | undefined): number {
  if (Array.isArray(value)) return value.length;
  if (typeof value === "number") return value;
  return 0;
}

export default function AdminCampaignsPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "active" | "completed">("all");
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [loading, setLoading] = useState(true);

  type ActionVariant = "primary" | "secondary" | "danger";
  type CampaignAction = {
    key: string;
    label: string;
    variant: ActionVariant;
    onClick: (campaign: Campaign) => void | Promise<void>;
  };

  const normalizeStatus = (status: Campaign["status"]): "pending" | "active" | "completed" => {
    if (status === "pending") {
      return "pending";
    }
    if (status === "active" || status === "approved") {
      return "active";
    }
    return "completed";
  };

  const getStatusGroup = (status: Campaign["status"]): "active" | "inactive" | "completed" => {
    if (status === "completed") return "completed";
    if (status === "active" || status === "approved") return "active";
    return "inactive";
  };

  const runFilter = (
    inputCampaigns: Campaign[],
    nextStatus: "all" | "pending" | "active" | "completed",
    nextSearch: string
  ) => {
    const keyword = nextSearch.trim().toLowerCase();
    const next = inputCampaigns.filter((campaign) => {
      const campaignStatus = normalizeStatus(campaign.status);
      const statusMatched = nextStatus === "all" ? true : campaignStatus === nextStatus;
      const brandName = campaign.brandId?.brandName || campaign.brandId?.name || "";
      const searchMatched = keyword
        ? campaign.title.toLowerCase().includes(keyword) || brandName.toLowerCase().includes(keyword)
        : true;
      return statusMatched && searchMatched;
    });
    setFilteredCampaigns(next);
  };

  const fetchCampaigns = async (authToken: string, brandId = "") => {
    try {
      setLoading(true);
      const url = brandId
        ? `http://localhost:5000/api/admin/campaigns?brandId=${brandId}`
        : "http://localhost:5000/api/admin/campaigns";
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const nextCampaigns = response.data?.campaigns || [];
      setCampaigns(nextCampaigns);
      runFilter(nextCampaigns, statusFilter, appliedSearch);
    } catch (error) {
      alert("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  const updateCampaignStatus = async (campaignId: string, nextStatus: Campaign["status"]) => {
    if (!token) return;
    try {
      await axios.patch(
        `${resolveApiBaseUrl()}/api/admin/campaigns/${campaignId}/status`,
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCampaigns(token, selectedBrandId);
    } catch {
      alert("Failed to update campaign status");
    }
  };

  const handleView = (campaign: Campaign) => {
    router.push(`/admin/campaigns/${campaign._id}`);
  };

  const handleActivate = async (campaign: Campaign) => {
    await updateCampaignStatus(campaign._id, "active");
  };

  const handlePause = async (campaign: Campaign) => {
    await updateCampaignStatus(campaign._id, "closed");
  };

  const handleComplete = async (campaign: Campaign) => {
    await updateCampaignStatus(campaign._id, "completed");
  };

  const handleDelete = async (campaign: Campaign) => {
    if (!token) return;
    const confirmed = window.confirm("Delete this campaign permanently?");
    if (!confirmed) return;

    try {
      await axios.delete(`${resolveApiBaseUrl()}/api/admin/campaigns/${campaign._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCampaigns(token, selectedBrandId);
    } catch {
      alert("Failed to delete campaign");
    }
  };

  const handleEdit = (campaign: Campaign) => {
    router.push(`/admin/campaigns/${campaign._id}/edit`);
  };

  const handleDuplicate = async (campaign: Campaign) => {
    if (!token) return;
    try {
      await axios.post(
        `${resolveApiBaseUrl()}/api/admin/campaigns/${campaign._id}/duplicate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCampaigns(token, selectedBrandId);
    } catch {
      alert("Failed to duplicate campaign");
    }
  };

  const getActionsForCampaign = (campaign: Campaign): CampaignAction[] => {
    const group = getStatusGroup(campaign.status);

    if (group === "active") {
      return [
        { key: "complete", label: "Complete", variant: "primary", onClick: handleComplete },
        { key: "pause", label: "Pause", variant: "secondary", onClick: handlePause },
        { key: "view", label: "View", variant: "secondary", onClick: handleView },
      ];
    }

    if (group === "inactive") {
      return [
        { key: "activate", label: "Activate", variant: "primary", onClick: handleActivate },
        { key: "edit", label: "Edit", variant: "secondary", onClick: handleEdit },
        { key: "delete", label: "Delete", variant: "danger", onClick: handleDelete },
      ];
    }

    return [
      { key: "view", label: "View", variant: "secondary", onClick: handleView },
      { key: "duplicate", label: "Duplicate", variant: "primary", onClick: handleDuplicate },
      { key: "delete", label: "Delete", variant: "danger", onClick: handleDelete },
    ];
  };

  useEffect(() => {
    const session = getAuthSession("admin");
    const authToken = session?.token || "";
    const user = session?.user;

    if (!authToken || !user || user.role !== "admin") {
      router.replace("/admin/auth");
      return;
    }

    setToken(authToken);

    const fetchInitial = async () => {
      try {
        const brandsResponse = await axios.get("http://localhost:5000/api/admin/brands", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setBrands(brandsResponse.data?.brands || []);
      } catch (error) {
        alert("Failed to load brands");
      }

      await fetchCampaigns(authToken);
    };

    void fetchInitial();
  }, [router]);

  const onBrandChange = (brandId: string) => {
    setSelectedBrandId(brandId);
    void fetchCampaigns(token, brandId);
  };

  const handleStatusFilter = (nextStatus: "all" | "pending" | "active" | "completed") => {
    setStatusFilter(nextStatus);
    runFilter(campaigns, nextStatus, appliedSearch);
  };

  const handleSearch = () => {
    setAppliedSearch(searchInput);
    runFilter(campaigns, statusFilter, searchInput);
  };

  return (
    <main className={styles.campaignsPage}>
      <h1 className={styles.pageTitle}>Campaigns Page</h1>

      <div className={styles.topBar}>
        <div className={styles.filterButtons}>
          <button
            className={statusFilter === "all" ? styles.active : ""}
            onClick={() => handleStatusFilter("all")}
          >
            All
          </button>
          <button
            className={statusFilter === "pending" ? styles.active : ""}
            onClick={() => handleStatusFilter("pending")}
          >
            Pending
          </button>
          <button
            className={statusFilter === "active" ? styles.active : ""}
            onClick={() => handleStatusFilter("active")}
          >
            Active
          </button>
          <button
            className={statusFilter === "completed" ? styles.active : ""}
            onClick={() => handleStatusFilter("completed")}
          >
            Completed
          </button>

          <select value={selectedBrandId} onChange={(event) => onBrandChange(event.target.value)}>
            <option value="">All Brands</option>
            {brands.map((brand) => (
              <option key={brand._id} value={brand._id}>
                {brand.brandName || brand.name || "Unknown Brand"}
              </option>
            ))}
          </select>

          <Link href="/admin/dashboard">
            <button>Back</button>
          </Link>
        </div>

        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search campaign or brand"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
      </div>

        {loading ? (
          <p className={styles.emptyText}>Loading campaigns...</p>
        ) : filteredCampaigns.length === 0 ? (
          <p className={styles.emptyText}>No campaigns found for selected filter/search.</p>
        ) : (
          <div className={styles.adminCampaignGrid}>
            {filteredCampaigns.map((campaign) => (
              <article
                key={campaign._id}
                className={styles.adminCampaignCard}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/admin/campaigns/${campaign._id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push(`/admin/campaigns/${campaign._id}`);
                  }
                }}
              >
                {campaign.imageFile ? (
                  <img
                    src={resolveCampaignImageUrl(campaign.imageFile)}
                    alt={campaign.title}
                    className={styles.adminCampaignImage}
                  />
                ) : (
                  <div className={styles.adminCampaignImagePlaceholder}>No Image</div>
                )}

                <h2 className={styles.cardTitle}>{campaign.title}</h2>
                <div className={styles.brandRow}>
                  <p className={styles.brandText}>
                    Brand: {parseDescriptionField(campaign.description, "Brand Name") || campaign.brandId?.brandName || campaign.brandId?.name || "N/A"}
                  </p>
                  <div className={styles.platformIcons}>
                    {getSelectedPlatforms(campaign.description).map((platformKey) => {
                      const meta = PLATFORM_ICON_META[platformKey];
                      return (
                        <img
                          key={platformKey}
                          src={meta.icon}
                          alt={meta.label}
                          title={meta.label}
                          className={styles.platformIcon}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className={styles.budgetRow}>
                  <p className={styles.budgetText}>Budget: INR {campaign.budget}</p>
                  <p className={styles.applicationText}>Applications: {parseApplicationsCount(campaign.applications)}</p>
                </div>

                <div className={styles.cardActions}>
                  {getActionsForCampaign(campaign).map((action) => (
                    <button
                      key={action.key}
                      type="button"
                      className={`${styles.cardActionBtn} ${styles[`cardAction${action.variant[0].toUpperCase()}${action.variant.slice(1)}`]}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        void action.onClick(campaign);
                      }}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
    </main>
  );
}
