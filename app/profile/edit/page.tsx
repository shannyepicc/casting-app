"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { TagInput } from "@/components/tag-input";
import { createClient } from "@/lib/supabase/client";
import { toUsername, toUsernameWithSuffix } from "@/lib/utils/username";
import type { Profile } from "@/lib/types";

const UNION_OPTIONS = ["SAG-AFTRA", "AEA", "Non-Union", "Fi-Core"];
const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Other", "Prefer not to say"];
const TALENT_TYPES = [
  "Actor",
  "Host / Presenter",
  "Dancer",
  "Musician",
  "Voice Artist",
  "Model",
  "Content Creator",
  "Background / Extra",
];

export default function ProfileEditPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [accountType, setAccountType] = useState<"actor" | "creator" | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingHeadshot, setUploadingHeadshot] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();

      if (data) {
        setProfile(data);
        setAccountType(data.account_type);
      } else {
        // New user — redirect to onboarding if no profile yet
        router.push("/onboarding");
      }
    }
    load();
  }, []);

  function set(field: keyof Profile, value: unknown) {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }

  function setList(field: keyof Profile, raw: string) {
    set(
      field,
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );
  }

  async function handleHeadshotUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHeadshot(true);
    setError(null);

    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return;

    const ext = file.name.split(".").pop();
    const path = `${user.id}/headshot.${ext}`;

    const { error: uploadError } = await supabase.storage.from("headshots").upload(path, file, {
      upsert: true,
      contentType: file.type
    });

    if (uploadError) {
      setError(uploadError.message);
      setUploadingHeadshot(false);
      return;
    }

    const {
      data: { publicUrl }
    } = supabase.storage.from("headshots").getPublicUrl(path);

    set("headshot_url", publicUrl);
    setUploadingHeadshot(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return;

    // Auto-generate a unique username if this actor doesn't have one yet
    let updates: Partial<Profile> = { ...profile, onboarding_complete: true };

    if (!profile.username && profile.full_name && profile.account_type === "actor") {
      const base = toUsername(profile.full_name);

      // Find the first available username: base → base-1 → base-2 → ...
      let candidate = base;
      let attempt = 0;
      const MAX_ATTEMPTS = 20;

      while (attempt < MAX_ATTEMPTS) {
        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", candidate)
          .maybeSingle();

        if (!existing) break; // slot is free

        attempt++;
        candidate = toUsernameWithSuffix(base, attempt);
      }

      updates.username = candidate;
    }

    const { error: saveError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }

    // Reflect the saved username in local state
    if (updates.username) set("username", updates.username);

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setSaving(false);
  }

  if (!accountType) {
    return (
      <AppShell eyebrow="Profile" title="Loading…">
        <div />
      </AppShell>
    );
  }

  return (
    <AppShell
      eyebrow={accountType === "actor" ? "Actor Profile" : "Creator Profile"}
      title="Edit Profile"
      actions={
        <button className="ghost-button" onClick={() => router.push("/profile/media")}>
          Manage Media
        </button>
      }
    >
      <form className="form-layout" onSubmit={handleSave}>
        <div className="role-form">
          {/* Headshot */}
          <div className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Photo</p>
                <h3>Headshot</h3>
              </div>
              {profile.headshot_url && (
                <img
                  src={profile.headshot_url}
                  alt="Headshot preview"
                  style={{ width: 72, height: 72, borderRadius: 14, objectFit: "cover" }}
                />
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={handleHeadshotUpload}
            />
            <button
              type="button"
              className="ghost-button"
              onClick={() => fileRef.current?.click()}
              disabled={uploadingHeadshot}
              style={{ marginTop: 12 }}
            >
              {uploadingHeadshot ? "Uploading…" : profile.headshot_url ? "Replace headshot" : "Upload headshot"}
            </button>
          </div>

          {/* Basic info */}
          <div className="panel">
            <p className="eyebrow">Basic Info</p>
            <h3>About you</h3>
            <div className="role-form" style={{ marginTop: 18 }}>
              <div className="field">
                <span>Full name</span>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={profile.full_name ?? ""}
                  onChange={(e) => set("full_name", e.target.value)}
                />
              </div>
              <div className="field">
                <span>Location</span>
                <input
                  type="text"
                  placeholder="City, State"
                  value={profile.location ?? ""}
                  onChange={(e) => set("location", e.target.value)}
                />
              </div>
              <div className="field">
                <span>Bio</span>
                <textarea
                  rows={4}
                  placeholder="A short bio about yourself…"
                  value={profile.bio ?? ""}
                  onChange={(e) => set("bio", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Actor-specific fields */}
          {accountType === "actor" && (
            <div className="panel">
              <p className="eyebrow">Actor Details</p>
              <h3>Your acting profile</h3>
              <div className="role-form" style={{ marginTop: 18 }}>
                <div className="field">
                  <span className="field-label">Talent Type <span className="muted-copy" style={{ fontWeight: 400 }}>(select all that apply)</span></span>
                  <div className="pill-select" style={{ marginTop: 8 }}>
                    {TALENT_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={(profile.talent_type ?? []).includes(t) ? "pill-option active" : "pill-option"}
                        onClick={() => {
                          const current = profile.talent_type ?? [];
                          const updated = current.includes(t)
                            ? current.filter((x) => x !== t)
                            : [...current, t];
                          set("talent_type", updated);
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-grid">
                  <div className="field">
                    <span>Age</span>
                    <input
                      type="number"
                      placeholder="e.g. 28"
                      min={16}
                      max={99}
                      value={profile.age ?? ""}
                      onChange={(e) => set("age", e.target.value ? Number(e.target.value) : null)}
                    />
                  </div>
                  <div className="field">
                    <span>Gender</span>
                    <select
                      value={profile.gender ?? ""}
                      onChange={(e) => set("gender", e.target.value)}
                      style={{ borderRadius: 18, border: "1px solid var(--line)", padding: "14px 16px", background: "rgba(255,255,255,0.06)", color: "var(--text)" }}
                    >
                      <option value="">Select…</option>
                      {GENDER_OPTIONS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <span>Union status</span>
                    <select
                      value={profile.union_status ?? ""}
                      onChange={(e) => set("union_status", e.target.value)}
                      style={{ borderRadius: 18, border: "1px solid var(--line)", padding: "14px 16px", background: "rgba(255,255,255,0.06)", color: "var(--text)" }}
                    >
                      <option value="">Select…</option>
                      {UNION_OPTIONS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <span>Availability</span>
                    <input
                      type="text"
                      placeholder="e.g. Available from June"
                      value={profile.availability ?? ""}
                      onChange={(e) => set("availability", e.target.value)}
                    />
                  </div>
                </div>
                <div className="field">
                  <span>Languages</span>
                  <TagInput
                    value={profile.languages ?? []}
                    onChange={(tags) => set("languages", tags)}
                    placeholder="English, Spanish… press Space to add"
                  />
                </div>
                <div className="field">
                  <span>Skills</span>
                  <TagInput
                    value={profile.skills ?? []}
                    onChange={(tags) => set("skills", tags)}
                    placeholder="Stage combat, Improv… press Space to add"
                  />
                </div>
                <div className="field">
                  <span>Tags</span>
                  <TagInput
                    value={profile.tags ?? []}
                    onChange={(tags) => set("tags", tags)}
                    placeholder="Dramatic, comedic… press Space to add"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Casting director-specific fields */}
          {accountType === "creator" && (
            <div className="panel">
              <p className="eyebrow">Director Details</p>
              <h3>Your company profile</h3>
              <div className="role-form" style={{ marginTop: 18 }}>
                <div className="form-grid">
                  <div className="field">
                    <span>Company / Studio</span>
                    <input
                      type="text"
                      placeholder="e.g. Imagine Entertainment"
                      value={profile.company ?? ""}
                      onChange={(e) => set("company", e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <span>Your title</span>
                    <input
                      type="text"
                      placeholder="e.g. Senior Casting Director"
                      value={profile.job_title ?? ""}
                      onChange={(e) => set("job_title", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button className="primary-button" type="submit" disabled={saving} style={{ width: "fit-content" }}>
            {saving ? "Saving…" : saved ? "Saved!" : "Save profile"}
          </button>
        </div>

        {/* Sidebar */}
        <div className="sticky-panel" style={{ display: "grid", gap: 16 }}>
          {/* Public profile URL — shown once username is set */}
          {profile.username && accountType === "actor" && (
            <div className="panel">
              <p className="eyebrow">Your public profile</p>
              <h3 style={{ fontSize: "1.1rem" }}>Shareable link</h3>
              <a
                href={`/actors/${profile.username}`}
                target="_blank"
                rel="noreferrer"
                className="profile-url-link"
              >
                /actors/{profile.username}
              </a>
              <p className="muted-copy" style={{ marginTop: 8, fontSize: "0.86rem" }}>
                This is what casting directors see. Share it directly.
              </p>
            </div>
          )}

          <div className="panel">
            <p className="eyebrow">Next step</p>
            <h3>Add your media</h3>
            <p className="muted-copy" style={{ marginTop: 8 }}>
              After saving your profile, head to <strong>Manage Media</strong> to upload your demo reel and audition clips.
            </p>
            <button
              type="button"
              className="ghost-button"
              onClick={() => router.push("/profile/media")}
              style={{ marginTop: 16 }}
            >
              Go to media →
            </button>
          </div>
        </div>
      </form>
    </AppShell>
  );
}
