"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Shortlist.module.css";

type PlatformType = "instagram" | "youtube";

type ShortlistedInfluencer = {
  id: string;
  fullName: string;
  email: string;
  profileImage?: string;
  whatsappNumber?: string;
  category?: string;
  niche?: string;
  engagementRate?: string;
  city?: string;
  district?: string;
  state?: string;
  platform: PlatformType;
  instagramUsername?: string;
  instagramFollowers?: string;
  instagramLink?: string;
  youtubeChannel?: string;
  youtubeSubscribers?: string;
  youtubeLink?: string;
};

const INFLUENCER_SHORTLIST_STORAGE_KEY = "brandInfluencerShortlist";

export default function BrandShortlistPage() {
  const [shortlist, setShortlist] = useState<ShortlistedInfluencer[]>([]);

  const toClickableUrl = (url?: string) => {
    if (!url) return "";
    const normalized = url.trim();
    if (!normalized) return "";
    return /^https?:\/\//i.test(normalized) ? normalized : `https://${normalized}`;
  };

  useEffect(() => {
    const raw = localStorage.getItem(INFLUENCER_SHORTLIST_STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as ShortlistedInfluencer[];
      if (Array.isArray(parsed)) {
        setShortlist(parsed);
      }
    } catch (error) {
      console.error("Invalid shortlist data", error);
    }
  }, []);

  const removeFromShortlist = (id: string, platform: PlatformType) => {
    setShortlist((prev) => {
      const next = prev.filter((item) => !(item.id === id && item.platform === platform));
      localStorage.setItem(INFLUENCER_SHORTLIST_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <main className={styles.page}>
      <header className={styles.headerRow}>
        <h1 className={styles.title}>My Shortlist</h1>
        <div className={styles.navActions}>
          <span className={styles.countBadge}>Total: {shortlist.length}</span>
          <Link href="/brand/influencers" className={styles.backBtn}>Explore Influencers</Link>
          <Link href="/brand/dashboard" className={styles.backBtn}>Back to Dashboard</Link>
        </div>
      </header>

      {shortlist.length === 0 ? (
        <p className={styles.emptyText}>No shortlisted influencers yet.</p>
      ) : (
        <section className={styles.grid}>
          {shortlist.map((item) => {
            const platformLabel = item.platform === "instagram" ? "Instagram" : "YouTube";
            const instagramUrl = toClickableUrl(item.instagramLink);
            const youtubeUrl = toClickableUrl(item.youtubeLink);

            return (
              <article key={`${item.id}-${item.platform}`} className={styles.card}>
                <div className={styles.topSection}>
                  <img
                    src={item.profileImage || "/avatar-placeholder.svg"}
                    alt={item.fullName}
                    className={styles.profileImage}
                  />
                  <span className={styles.platformBadge}>{platformLabel}</span>
                  <h2 className={styles.name}>{item.fullName}</h2>
                </div>

                <div className={styles.detailsSection}>
                  {item.category ? (
                    <p className={styles.meta}><span className={styles.metaLabel}>Category:</span> {item.category}</p>
                  ) : null}

                  {item.niche ? (
                    <p className={styles.meta}><span className={styles.metaLabel}>Niche:</span> {item.niche}</p>
                  ) : null}

                  {item.platform === "instagram" && item.instagramUsername ? (
                    <p className={styles.meta}><span className={styles.metaLabel}>Insta Username:</span> {item.instagramUsername}</p>
                  ) : null}

                  {item.platform === "instagram" && item.instagramFollowers ? (
                    <p className={styles.meta}><span className={styles.metaLabel}>Followers:</span> {item.instagramFollowers}</p>
                  ) : null}

                  {item.platform === "instagram" && item.engagementRate ? (
                    <p className={styles.meta}><span className={styles.metaLabel}>Engagement Rate:</span> {item.engagementRate}%</p>
                  ) : null}

                  {item.platform === "instagram" && instagramUrl ? (
                    <p className={styles.meta}>
                      <span className={styles.metaLabel}>Insta Link:</span>{" "}
                      <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className={styles.metaLink}>
                        {item.instagramLink}
                      </a>
                    </p>
                  ) : null}

                  {item.platform === "youtube" && item.youtubeChannel ? (
                    <p className={styles.meta}><span className={styles.metaLabel}>YouTube Channel:</span> {item.youtubeChannel}</p>
                  ) : null}

                  {item.platform === "youtube" && item.youtubeSubscribers ? (
                    <p className={styles.meta}><span className={styles.metaLabel}>Subscribers:</span> {item.youtubeSubscribers}</p>
                  ) : null}

                  {item.platform === "youtube" && youtubeUrl ? (
                    <p className={styles.meta}>
                      <span className={styles.metaLabel}>YouTube Link:</span>{" "}
                      <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className={styles.metaLink}>
                        {item.youtubeLink}
                      </a>
                    </p>
                  ) : null}

                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeFromShortlist(item.id, item.platform)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
