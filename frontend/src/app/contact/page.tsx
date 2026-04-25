"use client";

import { useState } from "react";
import Footer from "@/components/Footer";
import { resolveApiBaseUrl } from "@/lib/authStorage";
import styles from "./Contact.module.css";

type ContactForm = {
  name: string;
  email: string;
  whatsapp: string;
  subject: string;
  message: string;
  userType: "influencer" | "brand";
};

const initialForm: ContactForm = {
  name: "",
  email: "",
  whatsapp: "",
  subject: "",
  message: "",
  userType: "influencer",
};

export default function ContactPage() {
  const apiBaseUrl = resolveApiBaseUrl();
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const validate = () => {
    const { name, email, whatsapp, subject, message, userType } = form;
    if (!name || !email || !whatsapp || !subject || !message || !userType) {
      setFeedback({ type: "error", text: "All fields are required." });
      return false;
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      setFeedback({ type: "error", text: "Please enter a valid email." });
      return false;
    }

    if (!/^\d{10}$/.test(whatsapp)) {
      setFeedback({ type: "error", text: "WhatsApp number must be 10 digits." });
      return false;
    }

    return true;
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setForm((state) => ({ ...state, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/contacts/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.message || "Submission failed.");
      }

      setFeedback({ type: "success", text: result?.message || "Message submitted successfully." });
      setForm(initialForm);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Submission failed.";
      setFeedback({ type: "error", text: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.grid}>
        <div className={styles.formCard}>
          <h2>Contact Us</h2>
          <p className={styles.subText}>Tell us about your campaign or partnership goals. We usually reply within 1-2 business days.</p>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {feedback ? (
              <p className={feedback.type === "success" ? styles.success : styles.error}>{feedback.text}</p>
            ) : null}

            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />

            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required />

            <label>WhatsApp Number</label>
            <input name="whatsapp" value={form.whatsapp} onChange={handleChange} required maxLength={10} />

            <label>Subject</label>
            <input name="subject" value={form.subject} onChange={handleChange} required />

            <label>Message</label>
            <textarea name="message" value={form.message} onChange={handleChange} required rows={5} />

            <label>User Type</label>
            <select name="userType" value={form.userType} onChange={handleChange}>
              <option value="influencer">Influencer</option>
              <option value="brand">Brand</option>
            </select>

            <button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Send Message"}
            </button>
          </form>
        </div>

        <aside className={styles.infoArea}>
          <div className={styles.infoCard}>
            <h3>Company Information</h3>
            <p><strong>Company:</strong> GlobexPromote</p>
            <p><strong>Email:</strong> contact@kodyfier.com</p>
            <p><strong>Phone:</strong> 9876543211</p>
            <p><strong>Address:</strong> Pune, Maharashtra</p>
            <p><strong>Website:</strong> globexpromote.example</p>
          </div>

          <div className={styles.infoCard}>
            <h3>Follow Us</h3>
            <ul className={styles.socials}>
              <li><a href="https://instagram.com/globex_promote" target="_blank" rel="noreferrer">Instagram</a></li>
              <li><a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a></li>
              <li><a href="https://youtube.com" target="_blank" rel="noreferrer">YouTube</a></li>
            </ul>
          </div>

          <div className={styles.infoCard}>
            <h3>Our Location</h3>
            <iframe
              title="company-map"
              src="https://www.google.com/maps?q=Pune,+Maharashtra&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className={styles.infoCard}>
            <h3>FAQ</h3>
            <details>
              <summary>How long until I get a response?</summary>
              <p>We typically respond within 1-2 business days.</p>
            </details>
            <details>
              <summary>Can brands and influencers both contact?</summary>
              <p>Yes, you can choose your user type in the form.</p>
            </details>
          </div>
        </aside>
      </div>
      <Footer />
    </section>
  );
}
