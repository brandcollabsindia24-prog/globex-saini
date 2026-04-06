export type InfluencerProfileSummary = {
  id: string;
  fullName: string;
  email: string;
  verificationStatus?: "Pending" | "Approved" | "Rejected";
};
