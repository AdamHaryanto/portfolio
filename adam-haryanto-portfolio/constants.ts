
import { Project, Experience, Education, SkillCategory, Certificate } from './types';

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/xynite.x",
  whatsapp: "https://wa.me/6281398721857",
  email: "adamharyanto05@gmail.com",
  linkedin: "https://linkedin.com/in/adamharyanto", // Keep linkedin/itch/github as is or update if needed
  itch: "https://adamharyanto.itch.io",
  github: "https://github.com/adamharyanto",
  discord: "https://discord.gg/VxKA5gFTS7"
};

export const CERTIFICATES: Certificate[] = [
  {
    id: "cert_1",
    title: "Top 15 Gameseed 2025",
    issuer: "Gameseed",
    date: "2025",
    image: "https://picsum.photos/seed/cert1/600/400"
  },
  {
    id: "cert_2",
    title: "Unity Game Developer Course",
    issuer: "Unity / Udemy",
    date: "2024",
    image: "https://picsum.photos/seed/cert2/600/400"
  }
];

export const EXPERIENCES: Experience[] = [
  {
    id: "exp_1",
    company: "Xynite Studio",
    role: "Founder & Developer",
    period: "2023 - Present",
    description: "Built a small indie game studio. Lead Project Manager, Game Artist (3D/Technical), and Game Programmer. Focusing on gameplay mechanics and implementation.",
    keyNotes: "Project Manager, 3D Artist, Programmer C# & Lua",
    type: "Work",
    image: "https://picsum.photos/seed/xynite/100/100"
  },
  {
    id: "exp_2",
    company: "Game Technology Student Union",
    role: "Digital Creative",
    period: "2024 - 2026",
    description: "Member of the daily executive board (Digital Creative Division). Responsible for creating designs, logos, GSM, managing social media, and event organization.",
    keyNotes: "Graphic Design, Teamwork, Social Media Manager",
    type: "Organization",
    image: "https://picsum.photos/seed/himagatek/100/100"
  },
  {
    id: "exp_3",
    company: "Freelance 3D Modeler",
    role: "3D Asset Modeler",
    period: "2019 - 2023",
    description: "Created assets for Roblox and non-game projects. Delivered assets meeting artistic vision and technical standards.",
    keyNotes: "3D Modeling, Client Communication, Adaptability",
    type: "Work",
    image: "https://picsum.photos/seed/freelance/100/100"
  },
  {
    id: "exp_4",
    company: "Institut Digital Bisnis Indonesia",
    role: "Digital Creative Intern",
    period: "2021 - 2022",
    description: "Part of the Creative Team. Roles included social media management, graphic design, video editing, videography, and event documentation.",
    keyNotes: "Graphic Design, Video Editing, Content Creation",
    type: "Work",
    image: "https://picsum.photos/seed/idb/100/100"
  }
];

export const EDUCATION: Education[] = [
  {
    institution: "Politeknik Negeri Media Kreatif",
    degree: "D4 Game Technology (Applied Bachelor)",
    description: "Majoring in Game Technology. Focusing on game development, game design, C# programming in Unity, 3D modeling, and pixel art.",
    score: "3.89",
    scoreLabel: "*Current GPA",
    image: "https://picsum.photos/seed/polimedia/100/100"
  },
  {
    institution: "Ekonomika Vocational High School",
    degree: "Visual Communication Design",
    description: "Learned graphic design, 3D modeling, video editing, animation, and illustration. Consistently ranked first in class.",
    score: "86,24",
    scoreLabel: "Final Grade",
    image: "https://picsum.photos/seed/smk/100/100"
  }
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    title: "Hard Skills",
    skills: ["3D Modeling", "UV Mapping", "2D Art & Pixel Art", "Texturing", "C# & Lua Programming", "Technical Artist", "Rigging", "Animation", "Graphic Design", "Video Editing", "Game Design"]
  },
  {
    title: "Soft Skills",
    skills: ["Teamwork", "Adaptability", "Tech-Savvy", "Problem Solving", "Creativity", "Communication Skills"]
  },
  {
    title: "Tools",
    skills: ["Blender", "Adobe Photoshop & Illustrator", "Unity Engine", "Roblox Studio", "Aseprite", "Github"]
  }
];

export const PROJECTS: Project[] = [
  {
    id: "proj_1",
    title: "Endless Bus",
    category: "Unity Game",
    engine: "Unity",
    description: "A 2D side-scroller developed during GAMESEED 2025 Game Jam (Top 15). Fast-paced endless adventure.",
    role: "Game Programmer & Designer",
    status: "Prototype",
    link: "https://xynite.itch.io/endlessbus",
    image: "https://picsum.photos/seed/endlessbus/600/400",
    screenshots: ["https://picsum.photos/seed/endlessbus1/300/200", "https://picsum.photos/seed/endlessbus2/300/200"]
  },
  {
    id: "proj_2",
    title: "Weird World",
    category: "Unity Game",
    engine: "Unity",
    description: "Built for Brackeys Game Jam 2025.1. A world that changes the longer players continue to play.",
    role: "Game Artist & Programmer",
    status: "Prototype",
    link: "https://xynite.itch.io/weirdworld",
    image: "https://picsum.photos/seed/weirdworld/600/400",
    screenshots: ["https://picsum.photos/seed/weird1/300/200", "https://picsum.photos/seed/weird2/300/200"]
  },
  {
    id: "proj_3",
    title: "Folktale Odyssey",
    category: "Unity Game",
    engine: "Unity",
    description: "Narrative-driven adventure game based on Indonesian folklore. Developed as a college assignment.",
    role: "Game Artist & Designer",
    status: "Prototype",
    link: "https://xynite.itch.io/folktale-odyssey",
    image: "https://picsum.photos/seed/folktale/600/400",
    screenshots: ["https://picsum.photos/seed/folk1/300/200", "https://picsum.photos/seed/folk2/300/200"]
  },
  {
    id: "proj_4",
    title: "Seed & Sell",
    category: "Mobile Game",
    engine: "Unity",
    description: "Simple mobile farming simulation game where players inherit an abandoned farm.",
    role: "3D & UI Artist, Programmer",
    status: "Prototype",
    link: "https://adamharyanto.itch.io/seedsell",
    image: "https://picsum.photos/seed/seedsell/600/400",
    screenshots: ["https://picsum.photos/seed/seed1/300/200", "https://picsum.photos/seed/seed2/300/200"]
  },
   {
    id: "proj_5",
    title: "Paradrinks",
    category: "Studio Project",
    engine: "Unity",
    description: "Mobile simulation game where players run a beverage seller van. Currently in development under Xynite Studio.",
    role: "Designer, Programmer, Artist",
    status: "WIP",
    link: "#",
    image: "https://picsum.photos/seed/paradrinks/600/400",
    screenshots: ["https://picsum.photos/seed/para1/300/200", "https://picsum.photos/seed/para2/300/200"]
  },
];

export const PORTFOLIO_3D = [
  "https://picsum.photos/seed/3d1/400/300",
  "https://picsum.photos/seed/3d2/400/300",
  "https://picsum.photos/seed/3d3/400/300",
  "https://picsum.photos/seed/3d4/400/300",
  "https://picsum.photos/seed/3d5/400/300",
  "https://picsum.photos/seed/3d6/400/300",
];

export const PORTFOLIO_2D = [
  "https://picsum.photos/seed/2d1/300/400", // Portrait
  "https://picsum.photos/seed/2d2/300/400",
  "https://picsum.photos/seed/2d3/300/400",
];
