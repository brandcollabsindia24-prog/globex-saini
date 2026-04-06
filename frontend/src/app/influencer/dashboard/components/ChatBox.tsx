"use client";

import { FormEvent } from "react";
import styles from "../InfluencerDashboard.module.css";
import { ChatMessage } from "../types";

type ChatBoxProps = {
  selectedChatApplicationId: string;
  chatMessages: ChatMessage[];
  chatText: string;
  chatFileUrl: string;
  setChatText: (value: string) => void;
  setChatFileUrl: (value: string) => void;
  onSendChat: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export default function ChatBox({
  selectedChatApplicationId,
  chatMessages,
  chatText,
  chatFileUrl,
  setChatText,
  setChatFileUrl,
  onSendChat,
}: ChatBoxProps) {
  if (!selectedChatApplicationId) {
    return null;
  }

  return (
    <section className={styles.brandCards}>
      <h2>Campaign Chat</h2>
      <div className={styles.card}>
        <div className="space-y-2 max-h-72 overflow-auto">
          {chatMessages.length === 0 ? <p>No messages yet.</p> : null}
          {chatMessages.map((msg) => (
            <article key={msg._id} className="border rounded p-2">
              <p className="text-sm"><strong>{msg.senderRole}:</strong> {msg.message}</p>
              {msg.fileUrl ? (
                <a className="text-xs underline" href={msg.fileUrl} target="_blank" rel="noreferrer">
                  Attachment
                </a>
              ) : null}
              <p className="text-xs text-slate-500">{new Date(msg.createdAt).toLocaleString()}</p>
            </article>
          ))}
        </div>

        <form className="mt-3" onSubmit={onSendChat}>
          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="Type message"
            value={chatText}
            onChange={(event) => setChatText(event.target.value)}
          />
          <input
            className="w-full border rounded px-3 py-2 mt-2"
            placeholder="Optional file URL"
            value={chatFileUrl}
            onChange={(event) => setChatFileUrl(event.target.value)}
          />
          <button className="mt-2 bg-slate-900 text-white px-4 py-2 rounded" type="submit">
            Send
          </button>
        </form>
      </div>
    </section>
  );
}
