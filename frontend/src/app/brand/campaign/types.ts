export type CampaignStatus = "pending" | "active" | "approved" | "completed" | "closed";

export type CampaignSummary = {
  id: string;
  title: string;
  budget: number;
  status: CampaignStatus;
  timeline: string;
};
