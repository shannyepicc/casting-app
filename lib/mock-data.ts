import { Actor, Role } from "@/lib/types";

const sampleReel = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4";
const sampleAudition = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4";
const sampleAuditionTwo = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4";

export const actors: Actor[] = [
  {
    id: "actor-1",
    slug: "maya-reyes",
    name: "Maya Reyes",
    ageRange: "24-30",
    gender: "Woman",
    location: "Los Angeles, CA",
    unionStatus: "Non-union",
    bio: "Warm, grounded lead with a sharp comedic switch and strong single-camera instincts. Great for college-age leads, dramedy ensembles, and emotionally layered shorts.",
    skills: ["Drama", "Comedy", "Improvisation", "Bilingual"],
    tags: ["Lead Energy", "Indie Film", "Quick Learner"],
    languages: ["English", "Spanish"],
    availability: "Available weekends + self-tapes within 24 hours",
    contactEmail: "maya@castingassistant.app",
    quickStat: "18 festival shorts • 92% callback rate",
    headshot: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80"
    ],
    reelUrl: sampleReel,
    auditionClips: [
      {
        title: "Dorm Room Breakdown",
        emotion: "Sad",
        sceneType: "Monologue",
        duration: "0:42",
        videoUrl: sampleAudition
      },
      {
        title: "Chaotic Roommate Banter",
        emotion: "Comedic",
        sceneType: "Dialogue",
        duration: "0:31",
        videoUrl: sampleAuditionTwo
      }
    ]
  },
  {
    id: "actor-2",
    slug: "julian-cross",
    name: "Julian Cross",
    ageRange: "27-34",
    gender: "Man",
    location: "Oakland, CA",
    unionStatus: "SAG Eligible",
    bio: "Naturalistic performer with athletic physicality and a calm screen presence. Excels in grounded action, brother roles, and emotional confrontation scenes.",
    skills: ["Action", "Drama", "Stunts", "Voiceover"],
    tags: ["Blue Collar", "Protective", "Intense Eyes"],
    languages: ["English"],
    availability: "Open for Bay Area local shoots",
    contactEmail: "julian@castingassistant.app",
    quickStat: "Former parkour coach • 12 branded spots",
    headshot: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=900&q=80"
    ],
    reelUrl: sampleReel,
    auditionClips: [
      {
        title: "Parking Lot Ultimatum",
        emotion: "Angry",
        sceneType: "Dialogue",
        duration: "0:36",
        videoUrl: sampleAudition
      },
      {
        title: "Brotherly Confession",
        emotion: "Vulnerable",
        sceneType: "Monologue",
        duration: "0:47",
        videoUrl: sampleAuditionTwo
      }
    ]
  },
  {
    id: "actor-3",
    slug: "nina-park",
    name: "Nina Park",
    ageRange: "19-25",
    gender: "Woman",
    location: "Berkeley, CA",
    unionStatus: "Non-union",
    bio: "Fresh-faced screen actor who reads smart, funny, and quietly rebellious. Especially strong for student productions, Gen Z leads, and tonal pivots from dry comedy to emotional sincerity.",
    skills: ["Comedy", "Drama", "Dance", "TikTok Native"],
    tags: ["College Student", "Quirky", "Fast Reader"],
    languages: ["English", "Korean"],
    availability: "Student-friendly schedule, remote self-tapes",
    contactEmail: "nina@castingassistant.app",
    quickStat: "3 web series • UC Berkeley theater",
    headshot: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80"
    ],
    reelUrl: sampleReel,
    auditionClips: [
      {
        title: "Late Night Library Scene",
        emotion: "Comedic",
        sceneType: "Dialogue",
        duration: "0:28",
        videoUrl: sampleAuditionTwo
      },
      {
        title: "Scholarship Interview",
        emotion: "Nervous",
        sceneType: "Monologue",
        duration: "0:39",
        videoUrl: sampleAudition
      }
    ]
  },
  {
    id: "actor-4",
    slug: "elias-ford",
    name: "Elias Ford",
    ageRange: "31-38",
    gender: "Man",
    location: "Remote / Atlanta, GA",
    unionStatus: "SAG-AFTRA",
    bio: "Commanding screen presence with polished delivery suited for detectives, mentors, founders, and prestige-style supporting parts.",
    skills: ["Drama", "Thriller", "Voiceover", "Dialect Work"],
    tags: ["Authority", "Prestige", "Remote Ready"],
    languages: ["English", "French"],
    availability: "Remote callbacks anytime",
    contactEmail: "elias@castingassistant.app",
    quickStat: "Network TV guest star • home studio",
    headshot: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80"
    ],
    reelUrl: sampleReel,
    auditionClips: [
      {
        title: "Interrogation Room",
        emotion: "Controlled",
        sceneType: "Dialogue",
        duration: "0:44",
        videoUrl: sampleAudition
      },
      {
        title: "Mentor Speech",
        emotion: "Inspiring",
        sceneType: "Monologue",
        duration: "0:52",
        videoUrl: sampleAuditionTwo
      }
    ]
  }
];

export const roles: Role[] = [
  {
    id: "role-1",
    slug: "college-student-lead",
    title: "College Student Lead",
    project: "Deadline Before Dawn",
    createdBy: "Aster House Pictures",
    description: "An indie feature following an overachieving student who accidentally becomes the face of a campus protest movement. Needs quick wit, vulnerability, and chemistry with ensemble cast.",
    ageRange: "18-24",
    gender: "Any",
    location: "Berkeley, CA",
    shootWindow: "May 22 - June 2",
    remote: false,
    tags: ["Coming of Age", "Comedy", "Drama"],
    requiredTraits: ["College Student", "Fast Talker", "Emotionally Open"],
    rate: "$300/day + meals + credit"
  },
  {
    id: "role-2",
    slug: "gritty-detective-supporting",
    title: "Gritty Detective",
    project: "Mercury Street",
    createdBy: "West Harbor Films",
    description: "Supporting detective role in a tense short-form thriller. Looking for someone who can project trust, suspicion, and fatigue in the same breath.",
    ageRange: "30-42",
    gender: "Any",
    location: "Remote",
    shootWindow: "June 8 - June 10",
    remote: true,
    tags: ["Thriller", "Authority", "Short Film"],
    requiredTraits: ["Commanding", "Grounded", "Subtle Tension"],
    rate: "$500 flat"
  }
];

export const featuredRole = roles[0];

export const matchActorsForRole = (role: Role) => {
  return [...actors]
    .map((actor) => {
      const tagScore = actor.tags.filter((tag) =>
        [...role.tags, ...role.requiredTraits].some((roleTag) =>
          roleTag.toLowerCase().includes(tag.toLowerCase()) ||
          tag.toLowerCase().includes(roleTag.toLowerCase())
        )
      ).length;

      const skillScore = actor.skills.filter((skill) =>
        role.tags.some((tag) => tag.toLowerCase() === skill.toLowerCase())
      ).length;

      const locationScore =
        role.remote || actor.location.toLowerCase().includes(role.location.split(",")[0].toLowerCase())
          ? 2
          : 0;

      const ageScore = actor.ageRange === role.ageRange ? 2 : 1;

      return {
        actor,
        score: tagScore * 3 + skillScore * 2 + locationScore + ageScore
      };
    })
    .sort((left, right) => right.score - left.score);
};
