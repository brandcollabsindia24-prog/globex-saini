"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetchJson } from "../../../../lib/authFetch";
import { getAuthSession } from "../../../../lib/authStorage";
import Notifications from "../components/Notifications";
import { DashboardPayload, EMPTY_DASHBOARD } from "../types";
import PageShell from "../../../../components/PageShell";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<DashboardPayload["notifications"]>([]);
  const [loading, setLoading] = useState(true);

  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || `http://${host}:5000`;

  const loadNotifications = async () => {
    const response = await authFetchJson<{ notifications?: DashboardPayload["notifications"] }>(
      "influencer",
      `${apiBaseUrl}/api/campaigns/influencer/notifications`,
      { method: "GET" }
    );
    setNotifications(response.notifications || []);
  };

  useEffect(() => {
    const session = getAuthSession("influencer");
    if (!session) {
      router.replace("/influencer/login");
      return;
    }

    const load = async () => {
      try {
        await loadNotifications();
      } catch (error) {
        console.error("Failed to load notifications", error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [apiBaseUrl, router]);

  const handleMarkNotificationRead = async (notificationId: string) => {
    try {
      await authFetchJson<{ message?: string }>(
        "influencer",
        `${apiBaseUrl}/api/campaigns/influencer/notifications/${notificationId}/read`,
        { method: "PATCH" }
      );
      await loadNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  return (
    <PageShell title="Notifications" subtitle="Review read and unread alerts from campaigns and payments.">
      {loading ? (
        <p>Loading notifications...</p>
      ) : (
        <Notifications
          dashboard={{ ...EMPTY_DASHBOARD, notifications }}
          onMarkNotificationRead={handleMarkNotificationRead}
        />
      )}
    </PageShell>
  );
}
