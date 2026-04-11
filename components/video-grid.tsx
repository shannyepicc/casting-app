"use client";

import { useEffect, useState } from "react";
import { MuxPlayer } from "@/components/mux-player";
import type { ActorMedia } from "@/lib/supabase/queries";

// If title looks like a raw filename, treat it as untitled
function cleanTitle(raw: string | null): string | null {
  if (!raw) return null;
  if (/\.[a-zA-Z0-9]{2,4}$/.test(raw.trim())) return null;
  return raw.trim();
}

// ─── Read-only modal ──────────────────────────────────────────────────────────
function ClipModal({
  clip,
  total,
  index,
  onClose,
  onPrev,
  onNext
}: {
  clip: ActorMedia;
  total: number;
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const title = cleanTitle(clip.title);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <MuxPlayer
          playbackId={clip.mux_playback_id}
          title={title ?? undefined}
          thumbnail={clip.thumbnail_url ?? undefined}
        />

        <div className="modal-meta">
          <div>
            <strong style={{ fontSize: "1.05rem" }}>{title ?? "Untitled clip"}</strong>
            {clip.duration && (
              <p className="muted-copy" style={{ fontSize: "0.84rem", margin: "4px 0 0" }}>
                {Math.round(clip.duration)}s
              </p>
            )}
          </div>

          {total > 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                className="ghost-button"
                style={{ padding: "8px 14px", fontSize: "0.84rem" }}
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
              >
                ← Prev
              </button>
              <span className="muted-copy" style={{ fontSize: "0.84rem", whiteSpace: "nowrap" }}>
                {index + 1} / {total}
              </span>
              <button
                className="ghost-button"
                style={{ padding: "8px 14px", fontSize: "0.84rem" }}
                onClick={(e) => { e.stopPropagation(); onNext(); }}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Thumbnail card ───────────────────────────────────────────────────────────
function ClipCard({ clip, onClick }: { clip: ActorMedia; onClick: () => void }) {
  const title = cleanTitle(clip.title);
  const thumb =
    clip.thumbnail_url ??
    `https://image.mux.com/${clip.mux_playback_id}/thumbnail.png`;

  return (
    <button className="clip-thumb" onClick={onClick} title={title ?? "Untitled clip"}>
      <img src={thumb} alt={title ?? "clip"} className="clip-thumb-img" />
      <div className="clip-thumb-overlay">
        <span className="clip-thumb-play">▶</span>
        <span className="clip-thumb-title">{title ?? "Untitled clip"}</span>
        {clip.duration && (
          <span className="clip-thumb-meta">{Math.round(clip.duration)}s</span>
        )}
      </div>
    </button>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────
export function VideoGrid({ media }: { media: ActorMedia[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (media.length === 0) return null;

  const selected = selectedIndex !== null ? media[selectedIndex] : null;

  function prev() {
    setSelectedIndex((i) => (i !== null ? (i - 1 + media.length) % media.length : 0));
  }

  function next() {
    setSelectedIndex((i) => (i !== null ? (i + 1) % media.length : 0));
  }

  return (
    <>
      <div className="clip-thumb-grid">
        {media.map((clip, i) => (
          <ClipCard key={clip.id} clip={clip} onClick={() => setSelectedIndex(i)} />
        ))}
      </div>

      {selected !== null && selectedIndex !== null && (
        <ClipModal
          clip={selected}
          total={media.length}
          index={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onPrev={prev}
          onNext={next}
        />
      )}
    </>
  );
}
