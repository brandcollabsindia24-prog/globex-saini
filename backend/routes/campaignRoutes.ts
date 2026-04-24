import express from "express";
import {
	applyToCampaign,
	createWithdrawRequest,
	createCampaign,
	getBrandCampaignApplications,
	updateMyCampaign,
	getAdvancedInfluencerDashboard,
	getActiveCampaignsForInfluencer,
	getCampaignChatMessages,
	getInfluencerApplications,
	getInfluencerNotifications,
	getInfluencerDashboardSummary,
	getWithdrawRequests,
	markNotificationAsRead,
	getMyCampaigns,
	processBulkApplicationPayment,
	sendCampaignChatMessage,
	submitCampaignContent,
	resubmitCampaignContent,
	startInfluencerWork,
	requestRevision,
	approveInfluencerWork,
	rejectInfluencerWork,
	submitInfluencerReview,
	updateApplicationProgress,
} from "../controllers/campaignController";
import { protect } from "../middleware/authMiddleware";
import { uploadCampaignImage, uploadSubmissionFiles } from "../middleware/uploadMiddleware";

const router = express.Router();

router.post("/", protect, uploadCampaignImage.single("image"), createCampaign);
router.get("/my", protect, getMyCampaigns);

// Keep specific influencer routes before dynamic :campaignId routes.
router.get("/influencer/active", protect, getActiveCampaignsForInfluencer);
router.get("/influencer/applications", protect, getInfluencerApplications);
router.get("/influencer/summary", protect, getInfluencerDashboardSummary);
router.get("/influencer/dashboard/advanced", protect, getAdvancedInfluencerDashboard);
router.get("/influencer/notifications", protect, getInfluencerNotifications);
router.patch("/influencer/notifications/:notificationId/read", protect, markNotificationAsRead);
router.get("/influencer/wallet/withdrawals", protect, getWithdrawRequests);
router.post("/influencer/wallet/withdraw", protect, createWithdrawRequest);
router.get("/influencer/applications/:applicationId/chat", protect, getCampaignChatMessages);
router.post("/influencer/applications/:applicationId/chat", protect, sendCampaignChatMessage);
router.post(
	"/influencer/applications/:applicationId/content-submission",
	protect,
	uploadSubmissionFiles.fields([
		{ name: "reelFile", maxCount: 1 },
		{ name: "postFile", maxCount: 1 },
		{ name: "screenshotFile", maxCount: 1 },
	]),
	submitCampaignContent
);
router.post("/influencer/applications/:applicationId/review", protect, submitInfluencerReview);

router.get("/:campaignId/applications", protect, getBrandCampaignApplications);
router.patch("/:campaignId", protect, uploadCampaignImage.single("image"), updateMyCampaign);
router.patch("/applications/:applicationId/start", protect, startInfluencerWork);
router.patch(
	"/applications/:applicationId/submit",
	protect,
	uploadSubmissionFiles.fields([
		{ name: "reelFile", maxCount: 1 },
		{ name: "postFile", maxCount: 1 },
		{ name: "screenshotFile", maxCount: 1 },
	]),
	submitCampaignContent
);
router.patch(
	"/applications/:applicationId/resubmit",
	protect,
	uploadSubmissionFiles.fields([
		{ name: "reelFile", maxCount: 1 },
		{ name: "postFile", maxCount: 1 },
		{ name: "screenshotFile", maxCount: 1 },
	]),
	resubmitCampaignContent
);
router.patch("/applications/:applicationId/revision", protect, requestRevision);
router.patch("/applications/:applicationId/approve", protect, approveInfluencerWork);
router.patch("/applications/:applicationId/reject", protect, rejectInfluencerWork);
router.patch("/applications/:applicationId/progress", protect, updateApplicationProgress);
router.post("/:campaignId/applications/payment", protect, processBulkApplicationPayment);
router.post("/:campaignId/apply", protect, applyToCampaign);

export default router;
