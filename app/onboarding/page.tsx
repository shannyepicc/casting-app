"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { UserType } from "@/lib/types";

const roles: { type: UserType; label: string; description: string; icon: string }[] = [
  {
    type: "actor",
    label: "Actor",
    description: "Create a profile, upload your headshots and demo reels, and get discovered by creators and directors.",
    icon: "🎭"
  },
  {
    type: "creator",
    label: "Creator",
    description: "Post roles for any project — films, YouTube, music videos, brand work. Find and book talent fast.",
    icon: "🎬"
  }
];

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

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      account_type: selected,
      onboarding_complete: false
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/profile/edit");
  }

  return (
    <main className="auth-page">
      <div className="auth-panel onboarding-panel">
        <div className="auth-brand">
          <div className="brand-mark">CA</div>
          <p className="eyebrow">Casting Assistant</p>
        </div>
        <h2>How are you joining?</h2>
        <p className="auth-sub">Choose your role in the network. This shapes your experience.</p>

        <div className="role-cards">
          {roles.map((role) => (
            <button
              key={role.type}
              className={`role-card${selected === role.type ? " role-card-selected" : ""}`}
              onClick={() => setSelected(role.type)}
              type="button"
            >
              <span className="role-icon">{role.icon}</span>
              <strong>{role.label}</strong>
              <p>{role.description}</p>
            </button>
          ))}
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button
          className="primary-button auth-submit"
          onClick={handleContinue}
          disabled={!selected || loading}
        >
          {loading ? "Setting up your account…" : "Continue"}
        </button>
      </div>
    </main>
  );
}
