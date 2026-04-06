"use client";

import Link from "next/link";
import styles from "../InfluencerDashboard.module.css";
import { ProfileData } from "../types";

type NavbarProps = {
  profile: ProfileData;
  profileProgress: number;
  showMobileNav: boolean;
  showMenu: boolean;
  isProfileComplete: boolean;
  onToggleMobileNav: () => void;
  onCloseMobileNav: () => void;
  onAvatarClick: () => void;
  onOpenProfileForm: () => void;
  onOpenProfileDetails: () => void;
  onOpenWallet: () => void;
  onOpenLogoutConfirm: () => void;
};

export default function Navbar({
  profile,
  profileProgress,
  showMobileNav,
  showMenu,
  isProfileComplete,
  onToggleMobileNav,
  onCloseMobileNav,
  onAvatarClick,
  onOpenProfileForm,
  onOpenProfileDetails,
  onOpenWallet,
  onOpenLogoutConfirm,
}: NavbarProps) {
  return (
    <header className={styles.topBar}>
      <div className={styles.navbarContainer}>
        <div className={styles.navbarLogo}>
          <Link href="/">
            <img src="/globe.svg" alt="logo" className={styles.logoImg} />
          </Link>
          <h1 className={styles.navbarTitle}>GLOBEX</h1>
        </div>

        <button
          type="button"
          className={styles.hamburgerBtn}
          aria-label="Toggle navigation"
          onClick={onToggleMobileNav}
        >
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
        </button>

        <nav className={`${styles.navbarLinks} ${showMobileNav ? styles.mobileOpen : ""}`}>
          <Link href="/" onClick={onCloseMobileNav}>
            Home
          </Link>
          <Link href="/contact" onClick={onCloseMobileNav}>
            Contact
          </Link>

          <div className={styles.statusProfileRow}>
            <div
              className={`${styles.verificationBadge} ${
                profile.verificationStatus === "Approved" ? styles.verified : styles.pending
              }`}
            >
              {profile.verificationStatus === "Approved" ? "Verified" : "Pending"}
            </div>

            <div className={styles.profileSection}>
              <div
                className={styles.progressCircle}
                style={{
                  background: `conic-gradient(#2563eb ${Math.min(profileProgress, 100) * 3.6}deg, #d9e3f2 ${Math.min(
                    profileProgress,
                    100
                  ) * 3.6}deg)`,
                }}
              >
                <img
                  src={profile.profileImage || "/avatar-placeholder.svg"}
                  alt="Profile"
                  className={styles.profileAvatar}
                  onClick={onAvatarClick}
                />
              </div>
              {showMenu && (
                <div className={styles.profileDropdown}>
                  <ul>
                    <li className={isProfileComplete ? styles.disabledMenuItem : undefined} onClick={onOpenProfileForm}>
                      Complete Your Profile
                    </li>
                    <li onClick={onOpenProfileDetails}>View Profile</li>
                    <li onClick={onOpenWallet}>Wallet</li>
                    <li onClick={onOpenLogoutConfirm}>Logout</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
