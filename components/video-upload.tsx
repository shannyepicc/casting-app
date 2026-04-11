"use client";

import { useRef, useState } from "react";

type UploadStatus = "idle" | "requesting" | "uploading" | "processing" | "ready" | "failed";

interface VideoUploadProps {
  onComplete: (mediaId: string) => void;
}

export function VideoUpload({ onComplete }: VideoUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setStatus("requesting");

    // 1. Get a Mux direct upload URL from our API
    const res = await fetch("/api/media/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title || file.name })
    });

    if (!res.ok) {
      const { error } = await res.json();
      setError(error ?? "Failed to get upload URL");
      setStatus("failed");
      return;
    }

    const { uploadUrl, mediaId } = await res.json();
    setStatus("uploading");

    // 2. Upload directly to Mux
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);

      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) {
          setProgress(Math.round((ev.loaded / ev.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(file);
    }).catch((err) => {
      setError(err.message);
      setStatus("failed");
      return;
    });

    if (status === "failed") return;

    // 3. Upload sent — Mux will process asynchronously
    setStatus("processing");
    setProgress(100);
    onComplete(mediaId);
    setTitle("");
    setStatus("idle");
    setProgress(0);
    if (fileRef.current) fileRef.current.value = "";
  }

  const isActive = status !== "idle" && status !== "failed";

  return (
    <div className="upload-zone">
      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        style={{ display: "none" }}
        onChange={handleFileSelect}
        disabled={isActive}
      />

      {!isActive && (
        <>
          <div className="field" style={{ marginBottom: 12 }}>
            <span>Clip title</span>
            <input
              type="text"
              placeholder='e.g. "Dramatic monologue – grief"'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="ghost-button"
            onClick={() => fileRef.current?.click()}
            style={{ width: "100%" }}
          >
            Select video file
          </button>
        </>
      )}

      {status === "requesting" && <p className="upload-status">Getting upload slot…</p>}

      {status === "uploading" && (
        <div className="upload-progress-wrap">
          <p className="upload-status">Uploading… {progress}%</p>
          <div className="upload-progress-bar">
            <div className="upload-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {status === "processing" && (
        <p className="upload-status upload-processing">
          Upload complete — video is processing. This may take a minute.
        </p>
      )}

      {status === "failed" && error && <p className="auth-error">{error}</p>}
    </div>
  );
}
