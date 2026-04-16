"use client";

import { useRef, useState, useTransition } from "react";
import { createPost } from "@/app/actions/posts";
import type { UserType } from "@/lib/types";

const ANNOUNCEMENT_TAGS = [
  { value: "wrapped",              label: "🎬 Wrapped" },
  { value: "in_production",        label: "🎥 In Production" },
  { value: "seeking_collaborator", label: "🤝 Seeking Collaborator" },
  { value: "available",            label: "✅ Available for Work" },
];

export function ComposeBar({ accountType }: { accountType: UserType }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"update" | "announcement">("update");
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(formRef.current!);
    startTransition(async () => {
      try {
        await createPost(fd);
        setBody("");
        setType("update");
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="compose-bar">
      {!open ? (
        <button
          className="compose-bar-trigger"
          onClick={() => setOpen(true)}
          type="button"
        >
          <span className="compose-bar-placeholder">Share an update, announcement, or project news…</span>
          <span className="compose-bar-post-btn">Post</span>
        </button>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit} className="compose-bar-form">
          {/* Type selector */}
          <div className="compose-type-row">
            <button
              type="button"
              className={`compose-type-btn${type === "update" ? " active" : ""}`}
              onClick={() => setType("update")}
            >
              Update
            </button>
            <button
              type="button"
              className={`compose-type-btn${type === "announcement" ? " active" : ""}`}
              onClick={() => setType("announcement")}
            >
              Announcement
            </button>
          </div>

          <input type="hidden" name="type" value={type} />

          {/* Announcement tag picker */}
          {type === "announcement" && (
            <div className="compose-tag-row">
              {ANNOUNCEMENT_TAGS.map((t) => (
                <label key={t.value} className="compose-tag-label">
                  <input type="radio" name="tag" value={t.value} defaultChecked={t.value === "wrapped"} />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
          )}

          {/* Text area */}
          <textarea
            name="body"
            className="compose-textarea"
            placeholder={
              type === "update"
                ? "What are you working on?"
                : "Tell the network what's happening…"
            }
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            required
          />

          {error && <p style={{ color: "var(--accent)", fontSize: "0.85rem", margin: 0 }}>{error}</p>}

          <div className="compose-actions">
            <button
              type="button"
              className="ghost-button"
              style={{ fontSize: "0.85rem", padding: "8px 16px" }}
              onClick={() => { setOpen(false); setBody(""); }}
            >
              Cancel
            </button>
            <button
              className="primary-button"
              type="submit"
              disabled={isPending || !body.trim()}
              style={{ fontSize: "0.85rem", padding: "8px 20px" }}
            >
              {isPending ? "Posting…" : "Post"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
