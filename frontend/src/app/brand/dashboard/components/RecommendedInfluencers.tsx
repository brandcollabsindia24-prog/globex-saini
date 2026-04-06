"use client";

import { memo } from "react";
import styles from "../Dashboard.module.css";
import { RecommendedInfluencer } from "../types";

type RecommendedInfluencersProps = {
  influencers: RecommendedInfluencer[];
  onOpenExplore: () => void;
};

function RecommendedInfluencers({
  influencers,
  onOpenExplore,
}: RecommendedInfluencersProps) {
  return (
    <div className={styles["recommendation-box"]}>
      <h2>Recommended Influencers</h2>
      <p>Quick shortlist from the dashboard and connect from Explore section.</p>

      <div className={styles["recommendation-grid"]}>
        {influencers.map((person) => {
          const avatarSrc = `https://i.pravatar.cc/160?u=${encodeURIComponent(person.id)}`;

          return (
            <div
              key={person.id}
              className={styles["recommendation-card"]}
              role="button"
              tabIndex={0}
              onClick={onOpenExplore}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onOpenExplore();
                }
              }}
              aria-label={`Open Explore Influencers from ${person.name}`}
            >
              <img src={avatarSrc} alt={person.name} className={styles["recommendation-avatar"]} />
              <h3>{person.name}</h3>
              <p>Niche: {person.niche}</p>
              <p>Followers: {person.followers}</p>
              <p>Avg rate: INR {person.avgRate}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(RecommendedInfluencers);
