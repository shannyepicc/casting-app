export type UserType = "actor" | "casting_director";

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
