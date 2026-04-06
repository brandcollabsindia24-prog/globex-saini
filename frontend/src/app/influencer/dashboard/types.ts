export type ApplicationStatus = "applied" | "shortlisted" | "accepted" | "rejected" | "completed";

export type Campaign = {
  _id: string;
  title: string;
  budget: number;
  timeline: string;
  description: string;
  imageFile?: string;
  status?: string;
  category?: string;
  location?: string;
  followersRequired?: number;
  brandId?: {
    name?: string;
    brandName?: string;
  };
};

export type CampaignApplication = {
  _id: string;
  status: ApplicationStatus;
  paymentStatus?: "pending" | "paid";
  paymentAmount?: number;
  campaignId?: Campaign;
  contentSubmission?: {
    postLink?: string;
    screenshotLink?: string;
    note?: string;
    approvalStatus?: "not_submitted" | "submitted" | "approved" | "changes_requested";
    submittedAt?: string;
  };
  influencerRatingToBrand?: number | null;
  influencerReviewToBrand?: string;
};

export type DashboardPayload = {
  summary: {
    totalApplied: number;
    totalWorking: number;
    totalPaidCampaigns: number;
    walletBalance: number;
  };
  analytics: {
    totalEarnings: number;
    successRate: number;
    avgEngagement: number;
    profileViews: number;
  };
  myCampaigns: {
    applied: CampaignApplication[];
    ongoing: CampaignApplication[];
    completed: CampaignApplication[];
  };
  applications: CampaignApplication[];
  transactions: Array<{
    id: string;
    campaignTitle: string;
    amount: number;
    status: string;
    date: string;
  }>;
  withdrawals: Array<{
    _id: string;
    amount: number;
    status: string;
    note?: string;
    createdAt: string;
  }>;
  notifications: Array<{
    _id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
  }>;
  portfolio: {
    niche: string;
    reelLinks: string[];
    pastCollaborations: string[];
  };
};

export type ProfileData = {
  fullName: string;
  email: string;
  profileImage: string;
  whatsappNumber: string;
  instagramUsername: string;
  instagramFollowers: string;
  engagementRate: string;
  category: string;
  niche: string;
  instagramLink: string;
  youtubeChannel: string;
  youtubeSubscribers: string;
  youtubeLink: string;
  city: string;
  district: string;
  pincode: string;
  state: string;
  reelLinks: string[];
  pastCollaborations: string[];
  verificationStatus: "Pending" | "Approved" | "Rejected";
};

export type ChatMessage = {
  _id: string;
  senderRole: "brand" | "influencer" | "admin";
  message: string;
  fileUrl?: string;
  createdAt: string;
};

export type DashboardSection =
  | "analytics"
  | "myCampaigns"
  | "applicationStatus"
  | "campaignFilter"
  | "campaigns"
  | "ratingReview"
  | "notifications"
  | "wallet";

export type SocialPlatform = "instagram" | "youtube";

export const EMPTY_DASHBOARD: DashboardPayload = {
  summary: {
    totalApplied: 0,
    totalWorking: 0,
    totalPaidCampaigns: 0,
    walletBalance: 0,
  },
  analytics: {
    totalEarnings: 0,
    successRate: 0,
    avgEngagement: 0,
    profileViews: 0,
  },
  myCampaigns: {
    applied: [],
    ongoing: [],
    completed: [],
  },
  applications: [],
  transactions: [],
  withdrawals: [],
  notifications: [],
  portfolio: {
    niche: "",
    reelLinks: [],
    pastCollaborations: [],
  },
};

export const EMPTY_PROFILE: ProfileData = {
  fullName: "",
  email: "",
  profileImage: "",
  whatsappNumber: "",
  instagramUsername: "",
  instagramFollowers: "",
  engagementRate: "",
  category: "",
  niche: "",
  instagramLink: "",
  youtubeChannel: "",
  youtubeSubscribers: "",
  youtubeLink: "",
  city: "",
  district: "",
  pincode: "",
  state: "",
  reelLinks: [],
  pastCollaborations: [],
  verificationStatus: "Pending",
};

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  applied: "Applied",
  shortlisted: "Shortlisted",
  accepted: "Accepted (OK)",
  rejected: "Rejected (X)",
  completed: "Completed (Target)",
};
