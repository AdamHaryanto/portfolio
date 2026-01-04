
export interface Project {
  id: string; // Added ID
  title: string;
  category: string;
  engine: string; // e.g., Unity, Roblox
  engineIcon?: 'unity' | 'roblox' | 'godot' | 'unreal' | 'gamemaker' | 'custom' | 'none'; // Engine logo icon
  description: string;
  role: string;
  status: 'Prototype' | 'WIP' | 'Released';
  link: string;
  image: string;
  screenshots: string[];
}

export interface Experience {
  id: string; // Added ID
  company: string;
  role: string;
  period: string;
  description: string;
  keyNotes: string;
  type: 'Work' | 'Organization'; // To distinguish styling
  image?: string; // Added image field
}

export interface Education {
  institution: string;
  degree: string;
  description: string;
  score: string;
  scoreLabel: string; // e.g., GPA or Grade
  image?: string; // Added image field
}

export interface SkillCategory {
  title: string;
  skills: string[];
}

export interface Certificate {
  id: string; // Added ID
  title: string;
  issuer: string;
  date: string; // Can be just year or full date
  image: string;
}

// New Types for Dynamic Art Portfolio
export interface ArtItem {
  id: string; // Added ID
  url: string; // Primary/first image (kept for backward compatibility)
  urls?: string[]; // Multiple images for gallery/carousel
  description?: string;
  type?: 'image' | 'video'; // Hint for rendering
}

export interface ArtCategory {
  id: string;
  title: string;
  items: ArtItem[];
}

// Contact Button Type for editable contact section
export interface ContactButton {
  id: string;
  label: string;       // e.g., "Instagram", "WhatsApp"
  displayText: string; // e.g., "@xynite.x", "+62 813 9872 1857"
  url: string;         // The link URL
  icon: 'instagram' | 'phone' | 'mail' | 'discord' | 'linkedin' | 'github' | 'link';
  variant: 'blue' | 'orange' | 'yellow' | 'green' | 'white';
}
