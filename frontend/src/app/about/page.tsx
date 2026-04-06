import Link from "next/link";
import Footer from "@/components/Footer";
import styles from "./About.module.css";

export default function AboutPage() {
  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <header className={styles.hero}>
          <div>
            <h1>We help brands grow with authentic creator partnerships</h1>
            <p className={styles.lead}>
              Globex matches brands with trusted creators, runs measurable campaigns,
              and builds long-term relationships that scale.
            </p>
            <div className={styles.heroActions}>
              <Link href="/contact" className={styles.btnPrimary}>Contact Sales</Link>
              <Link href="/influencer/register" className={styles.btnGhost}>Join as Creator</Link>
            </div>
          </div>

          <div className={styles.heroVisual} aria-hidden>
            <svg width="220" height="160" viewBox="0 0 220 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="g1" x1="0" x2="1">
                  <stop offset="0" stopColor="#2563eb" />
                  <stop offset="1" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <rect x="6" y="10" rx="12" width="200" height="90" fill="url(#g1)" opacity="0.12" />
              <circle cx="160" cy="110" r="34" fill="#2563eb" opacity="0.12" />
              <rect x="20" y="26" rx="8" width="120" height="12" fill="#2563eb" opacity="0.16" />
              <rect x="20" y="46" rx="8" width="160" height="12" fill="#06b6d4" opacity="0.12" />
            </svg>
          </div>
        </header>

        <div className={styles.divider} />

        <div className={styles.grid2}>
          <article className={styles.card}>
            <h2>Who we are</h2>
            <p>
              Globex is a performance-focused influencer marketing platform.
              We combine creator curation, campaign strategy, and transparent reporting to help brands reach real business goals.
            </p>
          </article>

          <article className={styles.card}>
            <h2>What we solve</h2>
            <p>
              Brands struggle to find creators that match their audience and maintain consistent ROI.
              We streamline discovery, verification, and campaign management so you can scale confidently.
            </p>
          </article>
        </div>

        <div className={styles.grid2}>
          <article className={`${styles.card} ${styles.highlight}`}>
            <div className={styles.icon}>Target</div>
            <h2>Our Mission</h2>
            <p>To make influencer partnerships measurable, reliable, and accessible to brands of all sizes.</p>
          </article>

          <article className={`${styles.card} ${styles.highlight}`}>
            <div className={styles.icon}>Vision</div>
            <h2>Our Vision</h2>
            <p>A transparent global marketplace where creativity and performance create long-term brand value.</p>
          </article>
        </div>

        <div className={styles.storyWrap}>
          <article className={styles.card}>
            <h2>Our Story</h2>
            <p>
              Founded by marketers and creators, Globex began as a local directory of curated creators.
              Seeing the gap between influencer potential and measurable brand impact, we built tools to verify audiences,
              measure campaign ROI, and support creators so both sides succeed.
            </p>
          </article>
          <div className={styles.storyVisual} role="img" aria-label="Team collaboration" />
        </div>

        <div className={styles.grid2}>
          <article className={styles.card}>
            <h2>Services</h2>
            <ul className={styles.list}>
              <li>Creator discovery and audience matching</li>
              <li>End-to-end campaign strategy and management</li>
              <li>Performance reporting and optimization</li>
              <li>Payments, contracts, and creator support</li>
            </ul>
          </article>

          <article className={styles.card}>
            <h2>Why choose us</h2>
            <ul className={styles.list}>
              <li><strong>Transparency:</strong> Open reporting and honest partnerships.</li>
              <li><strong>Trust:</strong> Vetted creators and brand-safety checks.</li>
              <li><strong>Growth:</strong> Focus on measurable outcomes and scale.</li>
            </ul>
          </article>
        </div>

        <div className={styles.divider} />

        <div className={styles.grid2}>
          <article className={styles.card}>
            <h2>Milestones</h2>
            <div className={styles.metrics}>
              <div><strong>500+</strong><span>Campaigns run</span></div>
              <div><strong>2k+</strong><span>Creators trusted</span></div>
              <div><strong>90%</strong><span>Client retention</span></div>
            </div>
          </article>

          <article className={styles.card}>
            <h2>Trusted by</h2>
            <div className={styles.logoGrid}>
              <span>Brand One</span>
              <span>Brand Two</span>
              <span>Brand Three</span>
              <span>Brand Four</span>
            </div>
          </article>
        </div>

        <div className={styles.divider} />

        <section>
          <h2 className={styles.sectionTitle}>The Team</h2>
          <div className={styles.teamGrid}>
            <article className={styles.teamCard}>
              <img className={styles.avatar} src="https://i.pravatar.cc/180?img=12" alt="Anita Roy" />
              <h3>Anita Roy</h3>
              <p className={styles.role}>Co-founder and CEO</p>
              <p className={styles.bio}>Former brand lead who scaled creator programs at multiple startups.</p>
            </article>

            <article className={styles.teamCard}>
              <img className={styles.avatar} src="https://i.pravatar.cc/180?img=9" alt="Ravi Patel" />
              <h3>Ravi Patel</h3>
              <p className={styles.role}>Head of Growth</p>
              <p className={styles.bio}>Performance marketer focused on measurable influencer ROI.</p>
            </article>

            <article className={styles.teamCard}>
              <img className={styles.avatar} src="https://i.pravatar.cc/180?img=5" alt="Meera Singh" />
              <h3>Meera Singh</h3>
              <p className={styles.role}>Creator Partnerships</p>
              <p className={styles.bio}>Builds long-term relationships with creators and brands.</p>
            </article>
          </div>
        </section>

        <div className={styles.divider} />

        <section>
          <h2 className={styles.sectionTitle}>What our clients say</h2>
          <div className={styles.testimonialGrid}>
            <article className={styles.testimonialCard}>
              <p className={styles.quote}>
                "Globex matched us with creators who understood our audience. Our campaign lifted sales by 35%."
              </p>
              <p className={styles.author}>Priya Sharma, Marketing Director</p>
            </article>

            <article className={styles.testimonialCard}>
              <p className={styles.quote}>
                "Great visibility into results and timely payouts. Easy to work with and clear impact."
              </p>
              <p className={styles.author}>Arun Bose, Head of Growth</p>
            </article>
          </div>
        </section>

        <div className={styles.cta}>
          <h3>Ready to grow with creators who care about your brand?</h3>
          <div className={styles.heroActions}>
            <Link href="/contact" className={styles.btnPrimary}>Work with us</Link>
            <Link href="/brand/register" className={styles.btnGhost}>I am a Brand</Link>
          </div>
        </div>
      </div>
      <Footer />
    </section>
  );
}
