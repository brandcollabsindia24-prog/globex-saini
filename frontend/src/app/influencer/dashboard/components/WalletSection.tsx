"use client";

import { FormEvent } from "react";
import styles from "../InfluencerDashboard.module.css";
import { DashboardPayload } from "../types";

type WalletSectionProps = {
  dashboard: DashboardPayload;
  withdrawAmount: string;
  withdrawNote: string;
  setWithdrawAmount: (value: string) => void;
  setWithdrawNote: (value: string) => void;
  onWithdraw: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export default function WalletSection({
  dashboard,
  withdrawAmount,
  withdrawNote,
  setWithdrawAmount,
  setWithdrawNote,
  onWithdraw,
}: WalletSectionProps) {
  return (
    <section id="wallet-section" className={styles.brandCards}>
      <h2>Wallet Upgrade</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className={styles.card}>
          <h3 className="font-semibold">Transaction History</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {dashboard.transactions.length === 0 ? <li>No paid transactions yet.</li> : null}
            {dashboard.transactions.map((item) => (
              <li key={item.id} className="border rounded p-2">
                <p>{item.campaignTitle}</p>
                <p>INR {item.amount}</p>
                <p>Status: {item.status}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.card}>
          <h3 className="font-semibold">Withdraw Request</h3>
          <form className="mt-2" onSubmit={onWithdraw}>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Amount"
              value={withdrawAmount}
              onChange={(event) => setWithdrawAmount(event.target.value)}
            />
            <textarea
              className="w-full border rounded px-3 py-2 mt-2"
              placeholder="Note"
              value={withdrawNote}
              onChange={(event) => setWithdrawNote(event.target.value)}
            />
            <button className="mt-3 bg-slate-900 text-white px-4 py-2 rounded" type="submit">
              Request withdrawal
            </button>
          </form>

          <ul className="mt-4 space-y-2 text-sm">
            {dashboard.withdrawals.map((item) => (
              <li key={item._id} className="border rounded p-2">
                INR {item.amount} - {item.status}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
