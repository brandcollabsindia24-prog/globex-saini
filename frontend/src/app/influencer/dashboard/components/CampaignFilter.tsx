"use client";

import styles from "../InfluencerDashboard.module.css";

type CampaignFilterProps = {
  categoryFilter: string;
  minBudgetFilter: string;
  maxBudgetFilter: string;
  followersFilter: string;
  setCategoryFilter: (value: string) => void;
  setMinBudgetFilter: (value: string) => void;
  setMaxBudgetFilter: (value: string) => void;
  setFollowersFilter: (value: string) => void;
  onSearch: () => void;
};

export default function CampaignFilter({
  categoryFilter,
  minBudgetFilter,
  maxBudgetFilter,
  followersFilter,
  setCategoryFilter,
  setMinBudgetFilter,
  setMaxBudgetFilter,
  setFollowersFilter,
  onSearch,
}: CampaignFilterProps) {
  return (
    <section id="campaign-filter-section" className={styles.brandCards}>
      <h2>Smart Campaign Filter</h2>
      <form
        className={`${styles.card} flex flex-nowrap gap-2 overflow-x-auto`}
        onSubmit={(event) => {
          event.preventDefault();
          onSearch();
        }}
      >
        <input
          className="min-w-[150px] flex-1 border rounded px-2 py-1.5 text-sm"
          placeholder="Category"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
        />
        <input
          className="min-w-[150px] flex-1 border rounded px-2 py-1.5 text-sm"
          placeholder="Min budget"
          value={minBudgetFilter}
          onChange={(event) => setMinBudgetFilter(event.target.value)}
        />
        <input
          className="min-w-[150px] flex-1 border rounded px-2 py-1.5 text-sm"
          placeholder="Max budget"
          value={maxBudgetFilter}
          onChange={(event) => setMaxBudgetFilter(event.target.value)}
        />
        <input
          className="min-w-[150px] flex-1 border rounded px-2 py-1.5 text-sm"
          placeholder="Your followers"
          value={followersFilter}
          onChange={(event) => setFollowersFilter(event.target.value)}
        />
        <button type="submit" className="min-w-[110px] rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          Search
        </button>
      </form>
    </section>
  );
}
