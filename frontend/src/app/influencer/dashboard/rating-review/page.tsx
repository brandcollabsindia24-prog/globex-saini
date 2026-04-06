"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetchJson } from "../../../../lib/authFetch";
import { getAuthSession } from "../../../../lib/authStorage";
import RatingReview from "../components/RatingReview";
import { DashboardPayload, EMPTY_DASHBOARD } from "../types";
import PageShell from "../../../../components/PageShell";

export default function RatingReviewPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<DashboardPayload["applications"]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReviewAppId, setSelectedReviewAppId] = useState("");
  const [reviewRating, setReviewRating] = useState("5");
  const [reviewText, setReviewText] = useState("");

  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || `http://${host}:5000`;

  const loadApplications = async () => {
    const response = await authFetchJson<{ applications?: DashboardPayload["applications"] }>(
      "influencer",
      `${apiBaseUrl}/api/campaigns/influencer/applications`,
      { method: "GET" }
    );
    setApplications(response.applications || []);
  };

  useEffect(() => {
    const session = getAuthSession("influencer");
    if (!session) {
      router.replace("/influencer/login");
      return;
    }

    const load = async () => {
      try {
        await loadApplications();
      } catch (error) {
        console.error("Failed to load applications", error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [apiBaseUrl, router]);

  const onSubmitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedReviewAppId) return;

    try {
      await authFetchJson<{ message?: string }>(
        "influencer",
        `${apiBaseUrl}/api/campaigns/influencer/applications/${selectedReviewAppId}/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rating: Number(reviewRating),
            review: reviewText,
          }),
        }
      );

      setReviewText("");
      setReviewRating("5");
      setSelectedReviewAppId("");
      await loadApplications();
      alert("Review submitted.");
    } catch (error) {
      console.error("Failed to submit review", error);
      alert("Unable to submit review.");
    }
  };

  return (
    <PageShell title="Rating and Review" subtitle="Submit feedback after a campaign is completed.">
      {loading ? (
        <p>Loading reviews...</p>
      ) : (
        <RatingReview
          dashboard={{ ...EMPTY_DASHBOARD, applications }}
          selectedReviewAppId={selectedReviewAppId}
          reviewRating={reviewRating}
          reviewText={reviewText}
          setSelectedReviewAppId={setSelectedReviewAppId}
          setReviewRating={setReviewRating}
          setReviewText={setReviewText}
          onSubmitReview={onSubmitReview}
        />
      )}
    </PageShell>
  );
}