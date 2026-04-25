"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./BrandInfluencers.module.css";
import { getAuthSession, resolveApiBaseUrl } from "../../../lib/authStorage";

type InfluencerProfile = {
  _id: string;
  fullName: string;
  email: string;
  profileImage?: string;
  whatsappNumber?: string;
  instagramUsername?: string;
  instagramFollowers?: string;
  engagementRate?: string;
  category?: string;
  niche?: string;
  instagramLink?: string;
  youtubeChannel?: string;
  youtubeSubscribers?: string;
  youtubeLink?: string;
  city?: string;
  district?: string;
  state?: string;
  verificationStatus: "Pending" | "Approved" | "Rejected";
};

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

export default function InfluencersPage() {
  const apiBaseUrl = resolveApiBaseUrl();
  const router = useRouter();
  const [profiles, setProfiles] = useState<InfluencerProfile[]>([]);
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [minAudience, setMinAudience] = useState("");
  const [maxAudience, setMaxAudience] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | null>(null);
  const [shortlistedInfluencers, setShortlistedInfluencers] = useState<ShortlistedInfluencer[]>([]);

  const hasValue = (value?: string) => Boolean(value && value.trim());

  const getPlatformAvailability = (profile: InfluencerProfile) => {
    const hasInstagram =
      hasValue(profile.instagramUsername) || hasValue(profile.instagramFollowers) || hasValue(profile.instagramLink);
    const hasYoutube = hasValue(profile.youtubeChannel) || hasValue(profile.youtubeSubscribers) || hasValue(profile.youtubeLink);

    return { hasInstagram, hasYoutube };
  };

  const toClickableUrl = (url?: string) => {
    if (!url) return "";
    const normalized = url.trim();
    if (!normalized) return "";
    return /^https?:\/\//i.test(normalized) ? normalized : `https://${normalized}`;
  };

  const parseAudienceCount = (raw?: string): number | null => {
    if (!raw || !raw.trim()) return null;

    const value = raw.trim().toLowerCase().replace(/,/g, "").replace(/\s+/g, "");
    const match = value.match(/^(\d+(?:\.\d+)?)([kmb])?\+?$/);
    if (!match) {
      const numeric = Number(value.replace(/[^\d.]/g, ""));
      return Number.isFinite(numeric) ? numeric : null;
    }

    const base = Number(match[1]);
    if (!Number.isFinite(base)) return null;

    const unit = match[2];
    if (unit === "k") return Math.round(base * 1_000);
    if (unit === "m") return Math.round(base * 1_000_000);
    if (unit === "b") return Math.round(base * 1_000_000_000);
    return Math.round(base);
  };

  useEffect(() => {
    const storedShortlist = localStorage.getItem(INFLUENCER_SHORTLIST_STORAGE_KEY);
    if (storedShortlist) {
      try {
        const parsed = JSON.parse(storedShortlist) as ShortlistedInfluencer[];
        if (Array.isArray(parsed)) {
          setShortlistedInfluencers(parsed);
        }
      } catch (error) {
        console.error("Invalid shortlist cache", error);
      }
    }

    const fetchVerifiedProfiles = async () => {
      try {
        const session = getAuthSession("brand");
        const token = session?.token;
        const user = session?.user;

        if (!token || !user || user.role !== "brand") {
          alert("Brand login required");
          router.replace("/brand/login");
          return;
        }

        const res = await axios.get(`${apiBaseUrl}/api/influencers/brand/profiles/verified`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfiles((res.data?.profiles || []).filter((item: InfluencerProfile) => item.verificationStatus === "Approved"));
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          alert(error.response?.data?.message || "Failed to fetch verified influencers");
        } else {
          alert("Failed to fetch verified influencers");
        }
      } finally {
        setLoading(false);
      }
    };

    void fetchVerifiedProfiles();
  }, [router]);

  const filteredProfiles = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    const normalizedCategory = categoryFilter.trim().toLowerCase();
    const minRange = minAudience.trim() ? Number(minAudience) : null;
    const maxRange = maxAudience.trim() ? Number(maxAudience) : null;

    return profiles.filter((profile) => {
      const { hasInstagram, hasYoutube } = getPlatformAvailability(profile);

      const platformMatch =
        selectedPlatform === "instagram"
          ? hasInstagram
          : selectedPlatform === "youtube"
            ? hasYoutube
            : false;

      if (!platformMatch) return false;

      const categoryMatch =
        !normalizedCategory ||
        (profile.category || "").toLowerCase().includes(normalizedCategory);

      const audienceRaw =
        selectedPlatform === "instagram"
          ? profile.instagramFollowers
          : profile.youtubeSubscribers;
      const audienceCount = parseAudienceCount(audienceRaw);
      const hasRangeFilter = minRange !== null || maxRange !== null;

      const minMatch = minRange === null ? true : (audienceCount !== null && audienceCount >= minRange);
      const maxMatch = maxRange === null ? true : (audienceCount !== null && audienceCount <= maxRange);
      const rangeMatch = hasRangeFilter ? minMatch && maxMatch : true;

      if (!categoryMatch || !rangeMatch) return false;
      if (!keyword) return true;

      return (
        profile.fullName.toLowerCase().includes(keyword) ||
        (profile.instagramUsername || "").toLowerCase().includes(keyword) ||
        (profile.instagramFollowers || "").toLowerCase().includes(keyword) ||
        (profile.youtubeChannel || "").toLowerCase().includes(keyword) ||
        (profile.youtubeSubscribers || "").toLowerCase().includes(keyword) ||
        (profile.engagementRate || "").toLowerCase().includes(keyword) ||
        (profile.category || "").toLowerCase().includes(keyword) ||
        (profile.niche || "").toLowerCase().includes(keyword)
      );
    });
  }, [profiles, searchText, categoryFilter, minAudience, maxAudience, selectedPlatform]);

  const instagramCount = useMemo(() => {
    return profiles.filter((profile) => getPlatformAvailability(profile).hasInstagram).length;
  }, [profiles]);

  const youtubeCount = useMemo(() => {
    return profiles.filter((profile) => getPlatformAvailability(profile).hasYoutube).length;
  }, [profiles]);

  const handleAddToShortlist = (profile: InfluencerProfile, platform: PlatformType) => {
    setShortlistedInfluencers((prev) => {
      const exists = prev.some((item) => item.id === profile._id && item.platform === platform);
      if (exists) return prev;

      const next: ShortlistedInfluencer[] = [
        ...prev,
        {
          id: profile._id,
          fullName: profile.fullName,
          email: profile.email,
          profileImage: profile.profileImage,
          whatsappNumber: profile.whatsappNumber,
          category: profile.category,
          niche: profile.niche,
          engagementRate: profile.engagementRate,
          city: profile.city,
          district: profile.district,
          state: profile.state,
          platform,
          instagramUsername: profile.instagramUsername,
          instagramFollowers: profile.instagramFollowers,
          instagramLink: profile.instagramLink,
          youtubeChannel: profile.youtubeChannel,
          youtubeSubscribers: profile.youtubeSubscribers,
          youtubeLink: profile.youtubeLink,
        },
      ];

      localStorage.setItem(INFLUENCER_SHORTLIST_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <main className={styles.page}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Verified Influencers</h1>
        <div className={styles.headerActions}>
          <Link href="/brand/shortlist" className={styles.shortlistNavBtn}>My Shortlist ({shortlistedInfluencers.length})</Link>
          <Link href="/brand/dashboard" className={styles.backBtn}>Back to Dashboard</Link>
        </div>
      </div>

      {loading ? (
        <p className={styles.emptyText}>Loading verified influencers...</p>
      ) : (
        <>
          {!selectedPlatform ? (
            <section className={styles.platformSelector}>
              <button
                type="button"
                className={styles.platformCard}
                onClick={() => setSelectedPlatform("instagram")}
              >
                <span className={styles.platformCardTop}>
                  <img src="/instagram-icon.svg" alt="Instagram" className={styles.platformIcon} />
                  <span className={styles.platformTitle}>Instagram Influencers</span>
                </span>
                <span className={styles.platformCount}>{instagramCount} profiles</span>
              </button>

              <button
                type="button"
                className={styles.platformCard}
                onClick={() => setSelectedPlatform("youtube")}
              >
                <span className={styles.platformCardTop}>
                  <img src="/youtube-icon.svg" alt="YouTube" className={styles.platformIcon} />
                  <span className={styles.platformTitle}>YouTube Influencers</span>
                </span>
                <span className={styles.platformCount}>{youtubeCount} profiles</span>
              </button>
            </section>
          ) : (
            <>
              <div className={styles.platformHeaderRow}>
                <h2 className={styles.platformHeading}>
                  {selectedPlatform === "instagram" ? "Instagram Influencers" : "YouTube Influencers"}
                </h2>
                <button
                  type="button"
                  className={styles.switchPlatformBtn}
                  onClick={() => {
                    setSelectedPlatform(null);
                    setSearchText("");
                    setCategoryFilter("");
                    setMinAudience("");
                    setMaxAudience("");
                  }}
                >
                  Choose Platform
                </button>
              </div>

              <div className={styles.searchBar}>
                <input
                  type="text"
                  value={searchText}
                  placeholder="Search by name, username, followers, category"
                  onChange={(event) => setSearchText(event.target.value)}
                />
              </div>

              <div className={styles.filterRow}>
                <input
                  type="text"
                  value={categoryFilter}
                  placeholder="Filter by category"
                  className={styles.filterInput}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                />

                <input
                  type="number"
                  min="0"
                  value={minAudience}
                  placeholder={selectedPlatform === "instagram" ? "Min followers" : "Min subscribers"}
                  className={styles.filterInput}
                  onChange={(event) => setMinAudience(event.target.value)}
                />

                <input
                  type="number"
                  min="0"
                  value={maxAudience}
                  placeholder={selectedPlatform === "instagram" ? "Max followers" : "Max subscribers"}
                  className={styles.filterInput}
                  onChange={(event) => setMaxAudience(event.target.value)}
                />

                <button
                  type="button"
                  className={styles.clearFilterBtn}
                  onClick={() => {
                    setCategoryFilter("");
                    setMinAudience("");
                    setMaxAudience("");
                  }}
                >
                  Clear Filters
                </button>
              </div>

              {filteredProfiles.length === 0 ? (
                <p className={styles.emptyText}>No {selectedPlatform} influencer found.</p>
              ) : (
                <section className={styles.grid}>
                  {filteredProfiles.map((profile) => {
                    const instagramUrl = toClickableUrl(profile.instagramLink);
                    const youtubeUrl = toClickableUrl(profile.youtubeLink);
                    const showInstagramDetails = selectedPlatform === "instagram";
                    const showYoutubeDetails = selectedPlatform === "youtube";
                    const isCardShortlisted = selectedPlatform
                      ? shortlistedInfluencers.some((item) => item.id === profile._id && item.platform === selectedPlatform)
                      : false;

                    return (
                      <article key={profile._id} className={styles.card}>
                        <div className={styles.topSection}>
                          <img
                            src={profile.profileImage || "/avatar-placeholder.svg"}
                            alt={profile.fullName}
                            className={styles.profileImage}
                          />
                          <span className={styles.platformBadge}>
                            {selectedPlatform === "instagram" ? "Instagram" : "YouTube"}
                          </span>
                          <h2 className={styles.name}>{profile.fullName}</h2>
                        </div>

                        <div className={styles.detailsSection}>
                          {showInstagramDetails && hasValue(profile.instagramUsername) ? (
                            <p className={styles.meta}>
                              <span className={styles.metaLabel}>Insta Username:</span>{" "}
                              <span className={styles.metaValue}>{profile.instagramUsername}</span>
                            </p>
                          ) : null}

                          {showInstagramDetails && hasValue(profile.instagramFollowers) ? (
                            <p className={styles.meta}>
                              <span className={styles.metaLabel}>Followers:</span>{" "}
                              <span className={styles.metaValue}>{profile.instagramFollowers}</span>
                            </p>
                          ) : null}

                          {showInstagramDetails && hasValue(profile.engagementRate) ? (
                            <p className={styles.meta}>
                              <span className={styles.metaLabel}>Engagement Rate:</span>{" "}
                              <span className={styles.metaValue}>{profile.engagementRate}%</span>
                            </p>
                          ) : null}

                          {hasValue(profile.category) ? (
                            <p className={styles.meta}>
                              <span className={styles.metaLabel}>Category:</span>{" "}
                              <span className={styles.metaValue}>{profile.category}</span>
                            </p>
                          ) : null}

                          {hasValue(profile.niche) ? (
                            <p className={styles.meta}>
                              <span className={styles.metaLabel}>Niche:</span>{" "}
                              <span className={styles.metaValue}>{profile.niche}</span>
                            </p>
                          ) : null}

                          {showInstagramDetails && instagramUrl ? (
                            <p className={styles.meta}>
                              <span className={styles.metaLabel}>Insta Link:</span>{" "}
                              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className={styles.metaLink}>
                                {profile.instagramLink}
                              </a>
                            </p>
                          ) : null}

                          {showYoutubeDetails && hasValue(profile.youtubeChannel) ? (
                            <p className={styles.meta}>
                              <span className={styles.metaLabel}>YouTube Channel:</span>{" "}
                              <span className={styles.metaValue}>{profile.youtubeChannel}</span>
                            </p>
                          ) : null}

                          {showYoutubeDetails && hasValue(profile.youtubeSubscribers) ? (
                            <p className={styles.meta}>
                              <span className={styles.metaLabel}>Subscribers:</span>{" "}
                              <span className={styles.metaValue}>{profile.youtubeSubscribers}</span>
                            </p>
                          ) : null}

                          {showYoutubeDetails && youtubeUrl ? (
                            <p className={styles.meta}>
                              <span className={styles.metaLabel}>YouTube Link:</span>{" "}
                              <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className={styles.metaLink}>
                                {profile.youtubeLink}
                              </a>
                            </p>
                          ) : null}

                          {selectedPlatform ? (
                            <button
                              type="button"
                              className={isCardShortlisted ? styles.shortlistBtnActive : styles.shortlistBtn}
                              onClick={() => handleAddToShortlist(profile, selectedPlatform)}
                              disabled={isCardShortlisted}
                            >
                              {isCardShortlisted ? "Shortlisted" : "Shortlist"}
                            </button>
                          ) : null}
                        </div>
                      </article>
                    );
                  })}
                </section>
              )}
            </>
          )}
        </>
      )}
    </main>
  );
}