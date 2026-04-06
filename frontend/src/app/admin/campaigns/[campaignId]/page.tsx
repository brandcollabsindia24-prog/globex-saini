"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import styles from "../AdminCampaigns.module.css";
import { getAuthSession } from "../../../../lib/authStorage";

type Campaign = {
  _id: string;
  title: string;
  description: string;
  budget: number;
  imageFile?: string;
  category?: string;
  status: "pending" | "active" | "approved" | "completed" | "closed" | "rejected";
  brandId?: {
    _id: string;
    brandName?: string;
    name?: string;
  };
};

function parseDescriptionField(description: string, label: string): string {
  const line = description
    .split("\n")
    .map((entry) => entry.trim())
    .find((entry) => entry.toLowerCase().startsWith(`${label.toLowerCase()}:`));

  if (!line) return "N/A";
  return line.split(":").slice(1).join(":").trim() || "N/A";
}

function parseDescriptionIntro(description: string): string {
  const lines = description
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);

  const firstNonLabel = lines.find((line) => !line.includes(":"));
  return firstNonLabel || lines[0] || "No description provided.";
}

function resolveCampaignImageUrl(image?: string): string {
  if (!image) return "";

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  if (image.startsWith("/")) {
    return `http://localhost:5000${image}`;
  }

  return `http://localhost:5000/uploads/${image}`;
}

export default function AdminCampaignDetailsPage() {
  const router = useRouter();
  const params = useParams<{ campaignId: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const session = getAuthSession("admin");
    const token = session?.token || "";
    const user = session?.user;

    if (!token || !user || user.role !== "admin") {
      router.replace("/admin/auth");
      return;
    }

    const load = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/campaigns", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const campaigns = (response.data?.campaigns || []) as Campaign[];
        setCampaign(campaigns.find((item) => item._id === params.campaignId) || null);
      } catch {
        setCampaign(null);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [params.campaignId, router]);

  const details = useMemo(() => {
    if (!campaign) return null;
    return {
      intro: parseDescriptionIntro(campaign.description),
      platforms: parseDescriptionField(campaign.description, "Platforms"),
      categories:
        campaign.category && campaign.category.trim() !== ""
          ? campaign.category
          : parseDescriptionField(campaign.description, "Categories"),
      website: parseDescriptionField(campaign.description, "Website"),
      instagram: parseDescriptionField(campaign.description, "Instagram Handle"),
      targetAudience: parseDescriptionField(campaign.description, "Target Audience"),
    };
  }, [campaign]);

  const handleDeleteCampaign = async () => {
    const session = getAuthSession("admin");
    const token = session?.token || "";

    if (!token) {
      router.replace("/admin/auth");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this campaign? This action cannot be undone.");
    if (!confirmed) return;

    try {
      setDeleting(true);
      await axios.delete(`http://localhost:5000/api/admin/campaigns/${params.campaignId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      router.replace("/admin/campaigns");
    } catch (error) {
      window.alert("Failed to delete campaign. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <p className={styles.emptyText}>Loading campaign details...</p>;
  }

  if (!campaign || !details) {
    return (
      <main className={styles.campaignsPage}>
        <div className={styles.adminDetailShell}>
          <button type="button" className={styles.adminBackBtn} onClick={() => router.back()}>
            <span>{"<"}</span> Back
          </button>
          <p className={styles.emptyText}>Campaign not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.campaignsPage}>
      <div className={styles.adminDetailShell}>
        <button type="button" className={styles.adminBackBtn} onClick={() => router.back()}>
          <span>{"<"}</span> Back
        </button>

        <article className={styles.adminDetailCard}>
          {campaign.imageFile ? (
            <img
              src={resolveCampaignImageUrl(campaign.imageFile)}
              alt={campaign.title}
              className={styles.adminDetailImage}
            />
          ) : null}

          <section className={styles.adminDetailSection}>
            <p><span>Title:</span> {campaign.title}</p>
            <p><span>Brand Name:</span> {campaign.brandId?.brandName || campaign.brandId?.name || "N/A"}</p>
            <p><span>Budget:</span> INR {campaign.budget}</p> <br />
            <p><span>Description:</span> {details.intro}</p>
            <p>
              <span>Website:</span>{" "}
              {details.website !== "N/A" ? (
                <a href={details.website.startsWith("http") ? details.website : `https://${details.website}`} target="_blank" rel="noreferrer">
                  {details.website}
                </a>
              ) : (
                "N/A"
              )}
            </p>
            <p>
              <span>Insta Link:</span>{" "}
              {details.instagram !== "N/A" ? (
                <a
                  href={details.instagram.startsWith("http") ? details.instagram : `https://instagram.com/${details.instagram.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {details.instagram}
                </a>
              ) : (
                "N/A"
              )}
            </p>
            <p><span>Categories:</span> {details.categories}</p>
            <p><span>Platform:</span> {details.platforms}</p>
            <p><span>Target Audience:</span> {details.targetAudience}</p>
          </section>

          <div className={styles.adminDetailActions}>
            <button
              type="button"
              className={styles.adminDeleteBtn}
              onClick={handleDeleteCampaign}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Campaign"}
            </button>
          </div>
        </article>
      </div>
    </main>
  );
}
