"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { VideoUpload } from "@/components/video-upload";
import { MuxPlayer } from "@/components/mux-player";
import { createClient } from "@/lib/supabase/client";
import type { Media } from "@/lib/types";

const STATUS_COLORS: Record<Media["status"], string> = {
  pending: "var(--muted)",
  processing: "var(--accent)",
  ready: "#2d7a3b",
  failed: "#c0392b"
};

// ─── Expanded modal ───────────────────────────────────────────────────────────
function ClipModal({
  video,
  onClose,
  onTitleSave,
  onTogglePublic,
  onToggleFeatured,
  onDelete
}: {
  video: Media;
  onClose: () => void;
  onTitleSave: (id: string, title: string) => void;
  onTogglePublic: (video: Media) => void;
  onToggleFeatured: (video: Media) => void;
  onDelete: (id: string) => void;
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(video.title ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTitle) inputRef.current?.focus();
  }, [editingTitle]);

  // Close on Escape or backdrop click
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function commitTitle() {
    setEditingTitle(false);
    const trimmed = titleValue.trim();
    if (trimmed !== (video.title ?? "")) onTitleSave(video.id, trimmed);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        {/* Player */}
        {video.status === "ready" && video.mux_playback_id ? (
          <MuxPlayer
            playbackId={video.mux_playback_id}
            title={video.title ?? undefined}
            thumbnail={video.thumbnail_url ?? undefined}
          />
        ) : (
          <div className="modal-placeholder">
            <span style={{ color: STATUS_COLORS[video.status], fontWeight: 600 }}>
              {video.status === "processing" ? "Processing…" : video.status === "pending" ? "Pending" : "Failed"}
            </span>
            {(video.status === "pending" || video.status === "processing") && (
              <p className="muted-copy" style={{ margin: "8px 0 0", fontSize: "0.9rem" }}>
                Your video will be playable once processing completes.
              </p>
            )}
            {(video.status === "pending" || video.status === "processing") && (
              <div className="processing-spinner" style={{ margin: "14px auto 0" }} />
            )}
          </div>
        )}

        {/* Title + meta */}
        <div className="modal-meta">
          <div style={{ flex: 1 }}>
            {editingTitle ? (
              <input
                ref={inputRef}
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitTitle();
                  if (e.key === "Escape") { setTitleValue(video.title ?? ""); setEditingTitle(false); }
                }}
                placeholder="Add a title…"
                style={{
                  font: "inherit", fontWeight: 600, fontSize: "1.1rem",
                  background: "rgba(255,255,255,0.08)", border: "1px solid var(--line-strong)",
                  borderRadius: 10, padding: "5px 12px", color: "var(--text)", width: "100%"
                }}
              />
            ) : (
              <button
                onClick={() => setEditingTitle(true)}
                style={{
                  font: "inherit", fontWeight: 600, fontSize: "1.1rem",
                  background: "none", border: "none", padding: 0, cursor: "text",
                  color: "var(--text)", display: "flex", alignItems: "center", gap: 8
                }}
                title="Click to edit title"
              >
                {video.title || <span style={{ color: "var(--muted)", fontWeight: 400 }}>Untitled clip</span>}
                <span style={{ fontSize: "0.74rem", color: "var(--muted)", fontWeight: 400 }}>✎</span>
              </button>
            )}
            <p className="muted-copy" style={{ fontSize: "0.85rem", margin: "4px 0 0" }}>
              {video.duration ? `${Math.round(video.duration)}s` : "—"} •{" "}
              <span style={{ color: STATUS_COLORS[video.status] }}>
                {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
              </span>
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flexShrink: 0 }}>
            <button className="ghost-button" style={{ fontSize: "0.84rem", padding: "8px 14px" }}
              onClick={() => onTogglePublic(video)}>
              {video.is_public ? "Public" : "Private"}
            </button>
            <button className="ghost-button"
              style={{
                fontSize: "0.84rem", padding: "8px 14px",
                background: video.is_featured ? "var(--accent-soft)" : undefined,
                borderColor: video.is_featured ? "rgba(182,90,49,0.3)" : undefined
              }}
              onClick={() => onToggleFeatured(video)}>
              {video.is_featured ? "★ Featured" : "☆ Feature"}
            </button>
            <button className="ghost-button"
              style={{ fontSize: "0.84rem", padding: "8px 14px", color: "#c0392b" }}
              onClick={() => { onDelete(video.id); onClose(); }}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Thumbnail card ───────────────────────────────────────────────────────────
function ClipCard({ video, onClick }: { video: Media; onClick: () => void }) {
  const thumb = video.thumbnail_url
    ?? (video.mux_playback_id ? `https://image.mux.com/${video.mux_playback_id}/thumbnail.png` : null);

  return (
    <button className="clip-thumb" onClick={onClick} title={video.title ?? "Untitled clip"}>
      {thumb ? (
        <img src={thumb} alt={video.title ?? "clip"} className="clip-thumb-img" />
      ) : (
        <div className="clip-thumb-placeholder">
          {(video.status === "pending" || video.status === "processing") && (
            <div className="processing-spinner" />
          )}
          <span style={{ color: STATUS_COLORS[video.status], fontSize: "0.8rem", fontWeight: 600, marginTop: 8 }}>
            {video.status === "processing" ? "Processing…" : video.status === "pending" ? "Pending" : "Failed"}
          </span>
        </div>
      )}

      {/* Hover overlay */}
      <div className="clip-thumb-overlay">
        <span className="clip-thumb-title">{video.title || "Untitled clip"}</span>
        {video.status === "ready" && (
          <span className="clip-thumb-play">▶</span>
        )}
        <span className="clip-thumb-meta">
          {video.duration ? `${Math.round(video.duration)}s` : ""}
          {video.is_featured ? " · ★" : ""}
          {!video.is_public ? " · Private" : ""}
        </span>
      </div>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MediaPage() {
  const router = useRouter();
  const supabase = createClient();
  const [videos, setVideos] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [isActor, setIsActor] = useState(false);
  const [selected, setSelected] = useState<Media | null>(null);

  const fetchVideos = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    const { data: profile } = await supabase
      .from("profiles").select("account_type").eq("id", user.id).single();
    setIsActor(profile?.account_type === "actor");

    const { data } = await supabase
      .from("media").select("*").eq("owner_id", user.id)
      .eq("media_type", "video").order("created_at", { ascending: false });

    setVideos(data ?? []);
    setLoading(false);
  }, []);

  const syncPending = useCallback(async () => {
    await fetch("/api/media/sync", { method: "POST" });
    await fetchVideos();
  }, [fetchVideos]);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  useEffect(() => {
    const hasProcessing = videos.some((v) => v.status === "pending" || v.status === "processing");
    if (!hasProcessing) return;
    const interval = setInterval(syncPending, 4000);
    return () => clearInterval(interval);
  }, [videos, syncPending]);

  // Keep selected video in sync with latest data
  useEffect(() => {
    if (selected) {
      const updated = videos.find((v) => v.id === selected.id);
      if (updated) setSelected(updated);
    }
  }, [videos]);

  async function handleTitleSave(id: string, title: string) {
    await supabase.from("media").update({ title: title || null }).eq("id", id);
    setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, title: title || null } : v)));
  }

  async function handleDelete(id: string) {
    await supabase.from("media").delete().eq("id", id);
    setVideos((prev) => prev.filter((v) => v.id !== id));
  }

  async function handleTogglePublic(video: Media) {
    await supabase.from("media").update({ is_public: !video.is_public }).eq("id", video.id);
    setVideos((prev) => prev.map((v) => (v.id === video.id ? { ...v, is_public: !v.is_public } : v)));
  }

  async function handleToggleFeatured(video: Media) {
    await supabase.from("media").update({ is_featured: !video.is_featured }).eq("id", video.id);
    setVideos((prev) => prev.map((v) => (v.id === video.id ? { ...v, is_featured: !v.is_featured } : v)));
  }

  return (
    <AppShell
      eyebrow="Media Library"
      title="Your Videos"
      actions={
        <button className="ghost-button" onClick={() => router.push("/profile/edit")}>
          ← Back to profile
        </button>
      }
    >
      <div className="profile-layout">
        {/* Upload panel */}
        {isActor && (
          <div className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Upload</p>
                <h3>Add a new clip</h3>
              </div>
              <span className="muted-copy">Videos upload directly to Mux for fast processing.</span>
            </div>
            <div style={{ marginTop: 18 }}>
              <VideoUpload onComplete={fetchVideos} />
            </div>
          </div>
        )}

        {/* Thumbnail grid */}
        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Library</p>
              <h3>{loading ? "Loading…" : `${videos.length} clip${videos.length !== 1 ? "s" : ""}`}</h3>
            </div>
          </div>

          {!loading && videos.length === 0 && (
            <p className="muted-copy" style={{ marginTop: 16 }}>
              No videos yet. Upload your first clip above.
            </p>
          )}

          {videos.length > 0 && (
            <div className="clip-thumb-grid">
              {videos.map((video) => (
                <ClipCard key={video.id} video={video} onClick={() => setSelected(video)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expanded modal */}
      {selected && (
        <ClipModal
          video={selected}
          onClose={() => setSelected(null)}
          onTitleSave={handleTitleSave}
          onTogglePublic={handleTogglePublic}
          onToggleFeatured={handleToggleFeatured}
          onDelete={handleDelete}
        />
      )}
    </AppShell>
  );
}
