"use client";

import { ChangeEvent, FormEvent, MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import axios from "axios";
import { motion } from "framer-motion";
import styles from "./Dashboard.module.css";
import type { BrandUser, Campaign, CampaignForm, RecommendedInfluencer } from "./types";
import { clearAuthSession, getAuthSession } from "../../../lib/authStorage";
import Navbar from "./components/Navbar";
import StatsCards from "./components/StatsCards";
import RecommendedInfluencers from "./components/RecommendedInfluencers";
const CampaignList = dynamic(() => import("./components/CampaignList"), {
  loading: () => <p style={{ textAlign: "center", marginTop: "20px" }}>Loading campaigns...</p>,
});
const CampaignModal = dynamic(() => import("./components/CampaignModal"));

const EMPTY_CAMPAIGN: CampaignForm = {
  title: "",
  brandName: "",
  budget: "",
  numberOfInfluencers: "",
  pricePerInfluencer: "",
  description: "",
  timeline: "Flexible timeline",
  platforms: [],
  websiteLink: "",
  instagramHandle: "",
  categories: [],
  targetGender: "",
  followersRange: "",
};

type UploadedCampaignImage = {
  file: File;
  previewUrl: string;
};

type CampaignFormErrorKey =
  | "title"
  | "brandName"
  | "description"
  | "timeline"
  | "budget"
  | "numberOfInfluencers"
  | "pricePerInfluencer"
  | "platforms"
  | "websiteLink"
  | "instagramHandle"
  | "categories"
  | "targetGender"
  | "followersRange"
  | "images";

type CampaignFormErrors = Partial<Record<CampaignFormErrorKey, string>>;

const RECOMMENDED_INFLUENCERS: RecommendedInfluencer[] = [
  { id: "inf-1", name: "Aarav Vlogs", niche: "Tech", followers: "128K", avgRate: "12000" },
  { id: "inf-2", name: "Mira FitLife", niche: "Fitness", followers: "214K", avgRate: "15000" },
  { id: "inf-3", name: "Naina Stylebook", niche: "Fashion", followers: "186K", avgRate: "18000" },
];

const SHORTLIST_STORAGE_KEY = "brandShortlistedInfluencers";
const INFLUENCER_SHORTLIST_STORAGE_KEY = "brandInfluencerShortlist";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

function normalizeWebsiteUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function parseNumeric(value: number | string | undefined): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (!value) return 0;

  const cleaned = String(value).replace(/[^\d.]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseCount(value: unknown[] | number | undefined): number {
  if (Array.isArray(value)) return value.length;
  if (typeof value === "number") return value;
  return 0;
}

function normalizeStatus(status: string | undefined): string {
  return (status || "").trim().toLowerCase();
}

export default function BrandDashboard() {
  const router = useRouter();
  const isFetchingCampaignsRef = useRef(false);

  const [token, setToken] = useState<string | null>(null);
  const [brandData, setBrandData] = useState<BrandUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [campaign, setCampaign] = useState<CampaignForm>(EMPTY_CAMPAIGN);
  const [campaignImages, setCampaignImages] = useState<UploadedCampaignImage[]>([]);
  const [campaignErrors, setCampaignErrors] = useState<CampaignFormErrors>({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSubmittingCampaign, setIsSubmittingCampaign] = useState(false);
  const [isSubmittedCampaign, setIsSubmittedCampaign] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [shortlistedInfluencerIds, setShortlistedInfluencerIds] = useState<string[]>([]);
  const [influencerShortlistCount, setInfluencerShortlistCount] = useState(0);
  const campaignImagesRef = useRef<UploadedCampaignImage[]>([]);

  const fetchCampaigns = useCallback(async (authToken: string) => {
    if (!authToken || isFetchingCampaignsRef.current) return;
    isFetchingCampaignsRef.current = true;

    try {
      const res = await axios.get(`${API_BASE_URL}/api/campaigns/my`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setCampaigns(res.data?.campaigns || []);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          clearAuthSession("brand");
          router.replace("/brand/login");
          return;
        }
      }

      console.error("Fetch campaigns error:", error);
    } finally {
      isFetchingCampaignsRef.current = false;
    }
  }, [router]);

  useEffect(() => {
    const session = getAuthSession<BrandUser>("brand");
    const storedUser = session?.user || null;
    const storedToken = session?.token || null;
    const storedShortlist = localStorage.getItem(SHORTLIST_STORAGE_KEY);
    const storedInfluencerShortlist = localStorage.getItem(INFLUENCER_SHORTLIST_STORAGE_KEY);

    if (storedShortlist) {
      try {
        const parsedShortlist = JSON.parse(storedShortlist) as string[];
        if (Array.isArray(parsedShortlist)) {
          setShortlistedInfluencerIds(parsedShortlist);
        }
      } catch (error) {
        console.error("Invalid shortlist cache:", error);
      }
    }

    if (storedInfluencerShortlist) {
      try {
        const parsedInfluencerShortlist = JSON.parse(storedInfluencerShortlist) as unknown[];
        if (Array.isArray(parsedInfluencerShortlist)) {
          setInfluencerShortlistCount(parsedInfluencerShortlist.length);
        }
      } catch (error) {
        console.error("Invalid influencer shortlist cache:", error);
      }
    }

    if (!storedUser || !storedToken) {
      router.replace("/brand/login");
      setLoading(false);
      return;
    }

    try {
      if (storedUser.role !== "brand") {
        if (storedUser.role === "admin") {
          router.replace("/admin/dashboard");
        } else {
          router.replace("/");
        }
        setLoading(false);
        return;
      }

      setToken(storedToken);
      setBrandData(storedUser);
      setLoading(false);
      void fetchCampaigns(storedToken);
    } catch (error) {
      console.error("Invalid user data:", error);
      clearAuthSession("brand");
      router.replace("/brand/login");
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    campaignImagesRef.current = campaignImages;
  }, [campaignImages]);

  useEffect(() => {
    return () => {
      campaignImagesRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  const metrics = useMemo(() => {
    const total = campaigns.length;

    const active = campaigns.filter((item) => {
      const state = normalizeStatus(item.status);
      return state === "active" || state === "approved" || state === "running" || state === "in_progress";
    }).length;

    const completed = campaigns.filter((item) => {
      const state = normalizeStatus(item.status);
      return state === "completed" || state === "closed";
    }).length;

    const pending = campaigns.filter((item) => {
      const state = normalizeStatus(item.status);
      return state === "pending" || state === "review";
    }).length;

    const totalBudget = campaigns.reduce((sum, item) => sum + parseNumeric(item.budget), 0);

    const totalApplications = campaigns.reduce((sum, item) => {
      return sum + parseCount(item.applications);
    }, 0);

    const selectedInfluencers = campaigns.reduce((sum, item) => {
      return sum + parseCount(item.selectedInfluencers) + parseCount(item.shortlistedInfluencers);
    }, 0);

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      active,
      completed,
      pending,
      totalBudget,
      totalApplications,
      selectedInfluencers,
      completionRate,
    };
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(searchText.toLowerCase());
      const descMatch = item.description.toLowerCase().includes(searchText.toLowerCase());
      const matchesSearch = titleMatch || descMatch;
      const matchesStatus = statusFilter === "all" || normalizeStatus(item.status) === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchText, statusFilter]);

  const handleLogout = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    if (!window.confirm("Are you sure you want to logout?")) {
      return;
    }

    clearAuthSession("brand");
    alert("Logout successful!");
    router.replace("/brand/login");
  }, [router]);

  const validateCampaign = useCallback((nextCampaign: CampaignForm, nextImages: UploadedCampaignImage[]): CampaignFormErrors => {
    const errors: CampaignFormErrors = {};

    if (!nextCampaign.title.trim()) errors.title = "Campaign title is required";
    if (!nextCampaign.brandName.trim()) errors.brandName = "Brand name is required";
    if (!nextCampaign.description.trim()) errors.description = "Description is required";
    if (!nextCampaign.timeline.trim()) errors.timeline = "Timeline is required";

    if (!nextCampaign.budget.trim()) {
      errors.budget = "Budget is required";
    } else if (Number(nextCampaign.budget) <= 0) {
      errors.budget = "Budget must be greater than 0";
    }

    if (!nextCampaign.numberOfInfluencers.trim()) {
      errors.numberOfInfluencers = "Number of influencers is required";
    } else if (Number(nextCampaign.numberOfInfluencers) <= 0) {
      errors.numberOfInfluencers = "Number of influencers must be greater than 0";
    }

    if (nextCampaign.platforms.length === 0) errors.platforms = "Select at least one platform";

   

    if (!nextCampaign.websiteLink.trim()) {
      errors.websiteLink = "Website link is required";
    } else {
      try {
        new URL(normalizeWebsiteUrl(nextCampaign.websiteLink));
      } catch {
        errors.websiteLink = "Enter a valid website URL";
      }
    }

    if (!nextCampaign.instagramHandle.trim()) errors.instagramHandle = "Instagram handle is required";
    if (nextCampaign.categories.length === 0) errors.categories = "Select at least one category";
    if (!nextCampaign.targetGender) errors.targetGender = "Target gender is required";
    if (!nextCampaign.followersRange) errors.followersRange = "Followers range is required";

    if (nextImages.length === 0) errors.images = "Upload at least 1 image";
    if (nextImages.length > 3) errors.images = "You can upload maximum 3 images";

    return errors;
  }, []);

  const handleImageUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    setCampaignImages((prev) => {
      const remainingSlots = 3 - prev.length;

      if (remainingSlots <= 0) {
        setCampaignErrors((current) => ({ ...current, images: "You can upload maximum 3 images" }));
        return prev;
      }

      const accepted = selectedFiles.slice(0, remainingSlots).map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      if (selectedFiles.length > remainingSlots) {
        setCampaignErrors((current) => ({ ...current, images: "Only 3 images allowed" }));
      } else {
        setCampaignErrors((current) => {
          const { images, ...rest } = current;
          return rest;
        });
      }

      return [...prev, ...accepted];
    });

    event.target.value = "";
  }, []);

  const removeImage = useCallback((index: number) => {
    setCampaignImages((prev) => {
      const item = prev[index];
      if (item) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((_, imageIndex) => imageIndex !== index);
    });
  }, []);

  const handleCampaignChange = useCallback((
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setCampaign((prev) => ({ ...prev, [name]: value }));
    setCampaignErrors((prev) => {
      const typedKey = name as CampaignFormErrorKey;
      if (!prev[typedKey]) return prev;

      const next = { ...prev };
      delete next[typedKey];
      return next;
    });
  }, []);

  const togglePlatform = useCallback((platform: string) => {
    setCampaign((prev) => {
      const exists = prev.platforms.includes(platform);
      const nextPlatforms = exists ? prev.platforms.filter((item) => item !== platform) : [...prev.platforms, platform];
      return { ...prev, platforms: nextPlatforms };
    });

    setCampaignErrors((prev) => {
      const { platforms, ...rest } = prev;
      return platforms ? rest : prev;
    });
  }, []);

  const toggleCategory = useCallback((category: string) => {
    setCampaign((prev) => {
      const exists = prev.categories.includes(category);
      const nextCategories = exists ? prev.categories.filter((item) => item !== category) : [...prev.categories, category];
      return { ...prev, categories: nextCategories };
    });

    setCampaignErrors((prev) => {
      const { categories, ...rest } = prev;
      return categories ? rest : prev;
    });
  }, []);

  const togglePreview = useCallback(() => {
    setIsPreviewOpen((prev) => !prev);
  }, []);

  const handleSubmitCampaign = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateCampaign(campaign, campaignImages);
    if (Object.keys(validationErrors).length > 0) {
      setCampaignErrors(validationErrors);
      setIsPreviewOpen(false);
      return;
    }

    if (!token) {
      router.replace("/brand/login");
      return;
    }

    try {
      setIsSubmittingCampaign(true);
      const formData = new FormData();

      const compiledDescription = [
        campaign.description,
        `Brand Name: ${campaign.brandName}`,
        `Platforms: ${campaign.platforms.join(", ")}`,
        `Website: ${campaign.websiteLink}`,
        `Instagram Handle: ${campaign.instagramHandle}`,
        `Target Audience: ${campaign.targetGender} | ${campaign.followersRange}`,
        `Number of Influencers: ${campaign.numberOfInfluencers}`,
      ]
        .filter(Boolean)
        .join("\n");

      formData.append("title", campaign.title);
      formData.append("budget", campaign.budget);
      formData.append("description", compiledDescription);
      formData.append("timeline", campaign.timeline.trim() || "Flexible timeline");
      formData.append("category", campaign.categories.join(", "));
      formData.append("status", "pending");
      formData.append("websiteLink", normalizeWebsiteUrl(campaign.websiteLink));

      if (campaignImages[0]?.file) {
        formData.append("image", campaignImages[0].file);
      }

      const res = await axios.post(
        `${API_BASE_URL}/api/campaigns`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsSubmittedCampaign(true);
      setCampaigns((prev) => [res.data.campaign, ...prev]);

      setTimeout(() => {
        setShowCampaignForm(false);
        campaignImages.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        setCampaignImages([]);
        setCampaignErrors({});
        setIsPreviewOpen(false);
        setIsSubmittedCampaign(false);
        setCampaign({
          ...EMPTY_CAMPAIGN,
          brandName: brandData?.brandName || "",
        });
      }, 1500);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          alert("Session expired. Please login again.");
          clearAuthSession("brand");
          router.replace("/brand/login");
          return;
        }

        if (error.response?.status === 413) {
          alert("Image size too large! Please upload a smaller image.");
          return;
        }

        alert(error.response?.data?.message || "Something went wrong");
        return;
      }

      alert("Something went wrong");
      console.error("Create campaign error:", error);
    } finally {
      setIsSubmittingCampaign(false);
    }
  }, [brandData?.brandName, campaign, campaignImages, router, token, validateCampaign]);

  const toggleShortlist = useCallback((influencerId: string) => {
    setShortlistedInfluencerIds((prev) => {
      const exists = prev.includes(influencerId);
      const next = exists ? prev.filter((id) => id !== influencerId) : [...prev, influencerId];
      localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const openCampaignForm = useCallback(() => {
    setCampaign((prev) => ({
      ...prev,
      brandName: prev.brandName || brandData?.brandName || "",
    }));
    setCampaignErrors({});
    setIsPreviewOpen(false);
    setShowCampaignForm(true);
  }, [brandData?.brandName]);

  const closeCampaignForm = useCallback(() => {
    setShowCampaignForm(false);
    setCampaignErrors({});
    setIsPreviewOpen(false);
  }, []);
  const goToInfluencers = useCallback(() => router.push("/brand/influencers"), [router]);
  const goToMyCampaigns = useCallback(() => router.push("/brand/campaign/my-campaigns"), [router]);

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "40px" }}>Loading Dashboard...</p>;
  }

  return (
    <section>
      <Navbar influencerShortlistCount={influencerShortlistCount} onLogout={handleLogout} />

      <div className={styles["brand-dashboard-main"]}>
        <motion.div
          className={styles["welcome-banner"]}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>
            Welcome, <span>{brandData?.brandName || "Brand Partner"}</span>
          </h1>
          <p>Track campaign health, manage applications, and shortlist creators faster.</p>

          <div className={styles["cta-buttons"]}>
            <button className={styles["create-btn"]} onClick={openCampaignForm}>
              + Create Campaign
            </button>

            <button className={styles["explore-btn"]} onClick={goToInfluencers}>
              Explore Influencers
            </button>

            <button className={styles["explore-btn"]} onClick={goToMyCampaigns}>
              Manage My Campaign
            </button>
          </div>
        </motion.div>

        <StatsCards metrics={metrics} shortlistedCount={shortlistedInfluencerIds.length} />

        <div className={styles["insight-panel"]}>
          <div>
            <h2>Campaign Completion Rate</h2>
            <p>{metrics.completionRate}% campaigns completed</p>
          </div>
          <div className={styles["progress-track"]}>
            <div className={styles["progress-fill"]} style={{ width: `${metrics.completionRate}%` }} />
          </div>
          <div className={styles["insight-meta"]}>
            <span>Pending: {metrics.pending}</span>
            <span>Active: {metrics.active}</span>
            <span>Completed: {metrics.completed}</span>
          </div>
        </div>

        <RecommendedInfluencers
          influencers={RECOMMENDED_INFLUENCERS}
          onOpenExplore={goToInfluencers}
        />

        <CampaignModal
          open={showCampaignForm}
          campaign={campaign}
          errors={campaignErrors}
          imagePreviews={campaignImages.map((item) => item.previewUrl)}
          isPreviewOpen={isPreviewOpen}
          isSubmitting={isSubmittingCampaign}
          isSubmitted={isSubmittedCampaign}
          onClose={closeCampaignForm}
          onSubmit={handleSubmitCampaign}
          onImageUpload={handleImageUpload}
          onCampaignChange={handleCampaignChange}
          onPlatformToggle={togglePlatform}
          onCategoryToggle={toggleCategory}
          onImageRemove={removeImage}
          onTogglePreview={togglePreview}
        />

        <CampaignList campaigns={filteredCampaigns} parseCount={parseCount} />
      </div>
    </section>
  );
}
