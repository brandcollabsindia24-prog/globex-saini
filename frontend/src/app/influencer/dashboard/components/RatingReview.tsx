"use client";

import { FormEvent } from "react";
import styles from "../InfluencerDashboard.module.css";
import { DashboardPayload } from "../types";

type RatingReviewProps = {
  dashboard: DashboardPayload;
  selectedReviewAppId: string;
  reviewRating: string;
  reviewText: string;
  setSelectedReviewAppId: (value: string) => void;
  setReviewRating: (value: string) => void;
  setReviewText: (value: string) => void;
  onSubmitReview: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export default function RatingReview({
  dashboard,
  selectedReviewAppId,
  reviewRating,
  reviewText,
  setSelectedReviewAppId,
  setReviewRating,
  setReviewText,
  onSubmitReview,
}: RatingReviewProps) {
  return (
    <section id="rating-review-section" className={styles.brandCards}>
      <h2>Rating and Review</h2>
      <form className={styles.card} onSubmit={onSubmitReview}>
        <select
          className="w-full border rounded px-3 py-2"
          value={selectedReviewAppId}
          onChange={(event) => setSelectedReviewAppId(event.target.value)}
        >
          <option value="">Select completed campaign</option>
          {dashboard.applications
            .filter((item) => item.status === "completed")
            .map((item) => (
              <option key={item._id} value={item._id}>
                {item.campaignId?.title || "Campaign"}
              </option>
            ))}
        </select>
        <input
          className="w-full border rounded px-3 py-2 mt-2"
          placeholder="Rating 1-5"
          value={reviewRating}
          onChange={(event) => setReviewRating(event.target.value)}
        />
        <textarea
          className="w-full border rounded px-3 py-2 mt-2"
          placeholder="Write your review"
          value={reviewText}
          onChange={(event) => setReviewText(event.target.value)}
        />
        <button className="mt-3 bg-slate-900 text-white px-4 py-2 rounded" type="submit">
          Submit review
        </button>
      </form>
    </section>
  );
}
