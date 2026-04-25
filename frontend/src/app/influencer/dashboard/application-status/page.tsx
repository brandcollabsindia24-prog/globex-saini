"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetchJson } from "../../../../lib/authFetch";
import { getAuthSession } from "../../../../lib/authStorage";
import ApplicationStatus from "../components/ApplicationStatus";
import { DashboardPayload, EMPTY_DASHBOARD } from "../types";
import PageShell from "../../../../components/PageShell";

export default function ApplicationStatusPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardPayload>(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);

  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || `http://${host}:5005`;

  useEffect(() => {
    const session = getAuthSession("influencer");
    if (!session) {
      router.replace("/influencer/login");
      return;
    }

    const load = async () => {
      try {
        const response = await authFetchJson<DashboardPayload>(
          "influencer",
          `${apiBaseUrl}/api/campaigns/influencer/dashboard/advanced`,
          { method: "GET" }
        );
        setDashboard({ ...EMPTY_DASHBOARD, ...response });
      } catch (error) {
        console.error("Failed to load application status", error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [apiBaseUrl, router]);

  return (
    <PageShell title="Campaign Application Status" subtitle="See the current status of every campaign application.">
      {loading ? <p>Loading applications...</p> : <ApplicationStatus dashboard={dashboard} />}
    </PageShell>
  );
}

