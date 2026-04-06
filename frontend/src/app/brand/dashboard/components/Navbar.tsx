"use client";

import { memo, MouseEvent, useState } from "react";
import Link from "next/link";
import styles from "../Dashboard.module.css";

type NavbarProps = {
  influencerShortlistCount: number;
  onLogout: (event: MouseEvent<HTMLAnchorElement>) => void;
};

function Navbar({ influencerShortlistCount, onLogout }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={styles["header-main"]}>
      <div className={styles.wrapper}>
        <div className={styles["flex-nav-row"]}>
          <div className={styles["brand-logo-box"]}>
            <Link href="/" className={styles["brand-title-link"]} onClick={closeMenu}>
              <span className={styles["brand-img"]}>G</span>
              <span className={styles["brand-title"]}>Globex</span>
            </Link>
          </div>

          <button
            type="button"
            className={styles["menu-toggle-btn"]}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            aria-controls="brand-dashboard-menu"
          >
            <span className={styles["menu-toggle-line"]} />
            <span className={styles["menu-toggle-line"]} />
            <span className={styles["menu-toggle-line"]} />
          </button>

          <nav className={styles["menu-nav"]}>
            <ul
              id="brand-dashboard-menu"
              className={`${styles["menu-list"]} ${menuOpen ? styles["menu-list-open"] : ""}`.trim()}
            >
              <li>
                <Link href="/" className={styles["menu-link"]} onClick={closeMenu}>Home</Link>
              </li>
              <li>
                <Link href="/brand/campaign/my-campaigns" className={styles["menu-link"]} onClick={closeMenu}>My Campaigns</Link>
              </li>
              <li>
                <Link href="/brand/influencers" className={styles["menu-link"]} onClick={closeMenu}>Influencers</Link>
              </li>
              <li>
                <Link href="/brand/shortlist" className={styles["menu-link"]} onClick={closeMenu}>
                  My Shortlist ({influencerShortlistCount})
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(event) => {
                    closeMenu();
                    onLogout(event);
                  }}
                  className={`${styles["menu-link"]} ${styles["logout-btn"]}`}
                >
                  Logout
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default memo(Navbar);
