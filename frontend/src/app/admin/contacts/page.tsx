"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./AdminContacts.module.css";
import { getAuthSession, resolveApiBaseUrl } from "../../../lib/authStorage";

type ContactItem = {
  _id: string;
  name: string;
  email: string;
  whatsapp: string;
  subject: string;
  message: string;
  userType: "brand" | "influencer";
  createdAt: string;
};

export default function AdminContactsPage() {
  const apiBaseUrl = resolveApiBaseUrl();
  const router = useRouter();
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTypeFilter, setUserTypeFilter] = useState<"all" | "brand" | "influencer">("all");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const session = getAuthSession("admin");
    const token = session?.token;
    const user = session?.user;

    if (!token || !user || user.role !== "admin") {
      router.replace("/admin/auth");
      return;
    }

    const fetchContacts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiBaseUrl}/api/admin/contacts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setContacts(response.data?.contacts || []);
      } catch (error) {
        alert("Failed to load contacts");
      } finally {
        setLoading(false);
      }
    };

    void fetchContacts();
  }, [router]);

  const filteredContacts = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    return contacts.filter((contact) => {
      const typeMatched = userTypeFilter === "all" ? true : contact.userType === userTypeFilter;
      const searchMatched = keyword
        ? contact.name.toLowerCase().includes(keyword) ||
          contact.email.toLowerCase().includes(keyword) ||
          contact.subject.toLowerCase().includes(keyword)
        : true;
      return typeMatched && searchMatched;
    });
  }, [contacts, userTypeFilter, searchText]);

  return (
    <main className={styles.contactsPage}>
      <h1 className={styles.pageTitle}>Contacts Page</h1>

      <div className={styles.topBar}>
        <div className={styles.filterButtons}>
          <button
            className={userTypeFilter === "all" ? styles.active : ""}
            onClick={() => setUserTypeFilter("all")}
          >
            All
          </button>
          <button
            className={userTypeFilter === "brand" ? styles.active : ""}
            onClick={() => setUserTypeFilter("brand")}
          >
            Brand
          </button>
          <button
            className={userTypeFilter === "influencer" ? styles.active : ""}
            onClick={() => setUserTypeFilter("influencer")}
          >
            Influencer
          </button>

          <Link href="/admin/dashboard">
            <button>Back</button>
          </Link>
        </div>

        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search name, email or subject"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p className={styles.emptyText}>Loading contacts...</p>
      ) : filteredContacts.length === 0 ? (
        <p className={styles.emptyText}>No contact messages found.</p>
      ) : (
        <div className={styles.cardGrid}>
          {filteredContacts.map((contact) => (
            <article key={contact._id} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={contact.userType === "brand" ? styles.badgeBrand : styles.badgeInfluencer}>
                  {contact.userType.toUpperCase()}
                </span>
                <span className={styles.dateText}>{new Date(contact.createdAt).toLocaleString()}</span>
              </div>

              <h2 className={styles.name}>{contact.name}</h2>
              <p className={styles.text}>Email: {contact.email}</p>
              <p className={styles.text}>WhatsApp: {contact.whatsapp}</p>
              <p className={styles.text}>Subject: {contact.subject}</p>
              <p className={styles.message}>{contact.message}</p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
