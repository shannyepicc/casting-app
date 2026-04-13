export type UserType = "actor" | "creator";

export type Profile = {
  id: string;
  account_type: UserType;
  username: string | null;
  full_name: string | null;
  bio: string | null;
  location: string | null;
  headshot_url: string | null;
  // Actor-specific
  age: number | null;
  gender: string | null;
  union_status: string | null;
  talent_type: string[];
  languages: string[];
  skills: string[];
  tags: string[];
  availability: string | null;
  // Creator-specific
  company: string | null;
  job_title: string | null;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
};

export type Media = {
  id: string;
  owner_id: string;
  media_type: "headshot" | "video";
  title: string | null;
  mux_upload_id: string | null;
  mux_asset_id: string | null;
  mux_playback_id: string | null;
  status: "pending" | "processing" | "ready" | "failed";
  duration: number | null;
  thumbnail_url: string | null;
  storage_path: string | null;
  storage_url: string | null;
  is_public: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Actor = {
  id: string;
  slug: string;
  name: string;
  ageRange: string;
  gender: string;
  location: string;
  unionStatus: string;
  bio: string;
  skills: string[];
  tags: string[];
  languages: string[];
  availability: string;
  contactEmail: string;
  quickStat: string;
  headshot: string;
  gallery: string[];
  reelUrl: string;
  auditionClips: {
    title: string;
    emotion: string;
    sceneType: string;
    duration: string;
    videoUrl: string;
  }[];
};

export type Role = {
  id: string;
  slug: string;
  title: string;
  project: string;
  createdBy: string;
  description: string;
  ageRange: string;
  gender: string;
  location: string;
  shootWindow: string;
  remote: boolean;
  tags: string[];
  requiredTraits: string[];
  rate: string;
};
