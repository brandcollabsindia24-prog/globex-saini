"use client";

import styles from "../InfluencerDashboard.module.css";
import { DashboardPayload } from "../types";

type NotificationsProps = {
  dashboard: DashboardPayload;
  onMarkNotificationRead: (notificationId: string) => void;
};

export default function Notifications({ dashboard, onMarkNotificationRead }: NotificationsProps) {
  return (
    <section id="notifications-section" className={styles.brandCards}>
      <h2>Notifications</h2>
      <div className="space-y-3">
        {dashboard.notifications.length === 0 ? <p>No notifications.</p> : null}
        {dashboard.notifications.map((item) => (
          <article key={item._id} className={styles.card}>
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-sm">{item.message}</p>
            <p className="text-xs text-slate-500 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
            {!item.read ? (
              <button
                className="mt-2 bg-slate-900 text-white px-3 py-1 rounded text-sm"
                onClick={() => onMarkNotificationRead(item._id)}
              >
                Mark as read
              </button>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
