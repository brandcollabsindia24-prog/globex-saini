"use client";

import styles from "../InfluencerDashboard.module.css";
import { DashboardSection, ProfileData } from "../types";

type ProfileSectionProps = {
  storedProfileProgress: number;
  profile: ProfileData;
  onOpenProfileFormAtFirstIncompleteStep: () => void;
  onOpenCampaignsSection: () => void;
  onOpenSection: (section: DashboardSection) => void;
};

export default function ProfileSection({
  storedProfileProgress,
  profile,
  onOpenProfileFormAtFirstIncompleteStep,
  onOpenCampaignsSection,
  onOpenSection,
}: ProfileSectionProps) {
  return (
    <>
      <section className={styles.dashboardInsights}>
        <article className={styles.nextStepsCard}>
          <h3 className={styles.stepsHeading}>Your Next Steps</h3>

          <div className={styles.stepsGrid}>
            <div className={styles.stepBox}>
              <div className={styles.stepTitleRow}>
                <h4>Step 1: Complete Your Profile</h4>
                <span className={storedProfileProgress >= 100 ? styles.stepDoneBadge : styles.stepPendingBadge}>
                  {storedProfileProgress >= 100 ? "Done" : "Pending"}
                </span>
              </div>
              <p>Your profile is incomplete. Please complete it to continue.</p>
              <button
                className="mt-3 bg-blue-700 text-white px-4 py-2 rounded"
                disabled={storedProfileProgress >= 100}
                onClick={onOpenProfileFormAtFirstIncompleteStep}
              >
                Complete Profile
              </button>
            </div>

            <div className={styles.stepBox}>
              <div className={styles.stepTitleRow}>
                <h4>Step 2: Wait for Verification</h4>
                <span className={profile.verificationStatus === "Approved" ? styles.stepDoneBadge : styles.stepPendingBadge}>
                  {profile.verificationStatus === "Approved" ? "Verified" : "Pending"}
                </span>
              </div>
              <p>
                {storedProfileProgress < 100
                  ? "Complete profile first to move to verification."
                  : "Your profile is submitted. Please wait for admin approval."}
              </p>
              <div className={`${styles.verificationBadge} ${profile.verificationStatus === "Approved" ? styles.verified : styles.pending}`}>
                {profile.verificationStatus === "Approved" ? "Verified" : "Pending"}
              </div>
            </div>

            <div className={styles.stepBox}>
              <div className={styles.stepTitleRow}>
                <h4>Step 3: Apply for Campaigns</h4>
                <span
                  className={
                    storedProfileProgress === 100 && profile.verificationStatus === "Approved"
                      ? styles.stepDoneBadge
                      : styles.stepPendingBadge
                  }
                >
                  {storedProfileProgress === 100 && profile.verificationStatus === "Approved" ? "Ready" : "Locked"}
                </span>
              </div>
              <p>
                {storedProfileProgress === 100 && profile.verificationStatus === "Approved"
                  ? "You are verified. You can now apply for campaigns."
                  : "This step will unlock after profile completion and admin verification."}
              </p>
              <button
                className="mt-3 bg-green-600 text-white px-4 py-2 rounded"
                disabled={!(storedProfileProgress === 100 && profile.verificationStatus === "Approved")}
                onClick={onOpenCampaignsSection}
              >
                Scroll to Campaigns
              </button>
            </div>
          </div>
        </article>
      </section>

      <section className={styles.brandCards}>
        <h2>Dashboard Quick Access</h2>
        <div className={styles.quickAccessGrid}>
          <button className={`${styles.quickBtn} ${styles.quickAvailableCampaigns}`} onClick={() => onOpenSection("campaigns")}>
            Available Campaigns
          </button>
          <button className={`${styles.quickBtn} ${styles.quickMyCampaigns}`} onClick={() => onOpenSection("myCampaigns")}>
            My Campaigns
          </button>
          <button className={`${styles.quickBtn} ${styles.quickAnalytics}`} onClick={() => onOpenSection("analytics")}>
            Analytics Dashboard
          </button>
          <button className={`${styles.quickBtn} ${styles.quickApplicationStatus}`} onClick={() => onOpenSection("applicationStatus")}>
            Campaign Application Status
          </button>
          <button className={`${styles.quickBtn} ${styles.quickWallet}`} onClick={() => onOpenSection("wallet")}>
            Wallet Upgrade
          </button>
          <button className={`${styles.quickBtn} ${styles.quickNotifications}`} onClick={() => onOpenSection("notifications")}>
            Notifications
          </button>
          <button className={`${styles.quickBtn} ${styles.quickRatingReview}`} onClick={() => onOpenSection("ratingReview")}>
            Rating and Review
          </button>
        </div>
      </section>
    </>
  );
}
