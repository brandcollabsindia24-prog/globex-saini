"use client";

import { ChangeEvent, FormEvent, memo } from "react";
import styles from "../Dashboard.module.css";
import { CampaignForm } from "../types";

type CampaignFormErrors = Partial<
  Record<
    | "title"
    | "brandName"
    | "description"
    | "timeline"
    | "budget"
    | "numberOfInfluencers"
    | "pricePerInfluencer"
    | "platforms"
    | "websiteLink"
    | "instagramHandle"
    | "categories"
    | "targetGender"
    | "followersRange"
    | "images",
    string
  >
>;

type CampaignModalProps = {
  open: boolean;
  campaign: CampaignForm;
  errors: CampaignFormErrors;
  imagePreviews: string[];
  isPreviewOpen: boolean;
  isSubmitting: boolean;
  isSubmitted?: boolean;
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  hideImageUpload?: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onImageUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onCampaignChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onPlatformToggle: (platform: string) => void;
  onCategoryToggle: (category: string) => void;
  onImageRemove: (index: number) => void;
  onTogglePreview: () => void;
};

const PLATFORM_OPTIONS = ["Instagram", "YouTube", "Facebook"];
const CATEGORY_OPTIONS = ["Actor", "Adventure", "Fashion", "Lifestyle", "Model"];
const GENDER_OPTIONS = ["Male", "Female", "Both"];
const FOLLOWERS_RANGE_OPTIONS = ["1K-10K", "10K-100K", "100K+"];

function CampaignModal({
  open,
  campaign,
  errors,
  imagePreviews,
  isPreviewOpen,
  isSubmitting,
  isSubmitted = false,
  title = "Create Campaign",
  subtitle = "Set up a complete campaign brief for creators.",
  submitLabel = "Submit Campaign",
  hideImageUpload = false,
  onClose,
  onSubmit,
  onImageUpload,
  onCampaignChange,
  onPlatformToggle,
  onCategoryToggle,
  onImageRemove,
  onTogglePreview,
}: CampaignModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className={styles["campaign-modal-overlay"]}
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className={styles["campaign-modal"]}>
        <button type="button" className={styles["campaign-modal-close"]} onClick={onClose}>
          x
        </button>

        <h2>{title}</h2>
        <p className={styles["campaign-modal-subtitle"]}>{subtitle}</p>

        <form onSubmit={onSubmit} className={styles["campaign-form"]}>
          {!hideImageUpload ? (
            <section className={styles["form-block"]}>
              <h3>Image Upload</h3>
              <label className={styles["field"]}>
                <span>Upload Images (1 to 3)</span>
                <input type="file" accept="image/*" multiple onChange={onImageUpload} />
                {errors.images ? <small className={styles["field-error"]}>{errors.images}</small> : null}
              </label>

              <div className={styles["image-preview-grid"]}>
                {imagePreviews.map((preview, index) => (
                  <article key={`${preview}-${index}`} className={styles["image-preview-card"]}>
                    <img src={preview} alt={`Campaign preview ${index + 1}`} />
                    <button type="button" onClick={() => onImageRemove(index)}>Remove</button>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className={styles["form-block"]}>
            <h3>Basic Info</h3>
            <div className={styles["form-grid-two"]}>
              <label className={styles["field"]}>
                <span>Campaign Title</span>
                <input type="text" name="title" value={campaign.title} onChange={onCampaignChange} placeholder="Summer Fashion Launch" />
                {errors.title ? <small className={styles["field-error"]}>{errors.title}</small> : null}
              </label>

              <label className={styles["field"]}>
                <span>Brand Name</span>
                <input type="text" name="brandName" value={campaign.brandName} onChange={onCampaignChange} placeholder="Brand Name" />
                {errors.brandName ? <small className={styles["field-error"]}>{errors.brandName}</small> : null}
              </label>
            </div>

            <label className={styles["field"]}>
              <span>Timeline</span>
              <input
                type="text"
                name="timeline"
                value={campaign.timeline}
                onChange={onCampaignChange}
                placeholder="e.g. 15 days"
              />
              {errors.timeline ? <small className={styles["field-error"]}>{errors.timeline}</small> : null}
            </label>

              </section> 

          <section className={styles["form-block"]}>
            <h3>Budget and Platform</h3>
            <div className={styles["form-grid-two"]}>
              <label className={styles["field"]}>
                <span>Total Budget</span>
                <div className={styles["currency-input-wrap"]}>
                  <span>Rs.</span>
                  <input type="number" name="budget" value={campaign.budget} onChange={onCampaignChange} placeholder="15000" min={0} />
                </div>
                {errors.budget ? <small className={styles["field-error"]}>{errors.budget}</small> : null}
              </label>

              <label className={styles["field"]}>
                <span>Number of Influencers</span>
                <input
                  type="number"
                  name="numberOfInfluencers"
                  value={campaign.numberOfInfluencers}
                  onChange={onCampaignChange}
                  placeholder="5"
                  min={1}
                />
                {errors.numberOfInfluencers ? <small className={styles["field-error"]}>{errors.numberOfInfluencers}</small> : null}
              </label>
            </div>

            <label className={styles["field"]}>
              <span>Price Per Influencer (Auto-calculated)</span>
              <div className={styles["currency-input-wrap"]}>
                <span>Rs.</span>
                <input
                  type="number"
                  value={
                    campaign.budget && campaign.numberOfInfluencers
                      ? Number(campaign.budget) / Number(campaign.numberOfInfluencers)
                      : ""
                  }
                  disabled
                  placeholder="0"
                  readOnly
                  style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                />
              </div>
              <small style={{ color: "#666", fontSize: "0.85rem", marginTop: "4px" }}>
                Budget divided by number of influencers
              </small>
            </label>

            <div className={styles["field"]}>
              <span>Platform Selection</span>
              <div className={styles["checkbox-grid"]}>
                {PLATFORM_OPTIONS.map((platform) => (
                  <label key={platform} className={styles["checkbox-item"]}>
                    <input
                      type="checkbox"
                      checked={campaign.platforms.includes(platform)}
                      onChange={() => onPlatformToggle(platform)}
                    />
                    <span>{platform}</span>
                  </label>
                ))}
              </div>
              {errors.platforms ? <small className={styles["field-error"]}>{errors.platforms}</small> : null}
            </div>
          </section>



<section>
            <label className={styles["field"]}>
              <span>Description</span>
              <textarea name="description" value={campaign.description} onChange={onCampaignChange} placeholder="Campaign goals, messaging and outcome..." rows={4} />
              {errors.description ? <small className={styles["field-error"]}>{errors.description}</small> : null}
            </label>
          </section>

          {/* <section className={styles["form-block"]}>
            <h3>Image Upload</h3>
            <label className={styles["field"]}>
              <span>Upload Images (1 to 3)</span>
              <input type="file" accept="image/*" multiple onChange={onImageUpload} />
              {errors.images ? <small className={styles["field-error"]}>{errors.images}</small> : null}
            </label>

            <div className={styles["image-preview-grid"]}>
              {imagePreviews.map((preview, index) => (
                <article key={`${preview}-${index}`} className={styles["image-preview-card"]}>
                  <img src={preview} alt={`Campaign preview ${index + 1}`} />
                  <button type="button" onClick={() => onImageRemove(index)}>Remove</button>
                </article>
              ))}
            </div>
          </section> */}

          {/* <section className={styles["form-block"]}>
            <h3>Budget and Platform</h3>
            <div className={styles["form-grid-two"]}>
              <label className={styles["field"]}>
                <span>Budget</span>
                <div className={styles["currency-input-wrap"]}>
                  <span>Rs.</span>
                  <input type="number" name="budget" value={campaign.budget} onChange={onCampaignChange} placeholder="15000" min={0} />
                </div>
                {errors.budget ? <small className={styles["field-error"]}>{errors.budget}</small> : null}
              </label>

              <div className={styles["field"]}>
                <span>Platform Selection</span>
                <div className={styles["checkbox-grid"]}>
                  {PLATFORM_OPTIONS.map((platform) => (
                    <label key={platform} className={styles["checkbox-item"]}>
                      <input
                        type="checkbox"
                        checked={campaign.platforms.includes(platform)}
                        onChange={() => onPlatformToggle(platform)}
                      />
                      <span>{platform}</span>
                    </label>
                  ))}
                </div>
                {errors.platforms ? <small className={styles["field-error"]}>{errors.platforms}</small> : null}
              </div>
            </div>
          </section> */}

          {/* <section className={styles["form-block"]}>
            <h3>Campaign Details</h3>
            <div className={styles["form-grid-two"]}>
              <label className={styles["field"]}>
                <span>Followers Requirement</span>
                <input
                  type="number"
                  name="followersRequired"
                  value={campaign.followersRequired}
                  onChange={onCampaignChange}
                  placeholder="50000"
                  min={0}
                />
                {errors.followersRequired ? <small className={styles["field-error"]}>{errors.followersRequired}</small> : null}
              </label>

            </div>
          </section> */}

          <section className={styles["form-block"]}>
            <h3>Additional Info</h3>
            <div className={styles["form-grid-two"]}>
              <label className={styles["field"]}>
                <span>Website Link</span>
                <input type="url" name="websiteLink" value={campaign.websiteLink} onChange={onCampaignChange} placeholder="https://brand.com" />
                {errors.websiteLink ? <small className={styles["field-error"]}>{errors.websiteLink}</small> : null}
              </label>

              <label className={styles["field"]}>
                <span>Instagram Handle</span>
                <input type="text" name="instagramHandle" value={campaign.instagramHandle} onChange={onCampaignChange} placeholder="@brand" />
                {errors.instagramHandle ? <small className={styles["field-error"]}>{errors.instagramHandle}</small> : null}
              </label>
            </div>
          </section>

          <section className={styles["form-block"]}>
            <h3>Categories</h3>
            <div className={styles["chips-wrap"]}>
              {CATEGORY_OPTIONS.map((category) => {
                const selected = campaign.categories.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    className={`${styles["chip-btn"]} ${selected ? styles["chip-btn-active"] : ""}`.trim()}
                    onClick={() => onCategoryToggle(category)}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
            {errors.categories ? <small className={styles["field-error"]}>{errors.categories}</small> : null}
          </section>

          <section className={styles["form-block"]}>
            <h3>Target Audience</h3>
            <div className={styles["form-grid-two"]}>
              <label className={styles["field"]}>
                <span>Gender</span>
                <select name="targetGender" value={campaign.targetGender} onChange={onCampaignChange}>
                  <option value="">Select Gender</option>
                  {GENDER_OPTIONS.map((gender) => (
                    <option key={gender} value={gender}>
                      {gender}
                    </option>
                  ))}
                </select>
                {errors.targetGender ? <small className={styles["field-error"]}>{errors.targetGender}</small> : null}
              </label>

              <label className={styles["field"]}>
                <span>Followers Range</span>
                <select name="followersRange" value={campaign.followersRange} onChange={onCampaignChange}>
                  <option value="">Select Range</option>
                  {FOLLOWERS_RANGE_OPTIONS.map((range) => (
                    <option key={range} value={range}>
                      {range}
                    </option>
                  ))}
                </select>
                {errors.followersRange ? <small className={styles["field-error"]}>{errors.followersRange}</small> : null}
              </label>
            </div>
          </section>

          <div className={styles["campaign-form-actions"]}>
            <button type="button" className={styles["preview-btn"]} onClick={onTogglePreview}>
              {isPreviewOpen ? "Hide Preview" : "Preview Campaign"}
            </button>
            <button type="submit" className={styles["submit-btn"]} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : submitLabel}
            </button>
          </div>

          {isPreviewOpen ? (
            <section className={styles["preview-card"]}>
              <h3>{campaign.title || "Campaign Title"}</h3>
              <p>{campaign.description || "Campaign description preview will appear here."}</p>
              <div className={styles["preview-meta"]}>
                <span>Brand: {campaign.brandName || "-"}</span>
                <span>Budget: Rs. {campaign.budget || "-"}</span>
                <span>Influencers: {campaign.numberOfInfluencers || "-"}</span>
                <span>
                  Price Per Influencer: Rs.{" "}
                  {
                    campaign.budget && campaign.numberOfInfluencers
                      ? Math.round(Number(campaign.budget) / Number(campaign.numberOfInfluencers))
                      : "-"
                  }
                </span>
                <span>Platforms: {campaign.platforms.join(", ") || "-"}</span>
                <span>Audience: {campaign.targetGender || "-"} | {campaign.followersRange || "-"}</span>
                <span>Categories: {campaign.categories.join(", ") || "-"}</span>
              </div>
            </section>
          ) : null}

          {isSubmitted ? (
            <section className={styles["submission-success-card"]}>
              <div className={styles["submission-success-icon"]}>✓</div>
              <h3 className={styles["submission-success-title"]}>Campaign Submitted Successfully!</h3>
              
              <div className={styles["submission-details-card"]}>
                <div className={styles["submission-details-row"]}>
                  <div className={styles["submission-detail-item"]}>
                    <div className={styles["submission-detail-label"]}>Campaign Title</div>
                    <div className={styles["submission-detail-value"]}>{campaign.title || "-"}</div>
                  </div>
                  <div className={styles["submission-detail-item"]}>
                    <div className={styles["submission-detail-label"]}>Brand Name</div>
                    <div className={styles["submission-detail-value"]}>{campaign.brandName || "-"}</div>
                  </div>
                </div>

                <div className={styles["submission-details-row"]}>
                  <div className={styles["submission-detail-item"]}>
                    <div className={styles["submission-detail-label"]}>Total Budget</div>
                    <div className={styles["submission-detail-value"]}>Rs. {campaign.budget || "-"}</div>
                  </div>
                  <div className={styles["submission-detail-item"]}>
                    <div className={styles["submission-detail-label"]}>Number of Influencers</div>
                    <div className={styles["submission-detail-value"]}>{campaign.numberOfInfluencers || "-"}</div>
                  </div>
                </div>

                <div className={styles["submission-details-row"]}>
                  <div className={styles["submission-detail-item"]}>
                    <div className={styles["submission-detail-label"]}>Price Per Influencer</div>
                    <div className={styles["submission-detail-value"]}>
                      Rs. {campaign.budget && campaign.numberOfInfluencers
                        ? Math.round(Number(campaign.budget) / Number(campaign.numberOfInfluencers))
                        : "-"}
                    </div>
                  </div>
                  <div className={styles["submission-detail-item"]}>
                    <div className={styles["submission-detail-label"]}>Timeline</div>
                    <div className={styles["submission-detail-value"]}>{campaign.timeline || "-"}</div>
                  </div>
                </div>

                <div className={styles["submission-details-row"]}>
                  <div className={styles["submission-detail-item"]}>
                    <div className={styles["submission-detail-label"]}>Platforms</div>
                    <div className={styles["submission-detail-value"]}>{campaign.platforms.join(", ") || "-"}</div>
                  </div>
                  <div className={styles["submission-detail-item"]}>
                    <div className={styles["submission-detail-label"]}>Categories</div>
                    <div className={styles["submission-detail-value"]}>{campaign.categories.join(", ") || "-"}</div>
                  </div>
                </div>

                <div className={styles["submission-details-row"]}>
                  <div className={styles["submission-detail-item"]}>
                    <div className={styles["submission-detail-label"]}>Target Audience</div>
                    <div className={styles["submission-detail-value"]}>{campaign.targetGender || "-"} | {campaign.followersRange || "-"}</div>
                  </div>
                  <div className={styles["submission-detail-item"]}>
                    <div className={styles["submission-detail-label"]}>Website</div>
                    <div className={styles["submission-detail-value"]}>{campaign.websiteLink || "-"}</div>
                  </div>
                </div>

                <div className={styles["submission-details-row"]}>
                  <div className={styles["submission-detail-item"]}>
                    <div className={styles["submission-detail-label"]}>Instagram Handle</div>
                    <div className={styles["submission-detail-value"]}>{campaign.instagramHandle || "-"}</div>
                  </div>
                </div>
              </div>
            </section>
          ) : null}
        </form>
      </div>
    </div>
  );
}

export default memo(CampaignModal);
