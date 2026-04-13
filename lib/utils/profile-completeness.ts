import type { Profile } from "@/lib/types";

export type CompletionItem = {
  label: string;
  done: boolean;
  href: string;
  points: number;
};

export type CompletenessResult = {
  score: number;
  items: CompletionItem[];
  message: string;
  tier: "critical" | "low" | "high" | "complete";
};

export function getCompleteness(
  profile: Partial<Profile>,
  mediaCount: number
): CompletenessResult {
  const items: CompletionItem[] = [
    {
      label: "Full name",
      done: !!profile.full_name?.trim(),
      href: "/profile/edit",
      points: 10,
    },
    {
      label: "Bio",
      done: !!profile.bio?.trim(),
      href: "/profile/edit",
      points: 10,
    },
    {
      label: "Headshot uploaded",
      done: !!profile.headshot_url,
      href: "/profile/edit",
      points: 20,
    },
    {
      label: "Talent type selected",
      done: (profile.talent_type?.length ?? 0) > 0,
      href: "/profile/edit",
      points: 15,
    },
    {
      label: "Skills or tags added",
      done:
        (profile.skills?.length ?? 0) > 0 || (profile.tags?.length ?? 0) > 0,
      href: "/profile/edit",
      points: 10,
    },
    {
      label: "Location set",
      done: !!profile.location?.trim(),
      href: "/profile/edit",
      points: 5,
    },
    {
      label: "At least 1 video clip",
      done: mediaCount > 0,
      href: "/profile/media",
      points: 20,
    },
    {
      label: "Availability set",
      done: !!profile.availability?.trim(),
      href: "/profile/edit",
      points: 10,
    },
  ];

  const score = items
    .filter((i) => i.done)
    .reduce((sum, i) => sum + i.points, 0);

  let tier: CompletenessResult["tier"];
  let message: string;

  if (score <= 40) {
    tier = "critical";
    message = "Your profile needs work — casting directors won't find you yet.";
  } else if (score <= 74) {
    tier = "low";
    message = "Good start — a few more details will get you discovered faster.";
  } else if (score < 100) {
    tier = "high";
    message = "Almost there — add a clip to stand out.";
  } else {
    tier = "complete";
    message = "Your profile is complete. You're fully discoverable.";
  }

  return { score, items, message, tier };
}
