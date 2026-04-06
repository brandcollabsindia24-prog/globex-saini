"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./SiteHeader.module.css";
import { useState } from "react";

const VISIBLE_ROUTES = new Set([
  "/",
  "/brand/login",
  "/brand/register",
  "/influencer/login",
  "/influencer/register",
  "/about",
  "/contact",
]);

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export default function SiteHeader() {
  const pathname = usePathname();
  const currentPath = normalizePath(pathname || "/");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!VISIBLE_ROUTES.has(currentPath)) {
    return null;
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logoWrap}>
          <span className={styles.logoMark}>G</span>
          <span className={styles.logoText}>Globex</span>
        </Link>

        <nav className={styles.nav}>
          <Link href="/" className={styles.link}>Home</Link>
          <Link href="/about" className={styles.link}>About</Link>
          <Link href="/contact" className={styles.link}>Contact</Link>
        </nav>

        <div className={styles.actions}>
          <Link href="/brand/login" className={styles.loginBtn}>
            For Brands
          </Link>
          <Link href="/influencer/login" className={styles.signupBtn}>
            For Influencers
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className={styles.mobileMenuBtn} 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <Link href="/" className={styles.mobileLink}>Home</Link>
          <Link href="/about" className={styles.mobileLink}>About</Link>
          <Link href="/contact" className={styles.mobileLink}>Contact</Link>
          <Link href="/brand/login" className={styles.mobileBrandBtn}>
            For Brands
          </Link>
          <Link href="/influencer/login" className={styles.mobileInfluencerBtn}>
            For Influencers
          </Link>
        </div>
      )}
    </header>
  );
}
