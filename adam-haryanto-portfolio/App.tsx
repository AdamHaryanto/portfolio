import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Download, Upload, ExternalLink, Mail, Phone, Instagram, Linkedin, Github, Pencil, RotateCcw, Check, Plus, Trash2, Ban, Send, Link as LinkIcon, ChevronDown, Settings, Video, AlertTriangle, Moon, Sun } from 'lucide-react';
import Section from './components/Section';
import Card from './components/Card';
import Button from './components/Button';
import SearchHeader from './components/SearchHeader';
import EditableImage from './components/EditableImage';
import EditableMedia from './components/EditableMedia';
import EditableText from './components/EditableText';
import IntroOverlay from './components/IntroOverlay';
import BackgroundAnimation from './components/BackgroundAnimation';
import ThumbnailScrollContainer from './components/ThumbnailScrollContainer';
import {
  EXPERIENCES,
  EDUCATION,
  SKILL_CATEGORIES,
  PROJECTS,
  PORTFOLIO_3D,
  PORTFOLIO_2D,
  SOCIAL_LINKS,
  CERTIFICATES,
  CONTACT_BUTTONS
} from './constants';
import { SkillCategory, Project, Experience, Certificate, ArtCategory, ArtItem, ContactButton } from './types';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [portfolioDropdownOpen, setPortfolioDropdownOpen] = useState(false);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  // Session Management
  const [appKey, setAppKey] = useState(0);

  // Dynamic Data States - Initialize from localStorage if available
  const [dynamicSkills, setDynamicSkills] = useState<SkillCategory[]>(() => {
    try {
      const saved = localStorage.getItem('user_skills');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return SKILL_CATEGORIES;
  });

  const [dynamicProjects, setDynamicProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('user_projects');
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('Loaded projects from localStorage:', parsed.map((p: Project) => ({ id: p.id, screenshots: p.screenshots?.length || 0 })));
        return parsed;
      }
    } catch (e) { console.error(e); }
    return PROJECTS;
  });

  const [dynamicExperiences, setDynamicExperiences] = useState<Experience[]>(() => {
    try {
      const saved = localStorage.getItem('user_experiences');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return EXPERIENCES;
  });

  const [dynamicCertificates, setDynamicCertificates] = useState<Certificate[]>(() => {
    try {
      const saved = localStorage.getItem('user_certificates');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return CERTIFICATES;
  });

  const [dynamicContactButtons, setDynamicContactButtons] = useState<ContactButton[]>(() => {
    try {
      const saved = localStorage.getItem('user_contact_buttons');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return CONTACT_BUTTONS;
  });

  const [artCategories, setArtCategories] = useState<ArtCategory[]>(() => {
    try {
      const saved = localStorage.getItem('user_art_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('Loaded art categories from localStorage:', parsed.length, 'categories');
        return parsed;
      }
    } catch (e) { console.error(e); }
    // Default values if nothing in localStorage
    return [
      {
        id: '3d',
        title: '3D Portfolio',
        items: PORTFOLIO_3D.map((url, i) => ({ id: `3d_init_${i}`, url, type: 'image' }))
      },
      {
        id: '2d',
        title: '2D Portfolio',
        items: PORTFOLIO_2D.map((url, i) => ({ id: `2d_init_${i}`, url, type: 'image' }))
      }
    ];
  });

  // Modal State
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // Helper to ensure IDs exist
  const ensureIds = (list: any[], prefix: string) => {
    return list.map((item, i) => {
      if (!item.id) {
        return { ...item, id: `${prefix}_${Date.now()}_${i}` };
      }
      return item;
    });
  };

  // Migration logic for old art portfolio structure (run once)
  useEffect(() => {
    const savedArt = localStorage.getItem('user_art_categories');
    if (!savedArt) {
      // Migration logic for old structure
      const old3D = localStorage.getItem('user_portfolio_3d');
      const old2D = localStorage.getItem('user_portfolio_2d');
      if (old3D || old2D) {
        setArtCategories(prevCats => {
          const newCats = [...prevCats];
          if (old3D) { try { newCats[0].items = JSON.parse(old3D).map((u: string, i: number) => ({ id: `3d_mig_${i}`, url: u, type: 'image' })); } catch (e) { } }
          if (old2D) { try { newCats[1].items = JSON.parse(old2D).map((u: string, i: number) => ({ id: `2d_mig_${i}`, url: u, type: 'image' })); } catch (e) { } }
          localStorage.setItem('user_art_categories', JSON.stringify(newCats));
          return newCats;
        });
      }
    }
  }, []);

  const save = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

  // --- EDIT MODE LOGIC ---

  const startEditMode = () => {
    // 1. Create a full snapshot of current state & local storage
    // We use JSON serialization to deep copy everything accurately
    const snapshot: any = {
      skills: JSON.parse(JSON.stringify(dynamicSkills)),
      projects: JSON.parse(JSON.stringify(dynamicProjects)),
      experiences: JSON.parse(JSON.stringify(dynamicExperiences)),
      certificates: JSON.parse(JSON.stringify(dynamicCertificates)),
      artCategories: JSON.parse(JSON.stringify(artCategories)),
      contactButtons: JSON.parse(JSON.stringify(dynamicContactButtons)),
      localStorage: {}
    };

    // Backup all relevant keys (user content + user data arrays)
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('text_') || key.startsWith('img_') || key.startsWith('media_') || key.startsWith('user_')) {
        snapshot.localStorage[key] = localStorage.getItem(key);
      }
    });

    // 2. Save snapshot to Session Storage (More robust than State)
    try {
      sessionStorage.setItem('portfolio_backup', JSON.stringify(snapshot));
      setIsEditMode(true);

      // 3. Notify user
      setTimeout(() => {
        alert("ACCESS GRANTED: Developer Mode Activated!\n\nClick 'Done' to save changes.\nClick 'Cancel' (Red Icon) to undo this session.");
      }, 100);
    } catch (e) {
      console.error("Backup failed", e);
      alert("Warning: Could not create backup (Storage full?). Cancel functionality might be limited.");
      setIsEditMode(true);
    }
  };

  const cancelEditMode = () => {
    if (!window.confirm("Are you sure you want to cancel? All changes in this session will be lost.")) {
      return;
    }

    const backupStr = sessionStorage.getItem('portfolio_backup');

    // Fallback if backup data is missing
    if (!backupStr) {
      alert("No backup found for this session. Exiting Edit Mode without restoring.");
      setIsEditMode(false);
      window.location.reload();
      return;
    }

    try {
      const snap = JSON.parse(backupStr);

      // 1. Clean up new keys added during session (keys that didn't exist before edit mode)
      Object.keys(localStorage).forEach(key => {
        if ((key.startsWith('text_') || key.startsWith('img_') || key.startsWith('media_') || key.startsWith('user_')) && !snap.localStorage.hasOwnProperty(key)) {
          localStorage.removeItem(key);
        }
      });

      // 2. Restore all backed up keys to their original values
      Object.entries(snap.localStorage).forEach(([key, value]) => {
        if (value === null || value === undefined) {
          // Key didn't exist before, remove it
          localStorage.removeItem(key);
        } else if (typeof value === 'string') {
          localStorage.setItem(key, value);
        }
      });

      // 3. Also restore the data arrays explicitly to ensure consistency
      if (snap.skills) save('user_skills', snap.skills);
      if (snap.projects) save('user_projects', snap.projects);
      if (snap.experiences) save('user_experiences', snap.experiences);
      if (snap.certificates) save('user_certificates', snap.certificates);
      if (snap.artCategories) save('user_art_categories', snap.artCategories);
      if (snap.contactButtons) save('user_contact_buttons', snap.contactButtons);

      // 4. Clear backup
      sessionStorage.removeItem('portfolio_backup');

    } catch (e) {
      console.error("Error restoring backup:", e);
    }

    // 5. Force Full Reload to ensure total reset of state and images
    window.location.reload();
  };

  const finishEditMode = () => {
    // Just clear the backup, changes are already in localStorage
    sessionStorage.removeItem('portfolio_backup');
    setIsEditMode(false);
  };

  const handleFactoryReset = () => {
    if (window.confirm("FACTORY RESET: Are you sure? This will wipe ALL data and return to the original portfolio.")) {
      window.dispatchEvent(new Event('reset-images'));
      window.dispatchEvent(new Event('reset-data'));

      const keys = ['user_skills', 'user_projects', 'user_experiences', 'user_certificates', 'user_art_categories', 'user_portfolio_3d', 'user_portfolio_2d'];
      keys.forEach(k => localStorage.removeItem(k));
      sessionStorage.removeItem('portfolio_backup');

      window.location.reload();
    }
  };

  // Export all portfolio data as JSON file for permanent storage
  const exportPortfolioData = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      version: "1.0",
      data: {
        skills: dynamicSkills,
        projects: dynamicProjects,
        experiences: dynamicExperiences,
        certificates: dynamicCertificates,
        artCategories: artCategories,
        contactButtons: dynamicContactButtons,
      },
      // Also include any localStorage image data
      images: {} as Record<string, string>,
    };

    // Collect all image data from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('img_') || key.startsWith('media_'))) {
        const value = localStorage.getItem(key);
        if (value) {
          exportData.images[key] = value;
        }
      }
    }

    // Create and download the JSON file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Data portfolio berhasil di-export! File JSON telah diunduh.\n\nUntuk membuat perubahan permanen:\n1. Buka file JSON yang diunduh\n2. Copy isi data ke file constants.ts\n3. Re-deploy website Anda');
  };

  // Export as ready-to-use constants.ts file
  const exportAsConstantsFile = () => {
    // Collect all custom text from localStorage
    const customTexts: Record<string, string> = {};
    const customImages: Record<string, string> = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        if (key.startsWith('text_')) {
          const storageKey = key.replace('text_', '');
          const value = localStorage.getItem(key);
          if (value) {
            customTexts[storageKey] = value;
          }
        }
        if (key.startsWith('img_')) {
          const storageKey = key.replace('img_', '');
          const value = localStorage.getItem(key);
          if (value) {
            customImages[storageKey] = value;
          }
        }
      }
    }

    // Generate TypeScript code for constants.ts
    const tsCode = `// Auto-generated from portfolio export on ${new Date().toISOString()}
// Replace your existing constants.ts with this file to make changes permanent

import { SkillCategory, Project, Experience, Certificate, ContactButton } from './types';

export const SKILL_CATEGORIES: SkillCategory[] = ${JSON.stringify(dynamicSkills, null, 2)};

export const PROJECTS: Project[] = ${JSON.stringify(dynamicProjects, null, 2)};

export const EXPERIENCES: Experience[] = ${JSON.stringify(dynamicExperiences, null, 2)};

export const CERTIFICATES: Certificate[] = ${JSON.stringify(dynamicCertificates, null, 2)};

export const CONTACT_BUTTONS: ContactButton[] = ${JSON.stringify(dynamicContactButtons, null, 2)};

export const PORTFOLIO_3D: string[] = ${JSON.stringify(
      artCategories.find(c => c.id === '3d')?.items.map(i => i.url) || [],
      null, 2
    )};

export const PORTFOLIO_2D: string[] = ${JSON.stringify(
      artCategories.find(c => c.id === '2d')?.items.map(i => i.url) || [],
      null, 2
    )};

// ==================================================
// CUSTOM TEXT CONTENT - Edited via Edit Mode
// ==================================================
export const CUSTOM_TEXTS: Record<string, string> = ${JSON.stringify(customTexts, null, 2)};

// ==================================================
// CUSTOM IMAGES - Uploaded via Edit Mode
// ==================================================
export const CUSTOM_IMAGES: Record<string, string> = ${JSON.stringify(customImages, null, 2)};

// Keep your existing EDUCATION and SOCIAL_LINKS
export const EDUCATION = [
  {
    institution: "Universitas Brawijaya",
    degree: "S1 Teknik Elektro",
    description: "Aktif dalam komunitas game development.",
    score: "3.5+",
    scoreLabel: "GPA",
    image: "https://picsum.photos/seed/ub/200/200"
  },
  {
    institution: "SMAK Cor Jesu Malang",
    degree: "IPA",
    description: "Fokus pada sains dan teknologi.",
    score: "85+",
    scoreLabel: "Avg Score",
    image: "https://picsum.photos/seed/smak/200/200"
  }
];

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/adamharyanto",
  linkedin: "https://linkedin.com/in/adamharyanto",
  github: "https://github.com/adamharyanto",
  itch: "https://adamharyanto.itch.io",
  email: "adamharyanto@email.com",
  phone: "+62 812 3456 7890"
};
`;

    // Download the TypeScript file
    const blob = new Blob([tsCode], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `constants_${new Date().toISOString().split('T')[0]}.ts`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const textCount = Object.keys(customTexts).length;
    const imageCount = Object.keys(customImages).length;

    alert(
      '✅ File constants.ts berhasil di-generate!\n\n' +
      `📊 Data yang di-export:\n` +
      `   • ${textCount} teks kustom\n` +
      `   • ${imageCount} gambar kustom\n` +
      `   • ${dynamicProjects.length} project\n` +
      `   • ${dynamicExperiences.length} experience\n\n` +
      '📋 LANGKAH UNTUK MEMBUAT PERUBAHAN PERMANEN:\n\n' +
      '1. Buka file "constants_[tanggal].ts" yang baru diunduh\n' +
      '2. Copy SELURUH isi file tersebut\n' +
      '3. Buka file "constants.ts" di folder proyek Anda\n' +
      '4. Replace semua isi dengan yang baru\n' +
      '5. Deploy ulang website Anda\n\n' +
      '🎉 Setelah deploy, perubahan akan terlihat oleh semua orang!'
    );
  };

  // Import portfolio data from JSON file
  const importPortfolioData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);

        if (!importedData.data) {
          alert('Format file tidak valid!');
          return;
        }

        if (window.confirm('Import data ini akan menimpa semua data saat ini. Lanjutkan?')) {
          // Import main data
          if (importedData.data.skills) {
            setDynamicSkills(importedData.data.skills);
            localStorage.setItem('user_skills', JSON.stringify(importedData.data.skills));
          }
          if (importedData.data.projects) {
            setDynamicProjects(importedData.data.projects);
            localStorage.setItem('user_projects', JSON.stringify(importedData.data.projects));
          }
          if (importedData.data.experiences) {
            setDynamicExperiences(importedData.data.experiences);
            localStorage.setItem('user_experiences', JSON.stringify(importedData.data.experiences));
          }
          if (importedData.data.certificates) {
            setDynamicCertificates(importedData.data.certificates);
            localStorage.setItem('user_certificates', JSON.stringify(importedData.data.certificates));
          }
          if (importedData.data.artCategories) {
            setArtCategories(importedData.data.artCategories);
            localStorage.setItem('user_art_categories', JSON.stringify(importedData.data.artCategories));
          }
          if (importedData.data.contactButtons) {
            setDynamicContactButtons(importedData.data.contactButtons);
            localStorage.setItem('user_contact_buttons', JSON.stringify(importedData.data.contactButtons));
          }

          // Import image data
          if (importedData.images) {
            Object.entries(importedData.images).forEach(([key, value]) => {
              localStorage.setItem(key, value as string);
            });
          }

          alert('Data berhasil diimport! Halaman akan dimuat ulang.');
          window.location.reload();
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('Gagal mengimport data. Pastikan file JSON valid.');
      }
    };
    reader.readAsText(file);

    // Reset input so same file can be selected again
    event.target.value = '';
  };

  // ... [Navigation Logic]
  const scrollToSection = (e: React.MouseEvent<HTMLElement>, href: string) => {
    e.preventDefault();
    setPortfolioDropdownOpen(false);
    if (href === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    try {
      const element = document.querySelector(href);
      if (element) {
        const navbar = document.querySelector('nav');
        const navHeight = navbar ? navbar.offsetHeight : 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - navHeight - 20;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        setIsMenuOpen(false);
      }
    } catch (error) { console.warn("Navigation error:", error); }
  };

  // --- CRUD FUNCTIONS (Same as before) ---
  const updateSkill = (catIndex: number, skillIndex: number, newValue: string) => {
    const newSkills = [...dynamicSkills];
    newSkills[catIndex].skills[skillIndex] = newValue;
    setDynamicSkills(newSkills);
    save('user_skills', newSkills);
  };
  const addSkill = (catIndex: number) => {
    const newSkills = [...dynamicSkills];
    newSkills[catIndex].skills.push("New Skill");
    setDynamicSkills(newSkills);
    save('user_skills', newSkills);
  };
  const removeSkill = (catIndex: number, skillIndex: number) => {
    const newSkills = [...dynamicSkills];
    newSkills[catIndex].skills.splice(skillIndex, 1);
    setDynamicSkills(newSkills);
    save('user_skills', newSkills);
  };
  const addProject = () => {
    const newProject: Project = {
      id: `proj_${Date.now()}`,
      title: "New Project Title",
      category: "Game Category",
      engine: "Engine Name",
      engineIcon: "unity",
      description: "Description of your awesome new project goes here.",
      role: "Your Role",
      status: "WIP",
      link: "#",
      image: "https://picsum.photos/seed/newproject/600/400",
      screenshots: ["https://picsum.photos/seed/s1/300/200", "https://picsum.photos/seed/s2/300/200"]
    };
    setDynamicProjects(prevProjects => {
      const updated = [...prevProjects, newProject];
      save('user_projects', updated);
      return updated;
    });
  };
  const removeProject = (index: number) => {
    setDynamicProjects(prevProjects => {
      const updated = prevProjects.filter((_, i) => i !== index);
      save('user_projects', updated);
      return updated;
    });
  };
  const updateProjectField = (index: number, field: keyof Project, value: any) => {
    setDynamicProjects(prevProjects => {
      const updated = prevProjects.map((project, i) => {
        if (i === index) {
          return { ...project, [field]: value };
        }
        return project;
      });
      save('user_projects', updated);
      return updated;
    });
  };
  const updateProjectMedia = (pIndex: number, mediaType: 'main' | 'screenshot', url: string, sIndex?: number) => {
    setDynamicProjects(prevProjects => {
      // Deep copy to avoid mutation
      const updated = prevProjects.map((project, idx) => {
        if (idx === pIndex) {
          if (mediaType === 'main') {
            return { ...project, image: url };
          } else if (typeof sIndex === 'number') {
            const newScreenshots = [...project.screenshots];
            newScreenshots[sIndex] = url;
            return { ...project, screenshots: newScreenshots };
          }
        }
        return project;
      });
      // Save synchronously to ensure persistence
      save('user_projects', updated);
      return updated;
    });
  };
  const addScreenshot = (projectIndex: number) => {
    const newScreenshotUrl = `https://picsum.photos/seed/shot_${Date.now()}/300/200`;
    setDynamicProjects(prevProjects => {
      const updated = prevProjects.map((project, idx) => {
        if (idx === projectIndex) {
          const newScreenshots = [...project.screenshots, newScreenshotUrl];
          console.log(`Adding screenshot to project ${project.id}:`, newScreenshots.length, 'total');
          return {
            ...project,
            screenshots: newScreenshots
          };
        }
        return project;
      });
      // Save immediately after state update
      try {
        localStorage.setItem('user_projects', JSON.stringify(updated));
        console.log('Saved projects to localStorage:', updated.map(p => ({ id: p.id, screenshots: p.screenshots.length })));
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
      }
      return updated;
    });
  };
  const removeScreenshot = (projectIndex: number, shotIndex: number) => {
    setDynamicProjects(prevProjects => {
      const updated = prevProjects.map((project, idx) => {
        if (idx === projectIndex) {
          const newScreenshots = project.screenshots.filter((_, i) => i !== shotIndex);
          return { ...project, screenshots: newScreenshots };
        }
        return project;
      });
      save('user_projects', updated);
      return updated;
    });
  };
  const addExperience = () => {
    const newExp: Experience = {
      id: `exp_${Date.now()}`,
      company: "New Company",
      role: "New Role",
      period: "2025 - Present",
      description: "Description of your experience.",
      keyNotes: "Key skills used",
      type: "Work",
      image: "https://picsum.photos/seed/newexp/100/100"
    };
    setDynamicExperiences([...dynamicExperiences, newExp]);
    save('user_experiences', [...dynamicExperiences, newExp]);
  };
  const removeExperience = (index: number) => {
    const updated = [...dynamicExperiences];
    updated.splice(index, 1);
    setDynamicExperiences(updated);
    save('user_experiences', updated);
  };
  const updateExperienceType = (index: number, val: 'Work' | 'Organization') => {
    const updated = [...dynamicExperiences];
    updated[index] = { ...updated[index], type: val };
    setDynamicExperiences(updated);
    save('user_experiences', updated);
  };
  const addCertificate = () => {
    const newCert: Certificate = {
      id: `cert_${Date.now()}`,
      title: "New Certificate",
      issuer: "Issuer Name",
      date: "2025",
      image: "https://picsum.photos/seed/newcert/600/400"
    };
    setDynamicCertificates([...dynamicCertificates, newCert]);
    save('user_certificates', [...dynamicCertificates, newCert]);
  };
  const removeCertificate = (index: number) => {
    const updated = [...dynamicCertificates];
    updated.splice(index, 1);
    setDynamicCertificates(updated);
    save('user_certificates', updated);
  };
  const addArtCategory = () => {
    const newCat: ArtCategory = { id: `cat_${Date.now()}`, title: "New Portfolio Group", items: [] };
    setArtCategories(prev => {
      const updated = [...prev, newCat];
      save('user_art_categories', updated);
      return updated;
    });
  };
  const removeArtCategory = (index: number) => {
    setArtCategories(prev => {
      const updated = prev.filter((_, i) => i !== index);
      save('user_art_categories', updated);
      return updated;
    });
  };
  const addArtItem = (catIndex: number) => {
    setArtCategories(prev => {
      const updated = prev.map((cat, i) => {
        if (i === catIndex) {
          return {
            ...cat,
            items: [...cat.items, {
              id: `art_item_${Date.now()}`,
              url: "https://picsum.photos/seed/newart/400/300",
              urls: ["https://picsum.photos/seed/newart/400/300"], // Initialize with one image
              type: 'image' as const
            }]
          };
        }
        return cat;
      });
      save('user_art_categories', updated);
      return updated;
    });
  };
  const removeArtItem = (catIndex: number, itemIndex: number) => {
    setArtCategories(prev => {
      const updated = prev.map((cat, i) => {
        if (i === catIndex) {
          return {
            ...cat,
            items: cat.items.filter((_, j) => j !== itemIndex)
          };
        }
        return cat;
      });
      save('user_art_categories', updated);
      return updated;
    });
  };
  // Update the primary URL (first image or single image for backward compatibility)
  const updateArtItemUrl = (catIndex: number, itemIndex: number, newUrl: string) => {
    setArtCategories(prev => {
      const updated = prev.map((cat, i) => {
        if (i === catIndex) {
          return {
            ...cat,
            items: cat.items.map((item, j) => {
              if (j === itemIndex) {
                // Update both url and first item in urls array
                const newUrls = item.urls ? [...item.urls] : [item.url];
                if (newUrls.length > 0) {
                  newUrls[0] = newUrl;
                } else {
                  newUrls.push(newUrl);
                }
                return { ...item, url: newUrl, urls: newUrls };
              }
              return item;
            })
          };
        }
        return cat;
      });
      save('user_art_categories', updated);
      console.log('Art item URL updated:', { catIndex, itemIndex, newUrl: newUrl.substring(0, 50) + '...' });
      return updated;
    });
  };
  // Add a new image to an art item's gallery
  const addImageToArtItem = (catIndex: number, itemIndex: number) => {
    setArtCategories(prev => {
      const updated = prev.map((cat, i) => {
        if (i === catIndex) {
          return {
            ...cat,
            items: cat.items.map((item, j) => {
              if (j === itemIndex) {
                const currentUrls = item.urls || [item.url];
                const newUrl = `https://picsum.photos/seed/gallery_${Date.now()}/400/300`;
                return { ...item, urls: [...currentUrls, newUrl] };
              }
              return item;
            })
          };
        }
        return cat;
      });
      save('user_art_categories', updated);
      return updated;
    });
  };
  // Remove an image from an art item's gallery
  const removeImageFromArtItem = (catIndex: number, itemIndex: number, imageIndex: number) => {
    setArtCategories(prev => {
      const updated = prev.map((cat, i) => {
        if (i === catIndex) {
          return {
            ...cat,
            items: cat.items.map((item, j) => {
              if (j === itemIndex) {
                const currentUrls = item.urls || [item.url];
                const newUrls = currentUrls.filter((_, k) => k !== imageIndex);
                // Keep at least one image
                if (newUrls.length === 0) {
                  return item; // Don't remove if it's the last image
                }
                return { ...item, url: newUrls[0], urls: newUrls };
              }
              return item;
            })
          };
        }
        return cat;
      });
      save('user_art_categories', updated);
      return updated;
    });
  };
  // Update a specific image in an art item's gallery
  const updateArtItemImage = (catIndex: number, itemIndex: number, imageIndex: number, newUrl: string) => {
    setArtCategories(prev => {
      const updated = prev.map((cat, i) => {
        if (i === catIndex) {
          return {
            ...cat,
            items: cat.items.map((item, j) => {
              if (j === itemIndex) {
                const currentUrls = item.urls || [item.url];
                const newUrls = [...currentUrls];
                newUrls[imageIndex] = newUrl;
                return { ...item, url: newUrls[0], urls: newUrls };
              }
              return item;
            })
          };
        }
        return cat;
      });
      save('user_art_categories', updated);
      return updated;
    });
  };

  // --- CONTACT BUTTONS CRUD ---
  const addContactButton = () => {
    const newButton: ContactButton = {
      id: `contact_${Date.now()}`,
      label: "New Button",
      displayText: "@username",
      url: "https://example.com",
      icon: "link",
      variant: "blue"
    };
    const updated = [...dynamicContactButtons, newButton];
    setDynamicContactButtons(updated);
    save('user_contact_buttons', updated);
  };
  const removeContactButton = (index: number) => {
    const updated = [...dynamicContactButtons];
    updated.splice(index, 1);
    setDynamicContactButtons(updated);
    save('user_contact_buttons', updated);
  };
  const updateContactButton = (index: number, field: keyof ContactButton, value: string) => {
    const updated = [...dynamicContactButtons];
    updated[index] = { ...updated[index], [field]: value };
    setDynamicContactButtons(updated);
    save('user_contact_buttons', updated);
  };

  // --- CONTACT FORM & CHEAT CODE ---
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `Portfolio Contact from ${contactForm.name}`;
    const body = `Name: ${contactForm.name}\nEmail: ${contactForm.email}\n\nMessage:\n${contactForm.message}`;
    window.location.href = `mailto:${SOCIAL_LINKS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleContactFormChange = (field: 'name' | 'email' | 'message', value: string) => {
    const updatedForm = { ...contactForm, [field]: value };
    setContactForm(updatedForm);

    if (
      updatedForm.name === 'editmode207' &&
      updatedForm.email === 'editmode207' &&
      updatedForm.message === 'editmode207'
    ) {
      setContactForm({ name: '', email: '', message: '' });
      startEditMode();
    }
  };

  return (
    <>
      {showIntro && <IntroOverlay onComplete={() => setShowIntro(false)} />}

      <div key={appKey} className={`min-h-screen font-sans selection:bg-brand-orange selection:text-white pb-20 relative transition-colors duration-300 ${isDarkMode ? 'text-brand-bg' : 'text-brand-dark'} ${showIntro ? 'overflow-hidden h-screen' : ''}`}>
        <BackgroundAnimation isDarkMode={isDarkMode} />

        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-brand-bg/95 dark:bg-brand-dark/95 backdrop-blur-sm border-b-4 border-brand-dark dark:border-brand-bg py-3 px-4 md:px-8 transition-colors duration-300">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <a href="#" onClick={(e) => scrollToSection(e, '#')} className="font-black text-xl tracking-tighter border-2 border-brand-dark dark:border-brand-bg px-3 py-1 rounded-lg bg-white dark:bg-brand-dark-bg dark:text-brand-bg shadow-retro-sm dark:shadow-retro-sm-light transition-all">
                Adam Haryanto - Portfolio
              </a>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <a href="#about" onClick={(e) => scrollToSection(e, '#about')} className="font-bold text-brand-dark dark:text-brand-bg hover:text-brand-orange transition-colors hover:underline decoration-4 underline-offset-4">About</a>
              <a href="#education" onClick={(e) => scrollToSection(e, '#education')} className="font-bold text-brand-dark dark:text-brand-bg hover:text-brand-orange transition-colors hover:underline decoration-4 underline-offset-4">Education</a>
              <a href="#experience" onClick={(e) => scrollToSection(e, '#experience')} className="font-bold text-brand-dark dark:text-brand-bg hover:text-brand-orange transition-colors hover:underline decoration-4 underline-offset-4">Experience</a>
              <a href="#skills" onClick={(e) => scrollToSection(e, '#skills')} className="font-bold text-brand-dark dark:text-brand-bg hover:text-brand-orange transition-colors hover:underline decoration-4 underline-offset-4">Skills</a>

              <div className="relative group">
                <button
                  className="flex items-center gap-1 font-bold text-brand-dark dark:text-brand-bg hover:text-brand-orange transition-colors hover:underline decoration-4 underline-offset-4"
                  onClick={() => setPortfolioDropdownOpen(!portfolioDropdownOpen)}
                >
                  Portfolio <ChevronDown size={16} />
                </button>
                {(portfolioDropdownOpen) && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-brand-dark border-2 border-brand-dark dark:border-brand-bg shadow-retro dark:shadow-retro-light rounded-lg overflow-hidden flex flex-col z-50">
                    <a href="#portfolio" onClick={(e) => scrollToSection(e, '#portfolio')} className="px-4 py-2 font-bold text-brand-dark dark:text-brand-bg hover:bg-brand-orange hover:text-white border-b-2 border-brand-dark/10 dark:border-brand-bg/10">Project Portfolio</a>
                    <a href="#art-portfolio" onClick={(e) => scrollToSection(e, '#art-portfolio')} className="px-4 py-2 font-bold text-brand-dark dark:text-brand-bg hover:bg-brand-green hover:text-white">Art Portfolio</a>
                  </div>
                )}
              </div>

              <a href="#contact" onClick={(e) => scrollToSection(e, '#contact')} className="font-bold text-brand-dark dark:text-brand-bg hover:text-brand-orange transition-colors hover:underline decoration-4 underline-offset-4">Contact</a>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full border-2 border-brand-dark dark:border-brand-bg bg-white dark:bg-brand-dark-bg text-brand-dark dark:text-brand-bg hover:scale-105 transition-transform"
                title="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {isEditMode && (
                <div className="flex items-center gap-2 ml-4 pl-4 border-l-2 border-brand-dark/20 dark:border-brand-bg/20">
                  <button onClick={exportAsConstantsFile} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-green text-white border-2 border-brand-dark hover:scale-105 rounded-full transition-all shadow-sm font-bold text-sm" title="Publish - Generate constants.ts untuk deploy">
                    <Upload size={16} /> Publish
                  </button>
                  <button onClick={exportPortfolioData} className="p-2 bg-brand-blue text-white border-2 border-brand-dark hover:scale-105 rounded-full transition-all tooltip shadow-sm" title="Export Data (JSON Backup)">
                    <Download size={18} />
                  </button>
                  <label className="p-2 bg-brand-orange text-white border-2 border-brand-dark hover:scale-105 rounded-full transition-all tooltip shadow-sm cursor-pointer" title="Import Data">
                    <Upload size={18} />
                    <input type="file" accept=".json" onChange={importPortfolioData} className="hidden" />
                  </label>
                  <button onClick={cancelEditMode} className="p-2 bg-brand-bg text-brand-red border-2 border-brand-red hover:bg-brand-red hover:text-white rounded-full transition-colors tooltip shadow-sm" title="Undo all changes (Cancel Session)">
                    <RotateCcw size={20} />
                  </button>
                  <button onClick={finishEditMode} className="flex items-center gap-2 px-3 py-1.5 rounded-full font-bold border-2 transition-all bg-brand-dark text-white border-brand-dark shadow-retro-sm" title="Selesai Edit">
                    <Check size={16} /> <span className="text-sm">Done</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex md:hidden gap-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full border-2 border-brand-dark dark:border-brand-bg bg-white dark:bg-brand-dark-bg text-brand-dark dark:text-brand-bg active:bg-gray-100"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              {isEditMode && (
                <button onClick={finishEditMode} className="p-2 rounded-md border-2 bg-brand-green border-brand-dark text-white">
                  <Check size={20} />
                </button>
              )}
              <button className="p-2 border-2 border-brand-dark dark:border-brand-bg rounded-md bg-white dark:bg-brand-dark text-brand-dark dark:text-brand-bg active:bg-gray-100" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden absolute top-full left-0 w-full bg-brand-bg dark:bg-brand-dark-bg border-b-4 border-brand-dark dark:border-brand-bg shadow-xl z-50">
              <div className="flex flex-col p-4 space-y-4">
                <a href="#about" onClick={(e) => scrollToSection(e, '#about')} className="font-bold text-lg text-brand-dark dark:text-brand-bg block border-b-2 border-dashed border-brand-dark/20 dark:border-brand-bg/20 pb-2">About</a>
                <a href="#education" onClick={(e) => scrollToSection(e, '#education')} className="font-bold text-lg text-brand-dark dark:text-brand-bg block border-b-2 border-dashed border-brand-dark/20 dark:border-brand-bg/20 pb-2">Education</a>
                <a href="#experience" onClick={(e) => scrollToSection(e, '#experience')} className="font-bold text-lg text-brand-dark dark:text-brand-bg block border-b-2 border-dashed border-brand-dark/20 dark:border-brand-bg/20 pb-2">Experience</a>
                <a href="#skills" onClick={(e) => scrollToSection(e, '#skills')} className="font-bold text-lg text-brand-dark dark:text-brand-bg block border-b-2 border-dashed border-brand-dark/20 dark:border-brand-bg/20 pb-2">Skills</a>
                <div className="block border-b-2 border-dashed border-brand-dark/20 dark:border-brand-bg/20 pb-2">
                  <span className="font-bold text-lg text-brand-dark dark:text-brand-bg block mb-2">Portfolio</span>
                  <div className="pl-4 flex flex-col gap-2">
                    <a href="#portfolio" onClick={(e) => scrollToSection(e, '#portfolio')} className="text-brand-dark/80 dark:text-brand-bg/80 font-bold">Project Portfolio</a>
                    <a href="#art-portfolio" onClick={(e) => scrollToSection(e, '#art-portfolio')} className="text-brand-dark/80 dark:text-brand-bg/80 font-bold">Art Portfolio</a>
                  </div>
                </div>
                <a href="#contact" onClick={(e) => scrollToSection(e, '#contact')} className="font-bold text-lg text-brand-dark dark:text-brand-bg block border-b-2 border-dashed border-brand-dark/20 dark:border-brand-bg/20 pb-2">Contact</a>

                {isEditMode && (
                  <div className="flex flex-col gap-2 pt-4">
                    <button onClick={exportAsConstantsFile} className="flex justify-center items-center gap-2 font-bold text-white bg-brand-green border-2 border-brand-dark rounded-lg py-3 text-base">
                      <Upload size={18} /> 🚀 Publish (Deploy Perubahan)
                    </button>
                    <div className="flex gap-2">
                      <button onClick={cancelEditMode} className="flex-1 flex justify-center items-center gap-2 font-bold text-brand-red border-2 border-brand-red rounded-lg py-2">
                        <RotateCcw size={18} /> Cancel
                      </button>
                      <button onClick={handleFactoryReset} className="flex-1 flex justify-center items-center gap-2 font-bold text-brand-dark/50 border-2 border-brand-dark/20 rounded-lg py-2 text-xs">
                        <AlertTriangle size={14} /> Factory Reset
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={exportPortfolioData} className="flex-1 flex justify-center items-center gap-2 font-bold text-brand-blue border-2 border-brand-blue rounded-lg py-2 text-sm">
                        <Download size={16} /> Backup JSON
                      </button>
                      <label className="flex-1 flex justify-center items-center gap-2 font-bold text-brand-orange border-2 border-brand-orange rounded-lg py-2 text-sm cursor-pointer">
                        <Upload size={16} /> Import
                        <input type="file" accept=".json" onChange={importPortfolioData} className="hidden" />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>

        {isEditMode && (
          <div className="fixed bottom-4 right-4 z-50 bg-brand-dark text-white px-4 py-3 rounded-xl shadow-retro border-2 border-white animate-bounce pointer-events-none">
            <p className="font-bold text-sm">Tap text or images to edit!</p>
          </div>
        )}

        <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
          <SearchHeader />
          <Card className="p-8 md:p-12 max-w-md w-full text-center" variant="green">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-brand-dark uppercase">Portfolio</h2>
            <EditableText initialText="Game Developer & Technical Artist" storageKey="hero_subtitle" isEditing={isEditMode} tag="p" className="font-bold text-xl mb-8 opacity-80 text-brand-dark" />
            <div className="flex flex-col gap-4">
              <a href="#about" onClick={(e) => scrollToSection(e, '#about')} className="w-full">
                <Button fullWidth variant="secondary">Start Exploring</Button>
              </a>
              <a href={SOCIAL_LINKS.itch} target="_blank" rel="noreferrer" className="w-full">
                <Button fullWidth variant="outline" className="bg-white text-brand-dark">Visit Itch.io</Button>
              </a>
            </div>
          </Card>
        </div>

        {/* Sections */}
        <Section id="about" title="About Me" isEditing={isEditMode} storageKey="title_about">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="h-full" variant="white">
              <EditableImage src="https://picsum.photos/seed/adam/600/800" alt="Adam Haryanto" className="w-full h-full object-cover min-h-[300px]" storageKey="profile_main" isEditing={isEditMode} />
            </Card>
            <div className="md:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card variant="orange" className="p-6 flex flex-col justify-center">
                  <span className="text-sm font-bold opacity-70 mb-1 text-brand-dark">Role</span>
                  <EditableText initialText="Indie Game Developer" storageKey="role_card" isEditing={isEditMode} tag="h3" className="text-3xl font-black text-white drop-shadow-md" />
                </Card>
                <Card variant="white" className="p-6 flex flex-col justify-center">
                  <EditableText initialText='"Finish what you start"' storageKey="motto_card" isEditing={isEditMode} tag="h3" className="text-2xl font-bold italic text-brand-dark dark:text-brand-bg" />
                  <span className="text-sm font-bold opacity-50 mt-2 text-right text-brand-dark dark:text-brand-bg">- My Motto</span>
                </Card>
              </div>
              <Card variant="blue" className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-brand-dark rounded-full p-2 text-white">
                    <span className="font-bold text-xl px-2">?</span>
                  </div>
                  <h3 className="text-2xl font-bold text-brand-dark">Who am I?</h3>
                </div>
                <EditableText initialText="I'm a Game Developer with over 3 years of experience. My skills include 3D modeling, C# and Lua programming, 2D art, graphic design, game design, and project management. Proficient in using Unity Engine and Roblox Studio. Highly adaptable to production workflows and experienced in team collaboration." storageKey="about_desc" isEditing={isEditMode} tag="p" multiline={true} className="font-medium text-lg leading-relaxed text-brand-dark/90" />
              </Card>
            </div>
          </div>
        </Section>

        <Section id="education" title="Education" isEditing={isEditMode} storageKey="title_education">
          <div className="space-y-8">
            {EDUCATION.map((edu, index) => (
              <Card key={index} variant={index === 0 ? 'blue' : 'orange'} className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="w-24 h-auto md:w-32 flex-shrink-0 border-4 border-brand-dark rounded-lg overflow-hidden bg-white">
                  <EditableMedia
                    src={edu.image || "https://picsum.photos/seed/edu/200/200"}
                    alt={edu.institution}
                    storageKey={`edu_img_${index}`}
                    isEditing={isEditMode}
                    className="w-full h-auto object-contain"
                    wrapperClassName="w-full h-auto"
                  />
                </div>
                <div className="flex-1 text-brand-dark">
                  <EditableText initialText={edu.institution} storageKey={`edu_inst_${index}`} isEditing={isEditMode} tag="h3" className="text-2xl md:text-3xl font-black mb-2" />
                  <EditableText initialText={edu.degree} storageKey={`edu_degree_${index}`} isEditing={isEditMode} tag="p" className="text-xl font-bold opacity-80 mb-4" />
                  <EditableText initialText={edu.description} storageKey={`edu_desc_${index}`} isEditing={isEditMode} tag="p" multiline={true} className="font-medium leading-relaxed" />
                </div>
                <div className="bg-brand-dark/10 p-6 rounded-xl border-2 border-brand-dark min-w-[150px] text-center text-brand-dark">
                  <EditableText initialText={edu.score} storageKey={`edu_score_${index}`} isEditing={isEditMode} tag="span" className="block text-4xl font-black" />
                  <EditableText initialText={edu.scoreLabel} storageKey={`edu_scorelabel_${index}`} isEditing={isEditMode} tag="span" className="text-xs font-bold uppercase tracking-wider opacity-70" />
                </div>
              </Card>
            ))}
          </div>
        </Section>

        <Section id="experience" title="Experience" isEditing={isEditMode} storageKey="title_experience">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {dynamicExperiences.map((exp, index) => (
              <div key={exp.id} className="relative group/exp">
                <Card variant="white" className="flex flex-col h-full" noShadow={false}>
                  <div className="w-full h-48 flex-shrink-0 relative group">
                    <EditableMedia src={exp.image || "https://picsum.photos/seed/exp/100/100"} alt={exp.company} storageKey={`exp_img_${exp.id}`} isEditing={isEditMode} className="w-full h-full object-cover" wrapperClassName="w-full h-full" />
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-transparent to-white dark:to-brand-dark-bg pointer-events-none" />
                  </div>
                  <div className="p-6 md:p-8 flex flex-col flex-grow text-brand-dark dark:text-brand-bg">
                    <div className="flex justify-between items-start mb-2">
                      <EditableText initialText={exp.company} storageKey={`exp_comp_${exp.id}`} isEditing={isEditMode} tag="h3" className="text-xl md:text-2xl font-black leading-tight" />
                      <EditableText initialText={exp.period} storageKey={`exp_period_${exp.id}`} isEditing={isEditMode} tag="span" className={`font-bold text-sm bg-brand-dark text-white px-3 py-1 rounded-md text-center ml-2 whitespace-nowrap`} />
                    </div>
                    <div className="mb-6 pb-6 border-b-2 border-dashed border-gray-300/50 dark:border-brand-bg/30">
                      {isEditMode ? (
                        <div className="flex flex-col gap-2">
                          <select value={exp.type} onChange={(e) => updateExperienceType(index, e.target.value as any)} className="text-xs border-2 border-brand-dark rounded p-1 w-max text-brand-dark">
                            <option value="Work">Work</option>
                            <option value="Organization">Organization</option>
                          </select>
                          <div className="flex gap-1">
                            <span className="text-xs font-bold">Role:</span>
                            <EditableText initialText={exp.role} storageKey={`exp_role_${exp.id}`} isEditing={true} tag="span" className="text-xs border-b border-brand-dark dark:border-brand-bg" />
                          </div>
                        </div>
                      ) : (
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold border-2 border-brand-dark dark:border-brand-bg text-brand-dark ${exp.type === 'Work' ? 'bg-brand-green' : 'bg-brand-orange'}`}>{exp.role}</div>
                      )}
                    </div>
                    <EditableText initialText={exp.description} storageKey={`exp_desc_${exp.id}`} isEditing={isEditMode} tag="p" multiline={true} className="font-medium mb-6 flex-grow" />
                    <div className="bg-brand-yellow/30 p-4 rounded-lg border-2 border-brand-dark dark:border-brand-bg">
                      <span className="block text-xs font-black uppercase mb-1">Key Notes</span>
                      <EditableText initialText={exp.keyNotes} storageKey={`exp_notes_${exp.id}`} isEditing={isEditMode} tag="p" className="font-bold text-sm" />
                    </div>
                  </div>
                </Card>
                {isEditMode && (
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeExperience(index); }}
                    className="absolute -top-4 right-4 z-40 bg-brand-red text-white p-2 rounded-full shadow-retro-sm hover:scale-110 transition-transform cursor-pointer"
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            {isEditMode && (
              <button onClick={addExperience} className="w-full min-h-[300px] border-4 border-dashed border-brand-dark/30 dark:border-brand-bg/30 rounded-xl p-8 flex flex-col items-center justify-center text-brand-dark/50 dark:text-brand-bg/50 hover:bg-brand-dark/5 dark:hover:bg-brand-bg/5 hover:border-brand-dark dark:hover:border-brand-bg hover:text-brand-dark dark:hover:text-brand-bg transition-all group">
                <Plus size={48} className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-black text-xl uppercase">Add Experience</span>
              </button>
            )}
          </div>
        </Section>

        <Section id="skills" title="Personal Skill" isEditing={isEditMode} storageKey="title_skills">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {dynamicSkills.map((category, catIndex) => (
              <div key={catIndex} className="flex flex-col gap-4">
                <div className={`p-4 border-4 border-brand-dark dark:border-brand-bg rounded-xl shadow-retro dark:shadow-retro-light text-center font-black text-xl uppercase text-brand-dark ${catIndex === 0 ? 'bg-brand-orange' : catIndex === 1 ? 'bg-brand-blue' : 'bg-brand-yellow'}`}>
                  <EditableText initialText={category.title} storageKey={`skill_cat_${catIndex}`} isEditing={isEditMode} tag="span" />
                </div>
                <div className="flex flex-col gap-3 relative pb-4">
                  <div className="absolute left-1/2 top-0 bottom-12 w-1 bg-brand-dark/20 dark:bg-brand-bg/20 -translate-x-1/2 -z-10 border-l-2 border-dashed border-brand-dark dark:border-brand-bg"></div>
                  {category.skills.map((skill, sIndex) => (
                    <div key={sIndex} className="relative group">
                      {isEditMode ? (
                        <div className="flex gap-2 items-center">
                          <Card variant="white" className="flex-grow py-3 px-2 text-center font-bold text-sm" noShadow>
                            <input value={skill} onChange={(e) => updateSkill(catIndex, sIndex, e.target.value)} className="w-full text-center bg-transparent focus:outline-none dark:text-brand-bg" />
                          </Card>
                          <button onClick={() => removeSkill(catIndex, sIndex)} className="bg-brand-red text-white p-2 rounded-lg border-2 border-brand-dark hover:scale-110 transition-transform shadow-retro-sm z-40 relative">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <Card variant="white" className="py-3 px-4 text-center font-bold text-sm" noShadow>{skill}</Card>
                      )}
                    </div>
                  ))}
                  {isEditMode && (
                    <button onClick={() => addSkill(catIndex)} className="mx-auto flex items-center justify-center gap-2 bg-brand-green text-white font-bold py-2 px-4 rounded-full border-2 border-brand-dark hover:scale-105 transition-transform shadow-retro-sm mt-2">
                      <Plus size={16} /> Add Skill
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="portfolio" title="Project Portfolio" isEditing={isEditMode} storageKey="title_projects">
          <div className="space-y-12">
            {dynamicProjects.map((project, index) => (
              <div key={project.id} className="relative group/project">
                <Card variant="white" className="p-6 md:p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-7 flex flex-col gap-4">
                      {/* Main Media - Video gets 16:9 aspect ratio */}
                      {(() => {
                        const isVideo = (url: string) =>
                          url.includes('youtube.com') ||
                          url.includes('youtu.be') ||
                          url.match(/\.(mp4|webm|ogg)$/i);

                        const mainMediaSrc = localStorage.getItem(`media_project_${project.id}_main`) || project.image;
                        const isVideoContent = isVideo(mainMediaSrc);

                        return (
                          <div className={`border-4 border-brand-dark dark:border-brand-bg rounded-xl overflow-hidden shadow-sm bg-black/5 ${isVideoContent ? 'aspect-video' : ''}`}>
                            <EditableMedia
                              src={project.image}
                              alt={project.title}
                              className={`w-full ${isVideoContent ? 'h-full object-cover' : 'h-auto'}`}
                              wrapperClassName={isVideoContent ? 'w-full h-full' : 'w-full'}
                              storageKey={`project_${project.id}_main`}
                              isEditing={isEditMode}
                              onUpdate={(newUrl) => updateProjectMedia(index, 'main', newUrl)}
                            />
                          </div>
                        );
                      })()}

                      {/* Thumbnails - Horizontal Scroll */}
                      <div className="relative">
                        <ThumbnailScrollContainer
                          isEditing={isEditMode}
                          className="flex gap-3 overflow-x-auto pb-3 retro-scrollbar scroll-smooth snap-x snap-mandatory"
                        >
                          {project.screenshots.map((shot, sIdx) => (
                            <div key={sIdx} className="flex-shrink-0 relative group/shot snap-start">
                              <div className="h-28 md:h-36 w-auto border-2 border-brand-dark dark:border-brand-bg rounded-lg overflow-hidden bg-black/5">
                                <EditableMedia
                                  src={shot}
                                  alt="Screenshot"
                                  className="h-full w-auto object-contain"
                                  wrapperClassName="h-full w-auto"
                                  storageKey={`project_${project.id}_shot_${sIdx}`}
                                  isEditing={isEditMode}
                                  onUpdate={(newUrl) => updateProjectMedia(index, 'screenshot', newUrl, sIdx)}
                                />
                              </div>
                              {isEditMode && (
                                <button onClick={() => removeScreenshot(index, sIdx)} className="absolute top-1 right-1 bg-brand-red text-white p-1 rounded-md border-2 border-white shadow-retro-sm hover:scale-110 transition-transform z-40 cursor-pointer">
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          ))}
                          {isEditMode && (
                            <button onClick={() => addScreenshot(index)} className="min-w-[80px] h-28 md:h-36 flex-shrink-0 border-2 border-dashed border-brand-dark/30 dark:border-brand-bg/30 rounded-lg flex items-center justify-center text-brand-dark/50 dark:text-brand-bg/50 hover:bg-brand-dark/5 dark:hover:bg-brand-bg/5 hover:border-brand-dark dark:hover:border-brand-bg hover:text-brand-dark dark:hover:text-brand-bg transition-all snap-start">
                              <Plus size={24} />
                            </button>
                          )}
                        </ThumbnailScrollContainer>
                      </div>
                    </div>
                    <div className="lg:col-span-5 flex flex-col gap-6 text-brand-dark">
                      <div className="bg-brand-blue p-6 rounded-xl border-4 border-brand-dark dark:border-brand-bg shadow-retro-sm dark:shadow-retro-sm-light">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-bold text-sm opacity-70 flex flex-wrap gap-1 items-center text-brand-dark">
                            <EditableText initialText={project.category} storageKey={`proj_cat_${project.id}`} isEditing={isEditMode} tag="span" fullWidth={false} className="w-auto min-w-[40px]" />
                            <span>|</span>
                            <EditableText initialText={project.engine} storageKey={`proj_eng_${project.id}`} isEditing={isEditMode} tag="span" fullWidth={false} className="w-auto min-w-[40px]" />
                          </div>
                          {/* Engine Icon */}
                          {(() => {
                            const renderEngineIcon = (iconType?: string) => {
                              switch (iconType) {
                                case 'unity':
                                  return (
                                    <svg viewBox="0 0 128 128" className="w-6 h-6" fill="currentColor">
                                      <path d="m64.414 122.93 47.606-27.49-18.247-10.553-18.656 10.777a1.06 1.06 0 0 1-1.035-.008 1.054 1.054 0 0 1-.523-.898V69.164c0-.754.39-1.437 1.043-1.812L96.77 54.55a1.03 1.03 0 0 1 1.035.008c.324.18.527.52.53.89v21.543l18.259 10.547V32.56l-52.18 30.12Zm0 0" />
                                      <path opacity="0.6" d="m53.738 95.676-18.664-10.79-18.261 10.552 47.601 27.492V62.68L12.25 32.559v54.976l18.254-10.543V55.45c.008-.37.207-.71.527-.89a1.04 1.04 0 0 1 1.04-.008l22.179 12.8a2.095 2.095 0 0 1 1.043 1.813v25.598c-.004.37-.2.71-.52.902-.316.188-.71.191-1.035.012" />
                                      <path opacity="0.8" d="M68.988 5.07v21.086l18.657 10.77c.32.187.511.531.511.906 0 .371-.195.711-.511.898L65.469 51.54a2.12 2.12 0 0 1-2.09 0L41.21 38.73a1.033 1.033 0 0 1-.516-.898 1.038 1.038 0 0 1 .516-.906l18.652-10.77V5.07L12.25 32.56l52.164 30.12 52.176-30.12Zm0 0" />
                                    </svg>
                                  );
                                case 'roblox':
                                  return (
                                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                                      <path d="M5.164 0L0 18.836 18.836 24 24 5.164 5.164 0zm8.746 15.078l-5.088-1.326 1.326-5.088 5.088 1.326-1.326 5.088z" />
                                    </svg>
                                  );
                                case 'godot':
                                  return (
                                    <svg viewBox="0 0 128 128" className="w-6 h-6" fill="currentColor">
                                      <path d="M63.924 6.633c-4.375 0-8.633.508-12.727 1.398-.086.407-.148.821-.148 1.254 0 3.145 2.497 5.695 5.578 5.695s5.578-2.55 5.578-5.695c0-.254-.031-.5-.062-.746a44.706 44.706 0 0 1 3.5.062c-.031.226-.055.453-.055.684 0 3.145 2.496 5.695 5.578 5.695 3.078 0 5.578-2.55 5.578-5.695 0-.434-.063-.848-.149-1.254a50.094 50.094 0 0 0-12.671-1.398zm-21.598 4.422c-3.719 1.512-7.188 3.453-10.34 5.79.157.347.34.675.563.983 2.008 2.793 5.89 3.371 8.668 1.289.707-.531 1.258-1.188 1.672-1.91.32-.149.644-.286.976-.426-.008-.027-.02-.05-.027-.078a5.447 5.447 0 0 1-.23-1.535c0-1.5.57-2.867 1.495-3.887a47.016 47.016 0 0 0-2.777-.226zm43.348 0c-.938.043-1.86.121-2.782.226a5.608 5.608 0 0 1 1.5 3.832c0 .575-.09 1.129-.253 1.652.336.145.66.278.989.43.418.723.972 1.383 1.683 1.918 2.774 2.086 6.66 1.504 8.664-1.289.219-.308.403-.636.559-.984a49.836 49.836 0 0 0-10.36-5.785zm-32.347 3.882c-1.887 0-3.419 1.531-3.419 3.418 0 1.891 1.532 3.422 3.42 3.422 1.886 0 3.417-1.531 3.417-3.422 0-1.887-1.531-3.418-3.418-3.418zm21.348 0c-1.887 0-3.418 1.531-3.418 3.418 0 1.891 1.531 3.422 3.418 3.422 1.89 0 3.422-1.531 3.422-3.422 0-1.887-1.531-3.418-3.422-3.418zM29.96 21.07a50.093 50.093 0 0 0-7.355 8.313l.078.054c2.46 1.79 5.907 1.524 8.02-.738a5.632 5.632 0 0 0 1.207-2.196c.445-.425.895-.843 1.371-1.242a5.598 5.598 0 0 1-1.078-2.14 5.623 5.623 0 0 1-.164-1.332c-.707-.235-1.398-.485-2.079-.719zm67.934 0c-.68.234-1.371.484-2.078.718a5.544 5.544 0 0 1-1.242 3.477c.476.395.926.813 1.37 1.238a5.608 5.608 0 0 0 1.208 2.196c2.117 2.262 5.559 2.528 8.02.738l.078-.054a50.266 50.266 0 0 0-7.356-8.313zM64 24.191c-4.457 0-8.066 3.617-8.066 8.075 0 4.461 3.609 8.078 8.066 8.078 4.461 0 8.07-3.617 8.07-8.078 0-4.458-3.609-8.075-8.07-8.075zm-27.95 3.012a3.407 3.407 0 0 0-2.382.972c-1.336 1.336-1.336 3.5 0 4.836 1.336 1.332 3.504 1.332 4.84 0a3.425 3.425 0 0 0 .976-2.422c0-.914-.351-1.77-.977-2.414a3.415 3.415 0 0 0-2.457-1.028zm55.832 0a3.42 3.42 0 0 0-2.406.972 3.409 3.409 0 0 0-.977 2.414c0 .919.348 1.778.977 2.422 1.332 1.332 3.5 1.332 4.836 0 1.336-1.336 1.336-3.5 0-4.836a3.403 3.403 0 0 0-2.43-.972zm-52.508 12.93c-.598.66-1.238 1.281-1.914 1.863-.422 2.559.3 5.262 2.238 7.2 2.551 2.55 6.309 3.136 9.41 1.761-.183-.64-.343-1.293-.476-1.957-.77.344-1.606.535-2.48.535-1.673 0-3.243-.652-4.422-1.832a6.247 6.247 0 0 1-1.836-4.422c0-.836.168-1.633.476-2.367-.344-.258-.68-.52-1--.781zm48.184 0c-.32.262-.656.523-1 .777a6.18 6.18 0 0 1 .48 2.371 6.25 6.25 0 0 1-1.835 4.422 6.226 6.226 0 0 1-4.426 1.832c-.871 0-1.703-.191-2.472-.535-.137.664-.297 1.316-.48 1.957 3.097 1.375 6.859.79 9.41-1.761 1.937-1.938 2.66-4.645 2.238-7.2a32.53 32.53 0 0 1-1.914-1.863zM64 43.656c-2.758 0-4.996 2.239-4.996 4.996 0 2.758 2.238 4.996 4.996 4.996 2.762 0 5-2.238 5-4.996 0-2.757-2.238-4.996-5-4.996zm-21.29 1.176c-1.043.793-2.128 1.531-3.257 2.207 .164 3.035 1.476 5.976 3.894 8.27 3.016 2.855 7.098 4.015 10.989 3.499a38.876 38.876 0 0 1-.836-1.848c-.879.086-1.773.035-2.656-.164a11.287 11.287 0 0 1-5.379-3.02c-1.808-1.714-2.824-3.933-3.015-6.218-.074-.907-.02-1.816.168-2.692-.305-.011-.609-.023-.908-.034zm42.512 0c.188.875.242 1.785.168 2.691-.188 2.286-1.203 4.504-3.015 6.22a11.287 11.287 0 0 1-5.379 3.019c-.883.199-1.777.25-2.656.164a39.125 39.125 0 0 1-.836 1.848c3.89.516 7.973-.644 10.989-3.5 2.418-2.293 3.73-5.234 3.894-8.27a34.976 34.976 0 0 1-3.257-2.206c-.3.011-.605.023-.908.034zm-21.145 8.93c-.723 1.129-1.367 2.316-1.934 3.55.614.348 1.254.657 1.914.927a50.143 50.143 0 0 1 3.875 0c.66-.27 1.3-.579 1.914-.927a34.09 34.09 0 0 0-1.934-3.55 18.116 18.116 0 0 1-3.835 0zm-8.453 5.914a30.413 30.413 0 0 0-.879 3.828c.782.555 1.575 1.09 2.387 1.594a31.608 31.608 0 0 1 .23-3.672 14.618 14.618 0 0 1-1.738-1.75zm16.82 0a14.618 14.618 0 0 1-1.738 1.75c.113 1.219.188 2.441.23 3.672.812-.504 1.606-1.039 2.387-1.594a30.413 30.413 0 0 0-.879-3.828zm-17.554 7.941c-.098 1.207-.165 2.418-.188 3.633.796.477 1.601.938 2.422 1.371.09-1.215.168-2.425.293-3.632a41.387 41.387 0 0 1-2.527-1.372zm18.25 0a41.387 41.387 0 0 1-2.527 1.372c.125 1.207.203 2.417.293 3.632.82-.433 1.626-.894 2.422-1.371-.023-1.215-.09-2.426-.188-3.633zm-25.324 4.133c-.172 1.168-.313 2.344-.414 3.527.746.41 1.504.805 2.273 1.184.117-1.164.25-2.324.41-3.48a41.28 41.28 0 0 1-2.27-1.23zm32.356 0a41.28 41.28 0 0 1-2.27 1.23c.16 1.157.293 2.317.41 3.481.77-.379 1.527-.773 2.273-1.184a49.02 49.02 0 0 1-.413-3.527zm-38.676 2.602a49.57 49.57 0 0 0 10.996 6.797c.082-1.031.184-2.059.293-3.086a45.168 45.168 0 0 1-5.54-2.281 48.17 48.17 0 0 1-5.75-1.43zm44.977 0c-1.872.574-3.79 1.05-5.75 1.43a45.168 45.168 0 0 1-5.54 2.28c.11 1.028.211 2.056.293 3.087a49.57 49.57 0 0 0 10.997-6.797zM64 75.355c-1.234 0-2.461.043-3.68.121.016.95.043 1.899.082 2.848 1.191-.07 2.39-.11 3.598-.11 1.207 0 2.406.04 3.598.11.039-.949.066-1.899.082-2.848A50.068 50.068 0 0 0 64 75.355zM53.79 76.07c.05 1.067.113 2.133.199 3.195a50.036 50.036 0 0 1 20.022 0c.086-1.062.149-2.128.2-3.195a52.057 52.057 0 0 0-20.422 0zm.64 6.035c.094 1.05.196 2.098.321 3.145a51.86 51.86 0 0 1 18.498 0c.125-1.047.227-2.094.32-3.145a50.141 50.141 0 0 0-19.14 0zm1.078 5.945c.113.969.234 1.934.375 2.895a51.972 51.972 0 0 1 16.234 0c.14-.96.262-1.926.375-2.895a51.782 51.782 0 0 0-16.984 0zm1.563 5.625a53.113 53.113 0 0 0 13.886 0 50.296 50.296 0 0 0 .508-2.656 52.217 52.217 0 0 0-14.902 0c.14.89.324 1.777.508 2.656zm1.168 4.383c.207.758.43 1.504.676 2.242a53.193 53.193 0 0 0 5.129.407c1.742 0 3.454-.14 5.129-.407.246-.738.469-1.484.676-2.242a52.996 52.996 0 0 0-11.61 0zm2.136 5.371a49.82 49.82 0 0 0 7.253.535 49.82 49.82 0 0 0 7.254-.535 49.606 49.606 0 0 1-1.297-2.691 53.22 53.22 0 0 1-5.957.363 53.22 53.22 0 0 1-5.957-.363 49.606 49.606 0 0 1-1.296 2.69z" />
                                    </svg>
                                  );
                                case 'unreal':
                                  return (
                                    <svg viewBox="0 0 32 32" className="w-6 h-6" fill="currentColor">
                                      <path d="M16 0c-8.766 0-15.865 7.161-15.865 16s7.099 16 15.865 16c8.76 0 15.865-7.161 15.865-16s-7.104-16-15.87-16zM16 0.703c4.047 0 7.859 1.594 10.724 4.479 2.859 2.875 4.453 6.766 4.443 10.818 0 4.083-1.578 7.927-4.443 10.818-2.828 2.87-6.693 4.484-10.724 4.479-4.031 0.005-7.896-1.609-10.724-4.479-2.859-2.875-4.458-6.766-4.448-10.818 0-4.083 1.583-7.927 4.443-10.818 2.828-2.875 6.698-4.49 10.729-4.479zM15.203 6.333c-2.583 0.693-4.974 2.021-8.161 5.677s-2.583 6.677-2.583 6.677c0 0 0.88-2.078 2.995-4.266 1.005-1.036 1.75-1.385 2.266-1.385 0.458-0.026 0.844 0.344 0.844 0.802v7.422c0 0.734-0.474 0.896-0.911 0.885-0.37-0.005-0.714-0.135-0.714-0.135 2.172 3.156 7.37 3.599 7.37 3.599l2.281-2.438 0.052 0.047 2.089 1.781c3.823-2.271 5.667-6.479 5.667-6.479-1.708 1.802-2.792 2.224-3.438 2.224-0.573-0.005-0.797-0.339-0.797-0.339-0.031-0.156-0.083-2.417-0.104-4.677-0.021-2.339 0-4.682 0.115-4.688 0.661-1.24 2.766-3.74 2.766-3.74-3.932 0.776-6.073 3.354-6.073 3.354-0.635-0.5-1.927-0.417-1.927-0.417 0.604 0.333 1.208 1.302 1.208 2.104v7.896c0 0-1.318 1.161-2.333 1.161-0.604 0-0.974-0.328-1.177-0.599-0.078-0.104-0.146-0.219-0.198-0.344v-9.75c-0.141 0.104-0.313 0.161-0.484 0.167-0.219 0-0.443-0.109-0.594-0.427-0.115-0.24-0.188-0.599-0.188-1.125 0-1.797 2.031-2.99 2.031-2.99z" />
                                    </svg>
                                  );
                                case 'gamemaker':
                                  return (
                                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm0 4c4.4 0 8 3.6 8 8s-3.6 8-8 8-8-3.6-8-8 3.6-8 8-8zm0 2c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm0 2c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4z" />
                                    </svg>
                                  );
                                case 'custom':
                                  return <ExternalLink className="w-5 h-5" />;
                                default:
                                  return null;
                              }
                            };

                            return isEditMode ? (
                              <select
                                value={project.engineIcon || 'none'}
                                onChange={(e) => updateProjectField(index, 'engineIcon', e.target.value)}
                                className="text-xs border-2 border-brand-dark rounded px-2 py-1 bg-white text-brand-dark"
                              >
                                <option value="none">No Icon</option>
                                <option value="unity">Unity</option>
                                <option value="roblox">Roblox</option>
                                <option value="godot">Godot</option>
                                <option value="unreal">Unreal</option>
                                <option value="gamemaker">GameMaker</option>
                                <option value="custom">Link Icon</option>
                              </select>
                            ) : (
                              <div className="opacity-70 text-brand-dark">
                                {renderEngineIcon(project.engineIcon)}
                              </div>
                            );
                          })()}
                        </div>
                        <EditableText initialText={project.title} storageKey={`proj_title_${project.id}`} isEditing={isEditMode} tag="h3" className="text-3xl font-black mb-4 text-brand-dark" />
                        <EditableText initialText={project.description} storageKey={`proj_desc_${project.id}`} isEditing={isEditMode} tag="p" multiline={true} className="font-medium text-sm leading-relaxed mb-6 text-brand-dark" />
                        <div className="flex justify-end gap-2 items-center">
                          {isEditMode ? (
                            <select value={project.status} onChange={(e) => updateProjectField(index, 'status', e.target.value)} className="bg-white border-2 border-brand-dark rounded px-2 py-1 text-xs font-bold text-brand-dark">
                              <option value="Prototype">Prototype</option>
                              <option value="WIP">WIP</option>
                              <option value="Released">Released</option>
                            </select>
                          ) : (
                            <span className="bg-white border-2 border-brand-dark px-3 py-1 rounded-full text-xs font-bold uppercase text-brand-dark">Status: {project.status}</span>
                          )}
                        </div>
                      </div>
                      <Card variant="orange" className="p-4 flex items-center gap-4" noShadow>
                        <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-brand-dark bg-white flex-shrink-0">
                          <Settings size={22} className="text-brand-dark" />
                        </div>
                        <div className="flex-1 text-brand-dark">
                          <span className="block text-xs font-bold uppercase opacity-70">Role</span>
                          <EditableText initialText={project.role} storageKey={`proj_role_${project.id}`} isEditing={isEditMode} tag="span" className="font-bold" />
                        </div>
                      </Card>
                      {isEditMode && (
                        <div className="bg-white p-2 border-2 border-brand-dark rounded mb-2 text-brand-dark">
                          <label className="text-xs font-bold uppercase block mb-1">Project Link:</label>
                          <div className="flex items-center gap-2">
                            <LinkIcon size={14} />
                            <input type="text" value={project.link} onChange={(e) => updateProjectField(index, 'link', e.target.value)} className="w-full text-sm focus:outline-none" />
                          </div>
                        </div>
                      )}
                      {project.status === 'WIP' ? (
                        <div className="mt-auto">
                          <Button fullWidth disabled className="flex items-center justify-center gap-2 bg-gray-400 border-gray-600 text-gray-700 cursor-not-allowed shadow-none opacity-80"><Ban size={18} /> Work In Progress</Button>
                        </div>
                      ) : (
                        <a href={project.link} target="_blank" rel="noreferrer" className="mt-auto">
                          <Button fullWidth variant="primary" className="flex items-center justify-center gap-2">View Project <ExternalLink size={18} /></Button>
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
                {isEditMode && (
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeProject(index); }}
                    className="absolute -top-6 right-0 z-40 bg-brand-red text-white p-2 rounded-t-lg font-bold flex items-center gap-2 hover:pb-4 transition-all cursor-pointer"
                    type="button"
                  >
                    <Trash2 size={16} /> Remove Project
                  </button>
                )}
              </div>
            ))}
            {isEditMode && (
              <button onClick={addProject} className="w-full border-4 border-dashed border-brand-dark/30 dark:border-brand-bg/30 rounded-xl p-8 flex flex-col items-center justify-center text-brand-dark/50 dark:text-brand-bg/50 hover:bg-brand-dark/5 dark:hover:bg-brand-bg/5 hover:border-brand-dark dark:hover:border-brand-bg hover:text-brand-dark dark:hover:text-brand-bg transition-all group">
                <Plus size={48} className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-black text-xl uppercase">Add New Project</span>
              </button>
            )}
          </div>
        </Section>

        <Section id="art-portfolio" title="Art Portfolio" isEditing={isEditMode} storageKey="title_art">
          <div className="space-y-16">
            {artCategories.map((category, catIndex) => (
              <div key={category.id} className="relative group/category">
                <div className="flex justify-between items-end relative">
                  <div className={`text-brand-dark inline-block px-6 py-2 rounded-t-xl border-x-4 border-t-4 border-brand-dark dark:border-brand-bg font-black text-xl ${catIndex % 3 === 0 ? 'bg-brand-orange text-white' : catIndex % 3 === 1 ? 'bg-brand-green' : 'bg-brand-blue'}`}>
                    <EditableText initialText={category.title} storageKey={`art_cat_title_${category.id}`} isEditing={isEditMode} tag="span" />
                  </div>
                  {isEditMode && (
                    <div className="flex gap-2 relative z-50 transform translate-y-2">
                      <button onClick={() => addArtItem(catIndex)} className="bg-brand-yellow text-brand-dark px-3 py-1 rounded-t-lg font-bold border-t-2 border-x-2 border-brand-dark hover:scale-105 transition-transform flex gap-2 items-center text-sm"><Plus size={14} /> Add Media</button>

                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeArtCategory(catIndex); }}
                        className="bg-brand-red text-white px-3 py-1 rounded-t-lg font-bold border-t-2 border-x-2 border-brand-dark flex gap-2 items-center text-sm cursor-pointer hover:scale-105 transition-transform"
                        type="button"
                      >
                        <Trash2 size={14} /> Remove Group
                      </button>
                    </div>
                  )}
                </div>
                <Card variant="white" className="p-6 rounded-tl-none relative z-40" disableHover>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                    {category.items.map((item, itemIndex) => {
                      // Get all images for this item (backward compatible)
                      const images = item.urls && item.urls.length > 0 ? item.urls : [item.url];
                      const hasMultipleImages = images.length > 1;

                      return (
                        <div key={item.id} className="group relative border-4 border-brand-dark dark:border-brand-bg rounded-xl overflow-hidden bg-black/5">
                          {/* Gallery Container with Horizontal Scroll */}
                          <div className="relative">
                            <div
                              id={`gallery-${item.id}`}
                              className={`flex overflow-x-auto snap-x snap-mandatory scrollbar-hide ${hasMultipleImages ? 'cursor-grab active:cursor-grabbing' : ''}`}
                              style={{
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                                WebkitOverflowScrolling: 'touch',
                              }}
                              onWheel={(e) => {
                                if (hasMultipleImages) {
                                  e.preventDefault();
                                  e.currentTarget.scrollLeft += e.deltaY;
                                }
                              }}
                              onScroll={(e) => {
                                if (hasMultipleImages) {
                                  const target = e.currentTarget;
                                  const currentIndex = Math.round(target.scrollLeft / target.clientWidth) + 1;
                                  const indicator = document.getElementById(`indicator-${item.id}`);
                                  if (indicator) {
                                    indicator.textContent = `${currentIndex}/${images.length}`;
                                  }
                                }
                              }}
                            >
                              {images.map((imgUrl, imgIndex) => (
                                <div key={imgIndex} className="flex-shrink-0 w-full snap-center relative">
                                  <EditableMedia
                                    src={imgUrl}
                                    alt={`${category.title} ${itemIndex + 1} - ${imgIndex + 1}`}
                                    className="w-full h-auto block transition-transform duration-500"
                                    wrapperClassName="w-full h-auto"
                                    storageKey={`art_item_${item.id}_${imgIndex}`}
                                    isEditing={isEditMode}
                                    onUpdate={(newUrl) => updateArtItemImage(catIndex, itemIndex, imgIndex, newUrl)}
                                  />
                                  {/* Remove individual image button (only show if more than 1 image) */}
                                  {isEditMode && images.length > 1 && (
                                    <button
                                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeImageFromArtItem(catIndex, itemIndex, imgIndex); }}
                                      className="absolute bottom-12 right-2 bg-brand-red text-white px-2 py-1 rounded text-xs font-bold border-2 border-white z-40 shadow-sm cursor-pointer flex items-center gap-1"
                                      type="button"
                                    >
                                      <Trash2 size={12} /> Remove
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Navigation arrows for horizontal scroll - visible in both modes */}
                            {hasMultipleImages && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const gallery = document.getElementById(`gallery-${item.id}`);
                                    if (gallery) gallery.scrollBy({ left: -gallery.clientWidth, behavior: 'smooth' });
                                  }}
                                  className={`absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-opacity z-50 ${isEditMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                  aria-label="Previous"
                                  type="button"
                                >
                                  <ChevronDown size={20} className="rotate-90" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const gallery = document.getElementById(`gallery-${item.id}`);
                                    if (gallery) gallery.scrollBy({ left: gallery.clientWidth, behavior: 'smooth' });
                                  }}
                                  className={`absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-opacity z-50 ${isEditMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                  aria-label="Next"
                                  type="button"
                                >
                                  <ChevronDown size={20} className="-rotate-90" />
                                </button>
                              </>
                            )}

                            {/* Image counter indicator - shows current/total */}
                            {hasMultipleImages && (
                              <div
                                id={`indicator-${item.id}`}
                                className="absolute bottom-12 left-2 bg-black/70 text-white text-sm px-3 py-1 rounded-full font-bold z-30"
                              >
                                1/{images.length}
                              </div>
                            )}

                            {/* Add image to gallery button */}
                            {isEditMode && (
                              <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); addImageToArtItem(catIndex, itemIndex); }}
                                className="absolute top-2 left-2 bg-brand-green text-brand-dark px-2 py-1 rounded text-xs font-bold border-2 border-brand-dark z-40 shadow-sm cursor-pointer flex items-center gap-1 hover:scale-105 transition-transform"
                                type="button"
                              >
                                <Plus size={12} /> Add to Gallery
                              </button>
                            )}
                          </div>

                          {/* Title overlay with smooth gradient - from transparent to dark */}
                          <div
                            className={`px-4 py-3 transition-opacity duration-300 ${isEditMode ? 'relative bg-gradient-to-t from-black/90 to-black/70' : 'absolute bottom-0 left-0 right-0 pt-12 opacity-0 group-hover:opacity-100'}`}
                            style={isEditMode ? {} : {
                              background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.3) 60%, transparent 100%)'
                            }}
                          >
                            <EditableText
                              initialText={`Artwork #${itemIndex + 1}`}
                              storageKey={`art_desc_${item.id}`}
                              isEditing={isEditMode}
                              className="art-title text-white font-black uppercase tracking-wider drop-shadow-lg text-center"
                              tag="div"
                            />
                          </div>

                          {/* Remove entire art item button */}
                          {isEditMode && (
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeArtItem(catIndex, itemIndex); }} className="absolute top-2 right-2 bg-brand-red text-white p-1 rounded border-2 border-white z-40 shadow-sm cursor-pointer" type="button">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {category.items.length === 0 && (
                      <div className="col-span-full py-12 text-center opacity-50 font-bold border-2 border-dashed border-brand-dark dark:border-brand-bg rounded-xl">No items yet. Click "Add Media" to start!</div>
                    )}
                  </div>
                </Card>
              </div>
            ))}
            {isEditMode && (
              <button onClick={addArtCategory} className="w-full border-4 border-dashed border-brand-dark/30 dark:border-brand-bg/30 rounded-xl p-8 flex flex-col items-center justify-center text-brand-dark/50 dark:text-brand-bg/50 hover:bg-brand-dark/5 dark:hover:bg-brand-bg/5 hover:border-brand-dark dark:hover:border-brand-bg hover:text-brand-dark dark:hover:text-brand-bg transition-all group">
                <Plus size={48} className="mb-2 group-hover:scale-100 transition-transform" />
                <span className="font-black text-xl uppercase">Add New Portfolio Group</span>
              </button>
            )}
          </div>
        </Section>

        <Section id="certificates" title="Certificates" isEditing={isEditMode} storageKey="title_certs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {dynamicCertificates.map((cert, index) => (
              <div key={cert.id} className="relative group/cert">
                <Card variant="white" className="p-4 group cursor-pointer hover:-translate-y-1 transition-transform" noShadow={false}>
                  <div className="border-2 border-brand-dark dark:border-brand-bg rounded-lg overflow-hidden mb-4 relative" onClick={() => setSelectedCertificate(cert)}>
                    <EditableImage src={cert.image} alt={cert.title} className="w-full h-auto object-contain grayscale group-hover:grayscale-0 transition-all" storageKey={`cert_img_${cert.id}`} isEditing={isEditMode} wrapperClassName="w-full" />
                  </div>
                  <div className={`p-3 rounded-lg border-2 border-brand-dark dark:border-brand-bg text-center font-bold text-brand-dark ${index % 2 === 0 ? 'bg-brand-orange' : 'bg-brand-blue'}`}>
                    <EditableText initialText={cert.title} storageKey={`cert_title_${cert.id}`} isEditing={isEditMode} tag="span" />
                  </div>
                  {isEditMode && (
                    <div className="mt-2 text-xs text-center border-t border-dashed border-gray-400 dark:border-brand-bg/50 pt-2 text-brand-dark dark:text-brand-bg">
                      <span className="font-bold">Issuer: </span>
                      <EditableText initialText={cert.issuer} storageKey={`cert_iss_${cert.id}`} isEditing={true} tag="span" />
                      <span className="mx-2">|</span>
                      <EditableText initialText={cert.date} storageKey={`cert_date_${cert.id}`} isEditing={true} tag="span" />
                    </div>
                  )}
                </Card>
                {isEditMode && (
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeCertificate(index); }}
                    className="absolute -top-3 -right-3 bg-brand-red text-white p-2 rounded-full border-2 border-brand-dark shadow-retro-sm z-40 cursor-pointer"
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            {isEditMode && (
              <button onClick={addCertificate} className="min-h-[250px] border-4 border-dashed border-brand-dark/30 dark:border-brand-bg/30 rounded-xl flex flex-col items-center justify-center text-brand-dark/50 dark:text-brand-bg/50 hover:bg-brand-dark/5 dark:hover:bg-brand-bg/5 hover:border-brand-dark dark:hover:border-brand-bg hover:text-brand-dark dark:hover:text-brand-bg transition-all">
                <Plus size={32} />
                <span className="font-bold mt-2">Add Certificate</span>
              </button>
            )}
          </div>
        </Section>
        {selectedCertificate && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedCertificate(null)}>
            <div className="bg-brand-bg dark:bg-brand-dark-bg p-2 rounded-xl border-4 border-brand-dark dark:border-brand-bg max-w-3xl w-full shadow-retro dark:shadow-retro-light relative animate-bounce-in" onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedCertificate(null)} className="absolute -top-4 -right-4 bg-brand-red text-white p-2 rounded-full border-2 border-brand-dark dark:border-brand-bg shadow-retro-sm dark:shadow-retro-sm-light hover:scale-110 transition-transform z-10">
                <X size={24} />
              </button>
              <div className="border-2 border-brand-dark dark:border-brand-bg rounded-lg overflow-hidden">
                <img src={selectedCertificate.image} alt={selectedCertificate.title} className="w-full h-auto max-h-[70vh] object-contain bg-black/5" />
              </div>
              <div className="p-4 text-center">
                <h3 className="text-2xl font-black text-brand-dark dark:text-brand-bg mb-1">{selectedCertificate.title}</h3>
                <p className="font-bold text-lg text-brand-dark/70 dark:text-brand-bg/70">{selectedCertificate.issuer} • {selectedCertificate.date}</p>
              </div>
            </div>
          </div>
        )}
        <Section id="contact" title="Contact Me" isEditing={isEditMode} storageKey="title_contact">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dynamicContactButtons.map((btn, index) => {
                  // Helper function to render icon
                  const renderIcon = (iconType: string) => {
                    switch (iconType) {
                      case 'instagram': return <Instagram size={32} />;
                      case 'phone': return <Phone size={32} />;
                      case 'mail': return <Mail size={32} />;
                      case 'linkedin': return <Linkedin size={32} />;
                      case 'github': return <Github size={32} />;
                      case 'discord': return (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.2 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09 0 .11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.48-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-9.21-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.85 2.12-1.89 2.12z" /></svg>
                      );
                      default: return <LinkIcon size={32} />;
                    }
                  };

                  // Get hover color based on variant
                  const getHoverColor = (variant: string) => {
                    switch (variant) {
                      case 'blue': return 'hover:bg-[#5AC5E3]';
                      case 'orange': return 'hover:bg-[#FF8E52]';
                      case 'yellow': return 'hover:bg-[#FCE06D]';
                      case 'green': return 'hover:bg-[#68D2AD]';
                      default: return 'hover:bg-gray-200';
                    }
                  };

                  return (
                    <div key={btn.id} className="relative group/contact">
                      {isEditMode ? (
                        <Card variant={btn.variant} className="p-4 text-brand-dark">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 justify-between">
                              <div className="flex items-center gap-2">
                                {renderIcon(btn.icon)}
                                <input
                                  type="text"
                                  value={btn.label}
                                  onChange={(e) => updateContactButton(index, 'label', e.target.value)}
                                  className="font-bold text-lg bg-white/50 border border-brand-dark rounded px-2 py-1 w-28"
                                  placeholder="Label"
                                />
                              </div>
                              <button
                                onClick={() => removeContactButton(index)}
                                className="bg-brand-red text-white p-1.5 rounded-md hover:scale-110 transition-transform"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <select
                                value={btn.icon}
                                onChange={(e) => updateContactButton(index, 'icon', e.target.value)}
                                className="text-xs border border-brand-dark rounded px-2 py-1 bg-white"
                              >
                                <option value="instagram">Instagram</option>
                                <option value="phone">Phone</option>
                                <option value="mail">Email</option>
                                <option value="discord">Discord</option>
                                <option value="linkedin">LinkedIn</option>
                                <option value="github">GitHub</option>
                                <option value="link">Link</option>
                              </select>
                              <select
                                value={btn.variant}
                                onChange={(e) => updateContactButton(index, 'variant', e.target.value)}
                                className="text-xs border border-brand-dark rounded px-2 py-1 bg-white"
                              >
                                <option value="blue">Blue</option>
                                <option value="orange">Orange</option>
                                <option value="yellow">Yellow</option>
                                <option value="green">Green</option>
                                <option value="white">White</option>
                              </select>
                            </div>
                            <input
                              type="text"
                              value={btn.displayText}
                              onChange={(e) => updateContactButton(index, 'displayText', e.target.value)}
                              className="w-full font-bold text-sm bg-white/50 border border-brand-dark rounded px-2 py-1"
                              placeholder="Display Text (e.g. @username)"
                            />
                            <div className="flex items-center gap-1 bg-white/50 border border-brand-dark rounded px-2 py-1">
                              <LinkIcon size={14} />
                              <input
                                type="text"
                                value={btn.url}
                                onChange={(e) => updateContactButton(index, 'url', e.target.value)}
                                className="w-full text-xs bg-transparent focus:outline-none"
                                placeholder="https://..."
                              />
                            </div>
                          </div>
                        </Card>
                      ) : (
                        <a href={btn.url} target="_blank" rel="noreferrer">
                          <Card variant={btn.variant} className={`p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${getHoverColor(btn.variant)} cursor-pointer text-brand-dark`}>
                            <div className="flex items-center gap-4 flex-shrink-0">
                              {renderIcon(btn.icon)}
                              <span className="font-bold text-lg">{btn.label}</span>
                            </div>
                            <span className="font-black text-xs md:text-sm sm:text-right">{btn.displayText}</span>
                          </Card>
                        </a>
                      )}
                    </div>
                  );
                })}
                {isEditMode && (
                  <button
                    onClick={addContactButton}
                    className="min-h-[80px] border-4 border-dashed border-brand-dark/30 dark:border-brand-bg/30 rounded-xl flex flex-col items-center justify-center text-brand-dark/50 dark:text-brand-bg/50 hover:bg-brand-dark/5 dark:hover:bg-brand-bg/5 hover:border-brand-dark dark:hover:border-brand-bg hover:text-brand-dark dark:hover:text-brand-bg transition-all"
                  >
                    <Plus size={24} />
                    <span className="font-bold text-sm mt-1">Add Contact</span>
                  </button>
                )}
              </div>
              <Card variant="white" className="p-6">
                <h3 className="text-xl font-black mb-4 uppercase flex items-center gap-2 text-brand-dark dark:text-brand-bg"><Mail size={24} /> Send me an email</h3>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1 text-brand-dark dark:text-brand-bg">Your Name</label>
                    <input type="text" required value={contactForm.name} onChange={(e) => handleContactFormChange('name', e.target.value)} className="w-full border-2 border-brand-dark dark:border-brand-bg p-2 rounded-lg bg-brand-bg dark:bg-brand-dark-bg dark:text-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-orange" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1 text-brand-dark dark:text-brand-bg">Your Email</label>
                    <input type="email" required value={contactForm.email} onChange={(e) => handleContactFormChange('email', e.target.value)} className="w-full border-2 border-brand-dark dark:border-brand-bg p-2 rounded-lg bg-brand-bg dark:bg-brand-dark-bg dark:text-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-orange" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1 text-brand-dark dark:text-brand-bg">Message</label>
                    <textarea required value={contactForm.message} onChange={(e) => handleContactFormChange('message', e.target.value)} className="w-full border-2 border-brand-dark dark:border-brand-bg p-2 rounded-lg bg-brand-bg dark:bg-brand-dark-bg dark:text-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-orange h-32 resize-none" placeholder="Let's build something awesome..." />
                  </div>
                  <Button type="submit" fullWidth className="flex justify-center items-center gap-2"><Send size={18} /> Send Email</Button>
                </form>
              </Card>
            </div>
            <div className="lg:col-span-1">
              <Card variant="white" className="h-full p-2" noShadow>
                <EditableImage src="https://picsum.photos/seed/adam/600/800" alt="Profile Contact" className="w-full h-full object-cover rounded-lg border-2 border-brand-dark dark:border-brand-bg grayscale hover:grayscale-0 transition-all duration-500" storageKey="profile_contact" isEditing={isEditMode} />
              </Card>
            </div>
          </div>
        </Section>
        <footer className="bg-brand-dark dark:bg-brand-dark-bg text-brand-bg border-t-4 border-brand-bg dark:border-brand-dark-bg py-12 text-center font-bold">
          <p className="text-2xl md:text-3xl">Thanks for checking out my portfolio :D</p>
        </footer>
      </div>
    </>
  );
}

export default App;