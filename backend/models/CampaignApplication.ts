import mongoose from "mongoose";

const campaignApplicationSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    influencerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Influencer",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "applied",
        "shortlisted",
        "accepted",
        "in_progress",
        "submitted",
        "revision_required",
        "completed",
        "rejected",
      ],
      default: "applied",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    paymentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    contentSubmission: {
      reelLink: {
        type: String,
        default: "",
        trim: true,
      },
      postLink: {
        type: String,
        default: "",
        trim: true,
      },
      screenshotLink: {
        type: String,
        default: "",
        trim: true,
      },
      caption: {
        type: String,
        default: "",
        trim: true,
      },
      feedback: {
        type: String,
        default: "",
        trim: true,
      },
      approvalStatus: {
        type: String,
        enum: ["not_submitted", "submitted", "approved", "changes_requested"],
        default: "not_submitted",
      },
      submittedAt: {
        type: Date,
        default: null,
      },
    },
    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },
    influencerRatingToBrand: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    influencerReviewToBrand: {
      type: String,
      default: "",
      trim: true,
    },
    brandRatingToInfluencer: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    brandReviewToInfluencer: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

campaignApplicationSchema.index({ campaignId: 1, influencerId: 1 }, { unique: true });

export default mongoose.models.CampaignApplication ||
  mongoose.model("CampaignApplication", campaignApplicationSchema);
