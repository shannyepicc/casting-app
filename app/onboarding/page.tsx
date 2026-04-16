"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Star, Mic, Music, Film, Video, PlayCircle, Camera, Tv, Users,
} from "lucide-react";
import { SlateLogo } from "@/components/slate-logo";
import type { UserType } from "@/lib/types";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [selected, setSelected] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleContinue() {
    if (!selected) return;
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      account_type: selected,
      onboarding_complete: false,
    });

    if (error) { setError(error.message); setLoading(false); return; }

    router.push("/profile/edit");
  }

  return (
    <main className="auth-page">
      <div className="auth-panel onboarding-panel">
        <div className="auth-brand">
          <SlateLogo size={34} />
        </div>

        <h2>How are you joining?</h2>
        <p className="auth-sub">Choose your role. This shapes your experience on Slate.</p>

        <div className="role-cards">
          {/* Actor */}
          <button
            className={`role-card${selected === "actor" ? " role-card-selected" : ""}`}
            onClick={() => setSelected("actor")}
            type="button"
          >
            <div className="onboarding-icon-row">
              <Star size={18} /><Mic size={18} /><Music size={18} /><Video size={18} />
            </div>
            <strong>Actor / Talent</strong>
            <p>
              Create a profile, upload your headshots and demo reels, and get
              discovered by creators and directors worldwide.
            </p>
            <div className="onboarding-talent-pills">
              <span>Actor</span><span>Host</span><span>Dancer</span>
              <span>Musician</span><span>Voice Artist</span><span>Model</span>
            </div>
          </button>

          {/* Creator */}
          <button
            className={`role-card${selected === "creator" ? " role-card-selected" : ""}`}
            onClick={() => setSelected("creator")}
            type="button"
          >
            <div className="onboarding-icon-row">
              <Film size={18} /><PlayCircle size={18} /><Tv size={18} /><Camera size={18} />
            </div>
            <strong>Creator / Director</strong>
            <p>
              Post roles for any project — films, YouTube, music videos, brand
              work, theatre, and more. Find and book talent fast.
            </p>
            <div className="onboarding-talent-pills">
              <span>Film</span><span>YouTube</span><span>Music Video</span>
              <span>TV</span><span>Brand</span><span>Podcast</span>
            </div>
          </button>

          {/* Both */}
          <button
            className={`role-card role-card-both${selected === "both" ? " role-card-selected" : ""}`}
            onClick={() => setSelected("both")}
            type="button"
          >
            <div className="onboarding-icon-row">
              <Star size={18} /><Film size={18} /><Users size={18} /><Camera size={18} />
            </div>
            <strong>Both — Actor &amp; Creator</strong>
            <p>
              You act and you create. Get full access to talent discovery,
              casting tools, and your own actor profile.
            </p>
            <div className="onboarding-talent-pills">
              <span>Full Access</span><span>Actor Profile</span>
              <span>Post Roles</span><span>Discover Talent</span>
            </div>
          </button>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button
          className="primary-button auth-submit"
          onClick={handleContinue}
          disabled={!selected || loading}
        >
          {loading ? "Setting up your account…" : "Continue →"}
        </button>
      </div>
    </main>
  );
}
