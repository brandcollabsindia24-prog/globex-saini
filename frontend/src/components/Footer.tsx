"use client";

import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      {/* Main Footer Content */}
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Brand Section */}
          <div className={styles.section}>
            <div className={styles.brand}>
              <span className={styles.logo}>G</span>
              <span className={styles.brandName}>Globex</span>
            </div>
            <p className={styles.tagline}>
              Connecting brands with the perfect influencers to drive authentic growth.
            </p>
            <div className={styles.socials}>
              <a href="#" className={styles.socialIcon} aria-label="Twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7s1.1 5.2-5.1 8.3A17.6 17.6 0 010 18c11 0 19-10 19-18.8a4.37 4.37 0 00-7-4.2" />
                </svg>
              </a>
              <a href="#" className={styles.socialIcon} aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a href="#" className={styles.socialIcon} aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="3" />
                  <circle cx="17.5" cy="6.5" r="1.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Quick Links</h4>
            <ul className={styles.links}>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/about">About Us</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
              <li>
                <Link href="/brand/login">For Brands</Link>
              </li>
              <li>
                <Link href="/influencer/login">For Influencers</Link>
              </li>
            </ul>
          </div>

          {/* For Brands */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>For Brands</h4>
            <ul className={styles.links}>
              <li>
                <Link href="/brand/register">Create Account</Link>
              </li>
              <li>
                <a href="#features">Find Influencers</a>
              </li>
              <li>
                <a href="#pricing">Pricing</a>
              </li>
              <li>
                <a href="#success">Success Stories</a>
              </li>
            </ul>
          </div>

          {/* For Influencers */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>For Influencers</h4>
            <ul className={styles.links}>
              <li>
                <Link href="/influencer/register">Create Account</Link>
              </li>
              <li>
                <a href="#campaigns">Browse Campaigns</a>
              </li>
              <li>
                <a href="#earn">Earn Money</a>
              </li>
              <li>
                <a href="#growth">Grow Your Audience</a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Support</h4>
            <ul className={styles.links}>
              <li>
                <a href="#help">Help Center</a>
              </li>
              <li>
                <a href="#faq">FAQ</a>
              </li>
              <li>
                <a href="#privacy">Privacy Policy</a>
              </li>
              <li>
                <a href="#terms">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className={styles.divider}></div>

      {/* Bottom Footer */}
      <div className={styles.bottom}>
        <div className={styles.bottomContainer}>
          <p className={styles.copyright}>
            © {currentYear} Globex. All rights reserved.
          </p>
          <div className={styles.bottomLinks}>
            <a href="#privacy">Privacy</a>
            <span className={styles.separator}>•</span>
            <a href="#terms">Terms</a>
            <span className={styles.separator}>•</span>
            <a href="#cookies">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
