"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./AdminBrands.module.css";
import { getAuthSession } from "../../../lib/authStorage";

type Brand = {
  _id: string;
  brandName?: string;
  name?: string;
  email: string;
  contactNumber?: string;
  phone?: string;
};

type Campaign = {
  _id: string;
  status: "pending" | "active" | "approved" | "completed" | "closed";
  brandId?: {
    _id?: string;
  };
};

type BrandCard = {
  brand: Brand;
  pendingCount: number;
  activeCount: number;
  completedCount: number;
  totalCampaigns: number;
  derivedStatus: "pending" | "active" | "completed";
};

export default function AdminBrandsPage() {
  const router = useRouter();
  const [brandCards, setBrandCards] = useState<BrandCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<BrandCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "active" | "completed">("all");
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const runFilter = (
    cards: BrandCard[],
    nextStatus: "all" | "pending" | "active" | "completed",
    nextSearch: string
  ) => {
    const keyword = nextSearch.trim().toLowerCase();
    const next = cards.filter((item) => {
      const statusMatched = nextStatus === "all" ? true : item.derivedStatus === nextStatus;
      const brandName = item.brand.brandName || item.brand.name || "Unknown Brand";
      const searchMatched = keyword
        ? brandName.toLowerCase().includes(keyword) || item.brand.email.toLowerCase().includes(keyword)
        : true;
      return statusMatched && searchMatched;
    });
    setFilteredCards(next);
  };

  useEffect(() => {
    const session = getAuthSession("admin");
    const token = session?.token;
    const user = session?.user;

    if (!token || !user || user.role !== "admin") {
      router.replace("/admin/auth");
      return;
    }

    const fetchBrands = async () => {
      try {
        const [brandsResponse, campaignsResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/admin/brands", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/admin/campaigns", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const brands: Brand[] = brandsResponse.data?.brands || [];
        const campaigns: Campaign[] = campaignsResponse.data?.campaigns || [];

        const nextCards: BrandCard[] = brands.map((brand) => {
          const brandCampaigns = campaigns.filter(
            (campaign) => campaign.brandId?._id && campaign.brandId._id === brand._id
          );

          const pendingCount = brandCampaigns.filter((campaign) => campaign.status === "pending").length;
          const activeCount = brandCampaigns.filter(
            (campaign) => campaign.status === "active" || campaign.status === "approved"
          ).length;
          const completedCount = brandCampaigns.filter(
            (campaign) => campaign.status === "completed" || campaign.status === "closed"
          ).length;

          let derivedStatus: "pending" | "active" | "completed" = "pending";
          if (completedCount > 0 && activeCount === 0 && pendingCount === 0) {
            derivedStatus = "completed";
          } else if (activeCount > 0) {
            derivedStatus = "active";
          }

          return {
            brand,
            pendingCount,
            activeCount,
            completedCount,
            totalCampaigns: brandCampaigns.length,
            derivedStatus,
          };
        });

        setBrandCards(nextCards);
        runFilter(nextCards, "all", "");
      } catch (error) {
        alert("Failed to load brands");
      } finally {
        setLoading(false);
      }
    };

    void fetchBrands();
  }, [router]);

  const handleStatusFilter = (nextStatus: "all" | "pending" | "active" | "completed") => {
    setStatusFilter(nextStatus);
    runFilter(brandCards, nextStatus, appliedSearch);
  };

  const handleSearch = () => {
    setAppliedSearch(searchInput);
    runFilter(brandCards, statusFilter, searchInput);
  };

  const getStatusClassName = (status: "pending" | "active" | "completed") => {
    if (status === "active") {
      return `${styles.statusBtn} ${styles.statusActive}`;
    }
    if (status === "completed") {
      return `${styles.statusBtn} ${styles.statusCompleted}`;
    }
    return `${styles.statusBtn} ${styles.statusPending}`;
  };

  const getStatusLabel = (status: "pending" | "active" | "completed") => {
    if (status === "active") return "ACTIVE";
    if (status === "completed") return "COMPLETED";
    return "PENDING";
  };

  return (
    <main className={styles.brandsPage}>
      <h1 className={styles.pageTitle}>Brands Page</h1>

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
          <Link href="/admin/dashboard">
            <button>Back</button>
          </Link>
        </div>

        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search brand name or email"
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
          <p className={styles.emptyText}>Loading brands...</p>
        ) : filteredCards.length === 0 ? (
          <p className={styles.emptyText}>No brands found for selected filter/search.</p>
        ) : (
          <div className={styles.adminCampaignGrid}>
            {filteredCards.map((item) => {
              const brandName = item.brand.brandName || item.brand.name || "Unknown Brand";

              return (
                <article key={item.brand._id} className={styles.adminCampaignCard}>
                  <button className={getStatusClassName(item.derivedStatus)}>
                    {getStatusLabel(item.derivedStatus)}
                  </button>

                  <h2 className={styles.cardTitle}>{brandName}</h2>
                  <p className={styles.cardText}>Email: {item.brand.email}</p>
                  <p className={styles.cardText}>
                    Contact: {item.brand.contactNumber || item.brand.phone || "N/A"}
                  </p>
                  <p className={styles.cardText}>Total Campaigns: {item.totalCampaigns}</p>
                  <p className={styles.cardText}>Pending: {item.pendingCount}</p>
                  <p className={styles.cardText}>Active: {item.activeCount}</p>
                  <p className={styles.cardText}>Completed: {item.completedCount}</p>
                </article>
              );
            })}
          </div>
        )}
    </main>
  );
}
