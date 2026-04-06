"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./AdminDashboard.module.css";
import { getAuthSession } from "../../../lib/authStorage";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [totalBrands, setTotalBrands] = useState(0);
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [totalApproved, setTotalApproved] = useState(0);
  const [totalRejected, setTotalRejected] = useState(0);
  const [totalContacts, setTotalContacts] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = getAuthSession("admin");
    if (!session) {
      alert("Please login as admin first");
      router.replace("/admin/auth");
      return;
    }

    const user = session.user;
    if (user.role !== "admin") {
      alert("Admin access required");
      router.replace("/admin/auth");
      return;
    }

    void fetchDashboardCounts(session.token);
  }, [router]);

  const fetchDashboardCounts = async (authToken: string) => {
    try {
      setLoading(true);
      const [brandsRes, campaignsRes, profilesRes, contactsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/brands", {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        axios.get("http://localhost:5000/api/admin/campaigns", {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        axios.get("http://localhost:5000/api/admin/influencer-profiles", {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        axios.get("http://localhost:5000/api/admin/contacts", {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
      ]);

      setTotalBrands(brandsRes.data?.totalBrands || 0);
      setTotalCampaigns(campaignsRes.data?.totalCampaigns || 0);
      setTotalPending(profilesRes.data?.totalPending || 0);
      setTotalApproved(profilesRes.data?.totalApproved || 0);
      setTotalRejected(profilesRes.data?.totalRejected || 0);
      setTotalContacts(contactsRes.data?.totalContacts || 0);
    } catch (error) {
      console.error("Failed to fetch dashboard counts", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.adminDashboard}>
      <div className={styles.adminContainer}>
        <header className="mb-10">
          <h1 className={styles.adminTitle}>Admin Dashboard</h1>
          <p className={styles.adminSectionTitle}>4 cards par click karke alag-alag admin pages open karein.</p>
        </header>

        {loading ? <p className={styles.loadingText}>Loading...</p> : null}

        <div className={styles.adminCampaignGrid}>
          <Link href="/admin/brands" className={styles.adminCampaignCard}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.adminCampaignTitle}>Brands</h2>
                <p className={styles.adminCount}>{totalBrands}</p>
                <p className={styles.adminText}>View all registered brands</p>
              </div>
              <div className={`${styles.cardIcon} ${styles.cardIconBlue}`}>B</div>
            </div>
          </Link>

          <Link href="/admin/campaigns" className={styles.adminCampaignCard}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.adminCampaignTitle}>Campaigns</h2>
                <p className={styles.adminCount}>{totalCampaigns}</p>
                <p className={styles.adminText}>Manage and review campaigns</p>
              </div>
              <div className={`${styles.cardIcon} ${styles.cardIconGreen}`}>C</div>
            </div>
          </Link>

          <Link href="/admin/influencers" className={styles.adminCampaignCard}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.adminCampaignTitle}>Influencers</h2>
                <p className={styles.adminCount}>{totalPending + totalApproved + totalRejected}</p>
                <p className={styles.adminText}>Verification and profile status</p>
              </div>
              <div className={`${styles.cardIcon} ${styles.cardIconPurple}`}>I</div>
            </div>
          </Link>

          <Link href="/admin/contacts" className={styles.adminCampaignCard}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.adminCampaignTitle}>Contacts</h2>
                <p className={styles.adminCount}>{totalContacts}</p>
                <p className={styles.adminText}>Contact form submissions</p>
              </div>
              <div className={`${styles.cardIcon} ${styles.cardIconAmber}`}>M</div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
