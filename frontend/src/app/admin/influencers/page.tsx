"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./AdminInfluencers.module.css";
import { getAuthSession } from "../../../lib/authStorage";

type InfluencerProfile = {
  _id: string;
  fullName: string;
  email: string;
  whatsappNumber?: string;
  instagramUsername?: string;
  instagramFollowers?: string;
  engagementRate?: string;
  category?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  verificationStatus: "Pending" | "Approved" | "Rejected";
};

export default function AdminInfluencersPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<InfluencerProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<InfluencerProfile[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "Pending" | "Approved" | "Rejected">("Pending");
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const runFilter = (inputProfiles: InfluencerProfile[], nextStatus: "all" | "Pending" | "Approved" | "Rejected", nextSearch: string) => {
    const keyword = nextSearch.trim().toLowerCase();
    const next = inputProfiles.filter((profile) => {
      const statusMatched = nextStatus === "all" ? true : profile.verificationStatus === nextStatus;
      const searchMatched = keyword
        ? profile.fullName.toLowerCase().includes(keyword) ||
          profile.email.toLowerCase().includes(keyword) ||
          (profile.instagramUsername || "").toLowerCase().includes(keyword)
        : true;
      return statusMatched && searchMatched;
    });
    setFilteredProfiles(next);
  };

  const fetchProfiles = async (status: string) => {
    try {
      const session = getAuthSession("admin");
      const token = session?.token;
      const user = session?.user;

      if (!token || !user || user.role !== "admin") {
        alert("Admin login required");
        router.replace("/admin/auth");
        return;
      }

      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/influencers/admin/profiles?status=${status}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const nextProfiles = res.data?.profiles || [];
      setProfiles(nextProfiles);
      runFilter(nextProfiles, status as "all" | "Pending" | "Approved" | "Rejected", appliedSearch);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Failed to load influencer profiles");
      } else {
        alert("Failed to load influencer profiles");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (profileId: string, verificationStatus: "Approved" | "Rejected" | "Pending") => {
    try {
      const token = getAuthSession("admin")?.token;

      if (!token) {
        router.replace("/admin/auth");
        return;
      }

      await axios.patch(
        `http://localhost:5000/api/influencers/admin/profiles/${profileId}/verification-status`,
        { verificationStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfiles((prev) => prev.filter((item) => item._id !== profileId));
      alert(`Profile ${verificationStatus}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Failed to update status");
      } else {
        alert("Failed to update status");
      }
    }
  };

  useEffect(() => {
    void fetchProfiles(statusFilter);
  }, [statusFilter]);

  const handleSearch = () => {
    setAppliedSearch(searchInput);
    runFilter(profiles, statusFilter, searchInput);
  };

  const getStatusClassName = (status: "Pending" | "Approved" | "Rejected") => {
    if (status === "Approved") return `${styles.statusBtn} ${styles.statusActive}`;
    if (status === "Rejected") return `${styles.statusBtn} ${styles.statusCompleted}`;
    return `${styles.statusBtn} ${styles.statusPending}`;
  };

  return (
    <main className={styles.influencersPage}>
      <h1 className={styles.pageTitle}>Influencers Page</h1>

      <div className={styles.topBar}>
        <div className={styles.filterButtons}>
          <button
            className={statusFilter === "all" ? styles.active : ""}
            onClick={() => setStatusFilter("all")}
          >
            All
          </button>
          <button
            className={statusFilter === "Pending" ? styles.active : ""}
            onClick={() => setStatusFilter("Pending")}
          >
            Pending
          </button>
          <button
            className={statusFilter === "Approved" ? styles.active : ""}
            onClick={() => setStatusFilter("Approved")}
          >
            Approved
          </button>
          <button
            className={statusFilter === "Rejected" ? styles.active : ""}
            onClick={() => setStatusFilter("Rejected")}
          >
            Rejected
          </button>
          <Link href="/admin/dashboard">
            <button>Back</button>
          </Link>
        </div>

        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search influencer"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSearch();
            }}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
      </div>

      {loading ? (
        <p className={styles.emptyText}>Loading profiles...</p>
      ) : filteredProfiles.length === 0 ? (
        <p className={styles.emptyText}>No profiles found for selected status/search.</p>
      ) : (
        <div className={styles.adminInfluencerGrid}>
          {filteredProfiles.map((profile) => (
            <article key={profile._id} className={styles.adminInfluencerCard}>
              <button className={getStatusClassName(profile.verificationStatus)}>{profile.verificationStatus}</button>
              <h2 className={styles.adminInfluencerName}>{profile.fullName}</h2>
              <p className={styles.adminInfluencerText}>Email: {profile.email}</p>
              <p className={styles.adminInfluencerText}>WhatsApp: {profile.whatsappNumber || "N/A"}</p>
              <p className={styles.adminInfluencerText}>Instagram: {profile.instagramUsername || "N/A"}</p>
              <p className={styles.adminInfluencerText}>Followers: {profile.instagramFollowers || "N/A"}</p>
              <p className={styles.adminInfluencerText}>Engagement: {profile.engagementRate || "N/A"}%</p>
              <p className={styles.adminInfluencerText}>Category: {profile.category || "N/A"}</p>
              <p className={styles.adminInfluencerText}>
                Address: {[profile.city, profile.district, profile.state, profile.pincode].filter(Boolean).join(", ") || "N/A"}
              </p>

              <div className={styles.adminActions}>
                <button
                  onClick={() => void updateStatus(profile._id, "Approved")}
                  className={styles.approveBtn}
                >
                  Approve
                </button>
                <button
                  onClick={() => void updateStatus(profile._id, "Rejected")}
                  className={styles.rejectBtn}
                >
                  Reject
                </button>
                {profile.verificationStatus !== "Pending" && (
                  <button
                    onClick={() => void updateStatus(profile._id, "Pending")}
                    className={styles.pendingBtn}
                  >
                    Mark Pending
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
