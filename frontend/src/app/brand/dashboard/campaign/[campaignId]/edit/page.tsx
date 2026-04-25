"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import styles from "../../../Dashboard.module.css";
import { Campaign, CampaignForm } from "../../../types";
import { getAuthSession } from "../../../../../../lib/authStorage";
import CampaignModal from "../../../components/CampaignModal";

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

type UploadedCampaignImage = {
  file: File | null;
  previewUrl: string;
};

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

function resolveApiBaseUrl(): string {
  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
  return process.env.NEXT_PUBLIC_API_BASE_URL || `http://${host}:5005`;
}

function normalizeWebsiteUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function normalizeStatus(status: string | undefined): string {
  return (status || "").trim().toLowerCase();
}

function parseDescriptionFields(description: string): Partial<CampaignForm> {
  const lines = description.split("\n").map((line) => line.trim()).filter(Boolean);
  const parsed: Partial<CampaignForm> = {
    platforms: [],
    categories: [],
  };

  lines.forEach((line) => {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) return;

    const key = line.slice(0, separatorIndex).trim().toLowerCase();
    const value = line.slice(separatorIndex + 1).trim();

    if (key === "brand name") parsed.brandName = value;
    if (key === "platforms") parsed.platforms = value.split(",").map((item) => item.trim()).filter(Boolean);
    if (key === "website") parsed.websiteLink = value;
    if (key === "instagram handle") parsed.instagramHandle = value;
    if (key === "categories") parsed.categories = value.split(",").map((item) => item.trim()).filter(Boolean);

    if (key === "target audience") {
      const [gender, followersRange] = value.split("|").map((item) => item.trim());
      parsed.targetGender = gender || "";
      parsed.followersRange = followersRange || "";
    }
  });

  return parsed;
}

function buildCompiledDescription(campaign: CampaignForm): string {
  return [
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
}

export default function EditCampaignPage() {
  const params = useParams<{ campaignId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [campaignRecord, setCampaignRecord] = useState<Campaign | null>(null);
  const [campaign, setCampaign] = useState<CampaignForm>(EMPTY_CAMPAIGN);
  const [campaignImages, setCampaignImages] = useState<UploadedCampaignImage[]>([]);
  const [campaignErrors, setCampaignErrors] = useState<CampaignFormErrors>({});

  useEffect(() => {
    const session = getAuthSession("brand");
    const token = session?.token || "";

    if (!token) {
      router.replace("/brand/login");
      return;
    }

    const loadCampaign = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${resolveApiBaseUrl()}/api/campaigns/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const allCampaigns = (response.data?.campaigns || []) as Campaign[];
        const selected = allCampaigns.find((item) => item._id === params.campaignId) || null;
        setCampaignRecord(selected);

        if (!selected) return;

        const parsed = parseDescriptionFields(selected.description || "");
        setCampaign({
          title: selected.title || "",
          brandName: parsed.brandName || "",
          budget: String(selected.budget || ""),
          numberOfInfluencers: "",
          pricePerInfluencer: "",
          description: selected.description || "",
          timeline: selected.timeline || "Flexible timeline",
          platforms: parsed.platforms || [],
          websiteLink: parsed.websiteLink || "",
          instagramHandle: parsed.instagramHandle || "",
          categories: parsed.categories || [],
          targetGender: parsed.targetGender || "",
          followersRange: parsed.followersRange || "",
        });

        if (selected.imageFile) {
          setCampaignImages([{ file: null, previewUrl: selected.imageFile }]);
        }
      } catch (error) {
        console.error("Failed to load campaign:", error);
        setCampaignRecord(null);
      } finally {
        setLoading(false);
      }
    };

    void loadCampaign();
  }, [params.campaignId, router]);

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

  const onCampaignChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const onPlatformToggle = useCallback((platform: string) => {
    setCampaign((prev) => {
      const exists = prev.platforms.includes(platform);
      const platforms = exists ? prev.platforms.filter((item) => item !== platform) : [...prev.platforms, platform];
      return { ...prev, platforms };
    });

    setCampaignErrors((prev) => {
      const { platforms, ...rest } = prev;
      return platforms ? rest : prev;
    });
  }, []);

  const onCategoryToggle = useCallback((category: string) => {
    setCampaign((prev) => {
      const exists = prev.categories.includes(category);
      const categories = exists ? prev.categories.filter((item) => item !== category) : [...prev.categories, category];
      return { ...prev, categories };
    });

    setCampaignErrors((prev) => {
      const { categories, ...rest } = prev;
      return categories ? rest : prev;
    });
  }, []);

  const onImageUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    setCampaignImages((prev) => {
      const remaining = 3 - prev.length;
      if (remaining <= 0) {
        setCampaignErrors((current) => ({ ...current, images: "You can upload maximum 3 images" }));
        return prev;
      }

      const accepted = selectedFiles.slice(0, remaining).map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      if (selectedFiles.length > remaining) {
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

  const onImageRemove = useCallback((index: number) => {
    setCampaignImages((prev) => {
      const item = prev[index];
      if (item?.file) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((_, imageIndex) => imageIndex !== index);
    });
  }, []);

  const onTogglePreview = useCallback(() => {
    setIsPreviewOpen((prev) => !prev);
  }, []);

  const onClose = useCallback(() => {
    router.push("/brand/campaign/my-campaigns");
  }, [router]);

  const onSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateCampaign(campaign, campaignImages);
    if (Object.keys(validationErrors).length > 0) {
      setCampaignErrors(validationErrors);
      setIsPreviewOpen(false);
      return;
    }

    const session = getAuthSession("brand");
    const token = session?.token || "";
    if (!token || !campaignRecord) {
      router.replace("/brand/login");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("title", campaign.title);
      formData.append("budget", campaign.budget);
      formData.append("description", buildCompiledDescription(campaign));
      formData.append("timeline", campaign.timeline.trim() || "Flexible timeline");
      formData.append("category", campaign.categories.join(", "));
      formData.append("websiteLink", normalizeWebsiteUrl(campaign.websiteLink));

      const newImage = campaignImages.find((item) => item.file)?.file;
      if (newImage) {
        formData.append("image", newImage);
      }

      await axios.patch(`${resolveApiBaseUrl()}/api/campaigns/${campaignRecord._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Campaign updated successfully!");
      router.push("/brand/campaign/my-campaigns");
    } catch (error) {
      console.error("Update campaign error:", error);
      alert("Failed to update campaign");
    } finally {
      setIsSubmitting(false);
    }
  }, [campaign, campaignImages, campaignRecord, router, validateCampaign]);

  if (loading) {
    return <p className={styles["details-loading"]}>Loading campaign...</p>;
  }

  if (!campaignRecord) {
    return (
      <section className={styles["campaign-detail-page"]}>
        <div className={styles["campaign-detail-shell"]}>
          <button type="button" className={styles["back-arrow-btn"]} onClick={() => router.push("/brand/campaign/my-campaigns") }>
            <span>{"<"}</span> Back
          </button>
          <p className={styles["details-loading"]}>Campaign not found.</p>
        </div>
      </section>
    );
  }

  if (!["pending", "review"].includes(normalizeStatus(campaignRecord.status))) {
    return (
      <section className={styles["campaign-detail-page"]}>
        <div className={styles["campaign-detail-shell"]}>
          <button type="button" className={styles["back-arrow-btn"]} onClick={() => router.push("/brand/campaign/my-campaigns") }>
            <span>{"<"}</span> Back
          </button>
          <p className={styles["details-loading"]}>Only pending campaigns can be edited.</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <CampaignModal
        open
        campaign={campaign}
        errors={campaignErrors}
        imagePreviews={campaignImages.map((item) => item.previewUrl)}
        isPreviewOpen={isPreviewOpen}
        isSubmitting={isSubmitting}
        title="Edit Campaign"
        subtitle="Update your campaign with the same form as Create Campaign."
        submitLabel="Update Campaign"
        onClose={onClose}
        onSubmit={onSubmit}
        onImageUpload={onImageUpload}
        onCampaignChange={onCampaignChange}
        onPlatformToggle={onPlatformToggle}
        onCategoryToggle={onCategoryToggle}
        onImageRemove={onImageRemove}
        onTogglePreview={onTogglePreview}
      />
    </section>
  );
}
