export type WalletTransaction = {
  id: string;
  amount: number;
  status: "pending" | "paid" | "failed";
  createdAt: string;
};

export type WithdrawalRequest = {
  id: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};
