"use client";

import { memo } from "react";
import styles from "../Dashboard.module.css";

type FiltersProps = {
  searchText: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onRefresh: () => void;
};

function Filters({
  searchText,
  statusFilter,
  onSearchChange,
  onStatusChange,
  onRefresh,
}: FiltersProps) {
  return (
    <div className={styles["filters-row"]}>
      <input
        type="text"
        value={searchText}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search by campaign title or description"
        className={styles["search-input"]}
      />

      <select
        value={statusFilter}
        onChange={(event) => onStatusChange(event.target.value)}
        className={styles["status-filter"]}
      >
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="active">Active</option>
        <option value="approved">Approved</option>
        <option value="completed">Completed</option>
        <option value="closed">Closed</option>
      </select>

      <button className={styles["refresh-btn"]} onClick={onRefresh}>
        Refresh
      </button>
    </div>
  );
}

export default memo(Filters);
