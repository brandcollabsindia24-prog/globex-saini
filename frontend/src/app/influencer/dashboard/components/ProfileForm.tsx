"use client";

import { ChangeEvent, FormEvent } from "react";
import styles from "../InfluencerDashboard.module.css";
import { ProfileData, SocialPlatform } from "../types";

type ProfileFormProps = {
  showProfileForm: boolean;
  formData: ProfileData;
  currentStep: number;
  selectedPlatform: SocialPlatform | null;
  isSavingProfile: boolean;
  onClose: () => void;
  onProfileSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onProfileImageUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onFormChange: (field: keyof ProfileData, value: string) => void;
  onSelectPlatform: (platform: SocialPlatform) => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
};

export default function ProfileForm({
  showProfileForm,
  formData,
  currentStep,
  selectedPlatform,
  isSavingProfile,
  onClose,
  onProfileSubmit,
  onProfileImageUpload,
  onFormChange,
  onSelectPlatform,
  onNextStep,
  onPreviousStep,
}: ProfileFormProps) {
  if (!showProfileForm) {
    return null;
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.mainForm}>
        <h2>Complete Your Profile</h2>

        <div className={styles.stepDots}>
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className={`${styles.stepDot} ${currentStep === num ? styles.stepActive : ""}`}>
              {num}
            </div>
          ))}
        </div>

        <form onSubmit={onProfileSubmit}>
          {currentStep === 1 ? (
            <div className={styles.inputGroup}>
              <label className={styles.profileImageUpload}>
                Upload Self Image
                <input id="profile-image" type="file" accept="image/*" onChange={onProfileImageUpload} />
              </label>
              {formData.profileImage ? <img src={formData.profileImage} alt="Profile preview" className={styles.profileImagePreview} /> : null}
              <label htmlFor="full-name" className={styles.inputLabel}>Full Name</label>
              <input
                id="full-name"
                type="text"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={(event) => onFormChange("fullName", event.target.value)}
              />
              <label htmlFor="whatsapp-number" className={styles.inputLabel}>WhatsApp Number</label>
              <input
                id="whatsapp-number"
                type="tel"
                placeholder="WhatsApp Number"
                value={formData.whatsappNumber}
                onChange={(event) => onFormChange("whatsappNumber", event.target.value)}
              />
              <label htmlFor="email" className={styles.inputLabel}>Email</label>
              <input
                id="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(event) => onFormChange("email", event.target.value)}
              />
            </div>
          ) : null}

          {currentStep === 2 ? (
            <div className={styles.inputGroup}>
              <div className={styles.socialPlatformsGrid}>
                <button
                  type="button"
                  className={`${styles.socialPickCard} ${selectedPlatform === "instagram" ? styles.socialPickCardActive : ""}`}
                  onClick={() => onSelectPlatform("instagram")}
                >
                  <img src="/instagram-icon.svg" alt="Instagram" className={styles.socialIcon} />
                  <span>Instagram</span>
                </button>

                <button
                  type="button"
                  className={`${styles.socialPickCard} ${selectedPlatform === "youtube" ? styles.socialPickCardActive : ""}`}
                  onClick={() => onSelectPlatform("youtube")}
                >
                  <img src="/youtube-icon.svg" alt="YouTube" className={styles.socialIcon} />
                  <span>YouTube</span>
                </button>
              </div>
            </div>
          ) : null}

          {currentStep === 3 ? (
            <div className={styles.inputGroup}>
              {!selectedPlatform ? <p className={styles.warnText}>Please go back and select Instagram or YouTube in step 2.</p> : null}

              {selectedPlatform === "instagram" ? (
                <div className={styles.socialCard}>
                  <div className={styles.socialHeader}>
                    <img src="/instagram-icon.svg" alt="Instagram" className={styles.socialIcon} />
                    <h3>Instagram Details</h3>
                  </div>
                  <label htmlFor="instagram-username" className={styles.inputLabel}>Instagram Username</label>
                  <input
                    id="instagram-username"
                    type="text"
                    placeholder="Instagram Username"
                    value={formData.instagramUsername}
                    onChange={(event) => onFormChange("instagramUsername", event.target.value)}
                  />
                  <label htmlFor="instagram-followers" className={styles.inputLabel}>Instagram Followers</label>
                  <input
                    id="instagram-followers"
                    type="text"
                    placeholder="Instagram Followers"
                    value={formData.instagramFollowers}
                    onChange={(event) => onFormChange("instagramFollowers", event.target.value)}
                  />
                  <label htmlFor="engagement-rate" className={styles.inputLabel}>Engagement Rate</label>
                  <input
                    id="engagement-rate"
                    type="text"
                    placeholder="Engagement Rate"
                    value={formData.engagementRate}
                    onChange={(event) => onFormChange("engagementRate", event.target.value)}
                  />
                  <label htmlFor="instagram-category" className={styles.inputLabel}>Category</label>
                  <input
                    id="instagram-category"
                    type="text"
                    placeholder="Category"
                    value={formData.category}
                    onChange={(event) => onFormChange("category", event.target.value)}
                  />
                  <label htmlFor="instagram-link" className={styles.inputLabel}>Instagram Link</label>
                  <input
                    id="instagram-link"
                    type="url"
                    placeholder="Instagram Link"
                    value={formData.instagramLink}
                    onChange={(event) => onFormChange("instagramLink", event.target.value)}
                  />
                </div>
              ) : null}

              {selectedPlatform === "youtube" ? (
                <div className={styles.socialCard}>
                  <div className={styles.socialHeader}>
                    <img src="/youtube-icon.svg" alt="YouTube" className={styles.socialIcon} />
                    <h3>YouTube Details</h3>
                  </div>
                  <label htmlFor="youtube-channel" className={styles.inputLabel}>YouTube Channel Name</label>
                  <input
                    id="youtube-channel"
                    type="text"
                    placeholder="YouTube Channel Name"
                    value={formData.youtubeChannel}
                    onChange={(event) => onFormChange("youtubeChannel", event.target.value)}
                  />
                  <label htmlFor="youtube-subscribers" className={styles.inputLabel}>YouTube Subscribers</label>
                  <input
                    id="youtube-subscribers"
                    type="text"
                    placeholder="YouTube Subscribers"
                    value={formData.youtubeSubscribers}
                    onChange={(event) => onFormChange("youtubeSubscribers", event.target.value)}
                  />
                  <label htmlFor="youtube-category" className={styles.inputLabel}>Category</label>
                  <input
                    id="youtube-category"
                    type="text"
                    placeholder="Category"
                    value={formData.category}
                    onChange={(event) => onFormChange("category", event.target.value)}
                  />
                  <label htmlFor="youtube-link" className={styles.inputLabel}>YouTube Channel Link</label>
                  <input
                    id="youtube-link"
                    type="url"
                    placeholder="YouTube Channel Link"
                    value={formData.youtubeLink}
                    onChange={(event) => onFormChange("youtubeLink", event.target.value)}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {currentStep === 4 ? (
            <div className={styles.inputGroup}>
              <label htmlFor="city" className={styles.inputLabel}>City</label>
              <input id="city" type="text" placeholder="City" value={formData.city} onChange={(event) => onFormChange("city", event.target.value)} />
              <label htmlFor="district" className={styles.inputLabel}>District</label>
              <input
                id="district"
                type="text"
                placeholder="District"
                value={formData.district}
                onChange={(event) => onFormChange("district", event.target.value)}
              />
              <label htmlFor="state" className={styles.inputLabel}>State</label>
              <input id="state" type="text" placeholder="State" value={formData.state} onChange={(event) => onFormChange("state", event.target.value)} />
              <label htmlFor="pincode" className={styles.inputLabel}>Pincode</label>
              <input
                id="pincode"
                type="text"
                placeholder="Pincode"
                value={formData.pincode}
                onChange={(event) => onFormChange("pincode", event.target.value)}
              />
            </div>
          ) : null}

          <div className={styles.formActions}>
            <button type="button" className={styles.closeFormBtn} onClick={onClose}>
              Close
            </button>
            <div className={styles.rightActions}>
              {currentStep > 1 ? (
                <button type="button" className={styles.backBtn} onClick={onPreviousStep}>
                  Back
                </button>
              ) : null}

              {currentStep < 4 ? (
                <button type="button" className={styles.nextBtn} onClick={onNextStep}>
                  Save and Next
                </button>
              ) : (
                <button type="submit" className={styles.submitBtn} disabled={isSavingProfile}>
                  {isSavingProfile ? "Saving..." : "Submit Profile"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
