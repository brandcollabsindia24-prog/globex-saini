export type BrandUser = {
  role?: string;
  brandName?: string;
};

export type CampaignForm = {
  title: string;
  brandName: string;
  budget: string;
  numberOfInfluencers: string;
  pricePerInfluencer: string;
  description: string;
  timeline: string;
  platforms: string[];
  websiteLink: string;
  instagramHandle: string;
  categories: string[];
  targetGender: string;
  followersRange: string;
};

export type Campaign = {
  _id: string;
  createdAt?: string;
  title: string;
  budget: number | string;
  numberOfInfluencers?: number | string;
  description: string;
  timeline: string;
  category?: string;
  followersRequired?: number | string;
  status: string;
  imageFile?: string;
  applications?: unknown[] | number;
  selectedInfluencers?: unknown[] | number;
  shortlistedInfluencers?: unknown[] | number;
};

export type RecommendedInfluencer = {
  id: string;
  name: string;
  niche: string;
  followers: string;
  avgRate: string;
};

export type DashboardMetrics = {
  total: number;
  active: number;
  completed: number;
  pending: number;
  totalBudget: number;
  totalApplications: number;
  selectedInfluencers: number;
  completionRate: number;
};
