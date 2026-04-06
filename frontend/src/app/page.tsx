"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";

export default function Home() {
  const router = useRouter();
  const [activeNoticeCard, setActiveNoticeCard] = React.useState<string | null>(null);

  const featuredBrands = [
    {
      name: "NovaSkin",
      image:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "UrbanSip",
      image:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "PixelGear",
      image:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=300&q=80",
    },
  ];

  const featuredInfluencers = [
    {
      name: "Riya Malhotra",
      niche: "Beauty | 74k Followers",
      image:
        "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=500&q=80",
    },
    {
      name: "Aarav Khanna",
      niche: "Tech | 96k Followers",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",
    },
    {
      name: "Neha Verma",
      niche: "Fashion | 68k Followers",
      image:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=80",
    },
    {
      name: "Kabir Sharma",
      niche: "Fitness | 82k Followers",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80",
    },
    {
      name: "Isha Gupta",
      niche: "Lifestyle | 59k Followers",
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80",
    },
    {
      name: "Vivaan Mehta",
      niche: "Gaming | 121k Followers",
      image:
        "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=500&q=80",
    },
    {
      name: "Simran Kaur",
      niche: "Food | 88k Followers",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80",
    },
    {
      name: "Rohan Nair",
      niche: "Travel | 73k Followers",
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80",
    },
    {
      name: "Pooja Iyer",
      niche: "Skincare | 91k Followers",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=500&q=80",
    },
    {
      name: "Aditya Rao",
      niche: "Finance | 64k Followers",
      image:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=500&q=80",
    },
  ];

  const howItWorksSteps = [
    {
      text: "Brand creates a campaign",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=300&q=80",
    },
    {
      text: "Influencers apply",
      image:
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=300&q=80",
    },
    {
      text: "Collaboration starts",
      image:
        "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=300&q=80",
    },
    {
      text: "Both sides grow",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=300&q=80",
    },
  ];

  React.useEffect(() => {
    const root = document.querySelector(".home");
    if (!root) return;

    let activeEl: Element | null = null;

    const clearTouchHover = () => {
      if (activeEl) {
        activeEl.classList.remove("is-touch-hover");
        activeEl = null;
      }
    };

    const setTouchHover = (event: Event) => {
      const target = event.target as Element | null;
      if (!target) return;

      const hoverable = target.closest(".tap-hoverable");
      if (!hoverable) return;

      clearTouchHover();
      activeEl = hoverable;
      activeEl.classList.add("is-touch-hover");
    };

    root.addEventListener("touchstart", setTouchHover, { passive: true });
    root.addEventListener("touchend", clearTouchHover);
    root.addEventListener("touchcancel", clearTouchHover);

    return () => {
      root.removeEventListener("touchstart", setTouchHover);
      root.removeEventListener("touchend", clearTouchHover);
      root.removeEventListener("touchcancel", clearTouchHover);
    };
  }, []);

  React.useEffect(() => {
    if (!activeNoticeCard) return;

    const timer = window.setTimeout(() => {
      setActiveNoticeCard(null);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [activeNoticeCard]);

  const handleViewProfileClick = (cardName: string) => {
    setActiveNoticeCard(cardName);
  };

  return (
    <div className="home">
      <section className="section-hero">
        <div className="hero">
          <h1>Connecting Brands with the Right Influencers 🚀</h1>
          <p>Grow your brand. Earn as a creator.</p>
          <div className="hero-buttons">
            <button onClick={() => router.push("/brand/register")} className="brand tap-hoverable">
              I’m a Brand
            </button>
            <button onClick={() => router.push("/influencer/register")} className="influencer tap-hoverable">
              I’m an Influencer
            </button>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <p className="section-intro">
          A simple flow that helps brands launch faster and helps creators find better opportunities.
        </p>
        <div className="steps">
          {howItWorksSteps.map((step, index) => (
            <div key={step.text} className="step tap-hoverable" tabIndex={0}>
              <img src={step.image} alt={`Step ${index + 1}: ${step.text}`} loading="lazy" />
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="benefits">
        <h2>Benefits</h2>
        <div className="cards">
          <div className="card tap-hoverable" tabIndex={0}>
            <h3>For Brands</h3>
            <ul>
              <li>Reach right audience</li>
              <li>Measurable results</li>
              <li>Cost-effective campaigns</li>
            </ul>
          </div>
          <div className="card tap-hoverable" tabIndex={0}>
            <h3>For Influencers</h3>
            <ul>
              <li>New income opportunities</li>
              <li>Brand partnerships</li>
              <li>Long-term growth</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="featured">
        <h2>Featured Brands & Influencers</h2>

        <div className="logos">
          <div className="logos-track">
            {[...featuredBrands, ...featuredBrands].map((brand, idx) => (
              <img
                key={`${brand.name}-${idx}`}
                src={brand.image}
                alt={brand.name}
                loading="lazy"
                title={brand.name}
              />
            ))}
          </div>
        </div>

        <div className="influencers influencer-rail">
          {featuredInfluencers.map((influencer) => (
            <div key={influencer.name} className="influencer-card tap-hoverable" tabIndex={0}>
              {activeNoticeCard === influencer.name ? (
                <div className="card-locked-notice card-locked-cover" role="status" aria-live="polite">
                  <p>
                    Unlock influencer details and start collaborations.
                    <br />
                    Login or create a brand account to continue.
                  </p>
                  <button type="button" onClick={() => setActiveNoticeCard(null)}>
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <img src={influencer.image} alt={influencer.name} loading="lazy" />
                  <p className="name">{influencer.name}</p>
                  <p className="niche">{influencer.niche}</p>
                  <button onClick={() => handleViewProfileClick(influencer.name)}>View Profile</button>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="testimonials">
        <h2>What People Say</h2>
        <div className="quote">
          <p>"Our sales grew 2x after working with creators here!"</p>
          <p>– Brand Owner</p>
        </div>
        <div className="quote">
          <p>"This platform gave me consistent brand deals and income."</p>
          <p>– Influencer</p>
        </div>
      </section>

      <section className="cta">
        <h2>Are you ready to grow? Join now!</h2>
        <button onClick={() => router.push("/brand/register")} className="brand tap-hoverable">
          I’m a Brand
        </button>
        <button onClick={() => router.push("/influencer/register")} className="influencer tap-hoverable">
          I’m an Influencer
        </button>
      </section>

      <Footer />
    </div>
  );
}