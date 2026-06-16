import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Download, Upload, ExternalLink, Mail, Phone, Instagram, Linkedin, Github, Pencil, RotateCcw, Check, Plus, Trash2, Ban, Send, Link as LinkIcon, ChevronDown, Settings, Video, AlertTriangle, Moon, Sun, RefreshCw, Home, Briefcase, FolderOpen, Eye, ArrowUpRight, Images, GripVertical } from 'lucide-react';
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
  CONTACT_BUTTONS,
  CUSTOM_TEXTS,
  CUSTOM_IMAGES
} from './constants';
import { SkillCategory, Project, Experience, Certificate, ArtCategory, ArtItem, ContactButton } from './types';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPortfolioMenuOpen, setIsPortfolioMenuOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [portfolioDropdownOpen, setPortfolioDropdownOpen] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [expandedExperienceId, setExpandedExperienceId] = useState<string | null>(null);
  const [expandedArtCategories, setExpandedArtCategories] = useState<Record<string, boolean>>({});
  const [expandedArtItemId, setExpandedArtItemId] = useState<string | null>(null);
  const [selectedArtPreview, setSelectedArtPreview] = useState<{
    title: string;
    url: string;
    storageKey: string;
  } | null>(null);
  const [dragPayload, setDragPayload] = useState<{
    type: string;
    fromIndex: number;
    catIndex?: number;
    itemIndex?: number;
    certIndex?: number;
  } | null>(null);
  const projectDetailRef = useRef<HTMLDivElement>(null);

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
    let data = CERTIFICATES;
    try {
      const saved = localStorage.getItem('user_certificates');
      if (saved) data = JSON.parse(saved);
    } catch (e) { console.error(e); }
    // Ensure structure
    return data.map(cert => ({
      ...cert,
      urls: cert.urls || [cert.image],
      description: cert.description || ''
    }));
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

    // Default values from constants
    // Helper to process items whether they are legacy strings or full objects
    const processItems = (items: any[], prefix: string) => {
      return items.map((item, i) => {
        if (typeof item === 'string') {
          return { id: `${prefix}_init_${i}_${Date.now()}`, url: item, type: 'image' };
        }
        return {
          ...item,
          // Ensure ID exists if missing from constant
          id: item.id || `${prefix}_init_${i}_${Date.now()}`
        };
      });
    };

    return [
      {
        id: '3d',
        title: '3D Portfolio',
        items: processItems(PORTFOLIO_3D || [], '3d')
      },
      {
        id: '2d',
        title: '2D Portfolio',
        items: processItems(PORTFOLIO_2D || [], '2d')
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
  const handleFactoryReset = () => {
    if (confirm('RESET WARNING: This will delete ALL local changes (text & images) and revert the portfolio to the version currently on GitHub/constants.ts.\n\nAre you sure you want to Sync/Reset?')) {
      localStorage.clear();
      // Keep theme preference
      if (document.documentElement.classList.contains('dark')) {
        localStorage.setItem('theme', 'dark');
      }
      window.location.reload();
    }
  };

  const cleanupStorage = () => {
    if (!confirm('This will remove data from deleted items to free up space. Continue?')) return;

    // 1. Collect all valid active IDs
    const validIds = new Set<string>();

    dynamicProjects.forEach(p => validIds.add(p.id));
    dynamicExperiences.forEach(e => validIds.add(e.id));
    dynamicCertificates.forEach(c => validIds.add(c.id));
    dynamicContactButtons.forEach(b => validIds.add(b.id));
    artCategories.forEach(cat => {
      validIds.add(cat.id);
      cat.items.forEach(item => validIds.add(item.id));
    });

    // 2. Scan localStorage for orphaned keys
    let deletedCount = 0;
    let freedSpace = 0;
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      // Skip non-data keys
      if (key === 'theme' || !key.includes('_')) continue;
      if (key.startsWith('user_')) continue; // Don't delete main state data

      // Check if key contains an ID-like pattern
      // Patterns: proj_..., exp_..., cert_..., art_item_..., cat_..., contact_...
      // Plus legacy: 3d_init_..., 2d_init_...

      let looksLikeOrphan = false;
      let checked = false;

      // List of prefixes that are followed by an ID
      const prefixes = ['proj_', 'exp_', 'cert_', 'art_item_', 'cat_', 'contact_', '3d_init_', '2d_init_', '3d_mig_', '2d_mig_'];

      for (const prefix of prefixes) {
        if (key.includes(prefix)) {
          checked = true;
          // Extract ID - assuming ID is the part after the prefix until end or next underscore (if simple/complex)
          // Actually, our IDs are usually unique enough.
          // Let's check if ANY valid ID is a substring of this key.
          // If the key contains a prefix like "proj_" but DOESN'T contain any valid project ID, it's likely orphan.

          // Better strategy: Extract the ID from the key.
          // Most keys are: text_PREFIX_ID... or img_PREFIX_ID... or just PREFIX_ID...
          // But IDs can contain underscores.

          // Let's try: Check if the key relates to a specific type
          if (key.includes('proj_') && !dynamicProjects.some(p => key.includes(p.id))) { looksLikeOrphan = true; break; }
          if (key.includes('exp_') && !dynamicExperiences.some(e => key.includes(e.id))) { looksLikeOrphan = true; break; }
          if (key.includes('cert_') && !dynamicCertificates.some(c => key.includes(c.id))) { looksLikeOrphan = true; break; }
          if (key.includes('contact_') && !dynamicContactButtons.some(b => key.includes(b.id))) { looksLikeOrphan = true; break; }

          // Art items are tricky because ID is art_item_...
          if (key.includes('art_item_')) {
            const hasValidArtId = artCategories.some(cat => cat.items.some(item => key.includes(item.id)));
            if (!hasValidArtId) { looksLikeOrphan = true; break; }
          }
        }
      }

      if (looksLikeOrphan) {
        keysToRemove.push(key);
      }
    }

    // 3. Delete
    keysToRemove.forEach(key => {
      const val = localStorage.getItem(key);
      freedSpace += val ? val.length : 0;
      localStorage.removeItem(key);
      deletedCount++;
    });

    const mbFreed = (freedSpace / 1024 / 1024).toFixed(2);
    alert(`Cleanup complete!\nRemoved ${deletedCount} unused items.\nFreed ${mbFreed} MB of space.`);
  };
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // Helper to ensure IDs exist
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (!activeProjectId) return;
    const frame = window.requestAnimationFrame(() => {
      projectDetailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeProjectId]);

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

    alert('Data portfolio berhasil di-export! File JSON telah diunduh!\n\nUntuk membuat perubahan permanen:\n1. Buka file JSON yang diunduh\n2. Copy isi data ke file constants.ts\n3. Re-deploy website Anda');
  };

  // Export as ready-to-use constants.ts file
  // FULL MERGE: All edits from BOTH constants.ts AND localStorage are merged
  const exportAsConstantsFile = () => {
    // 1. Clone all data to avoid mutating state
    const exportSkills = JSON.parse(JSON.stringify(dynamicSkills));
    const exportProjects = JSON.parse(JSON.stringify(dynamicProjects));
    const exportExperiences = JSON.parse(JSON.stringify(dynamicExperiences));
    const exportCertificates = JSON.parse(JSON.stringify(dynamicCertificates));
    const exportContactButtons = JSON.parse(JSON.stringify(dynamicContactButtons));
    const exportEducation = JSON.parse(JSON.stringify(EDUCATION));
    const exportSocial = JSON.parse(JSON.stringify(SOCIAL_LINKS));

    const art3dIndex = artCategories.findIndex(c => c.id === '3d');
    const art2dIndex = artCategories.findIndex(c => c.id === '2d');
    const exportArt3D = art3dIndex >= 0 ? JSON.parse(JSON.stringify(artCategories[art3dIndex].items)) : [];
    const exportArt2D = art2dIndex >= 0 ? JSON.parse(JSON.stringify(artCategories[art2dIndex].items)) : [];

    // For any edits that can't be merged into known structures
    const remainingTexts: Record<string, string> = {};
    const remainingImages: Record<string, string> = {};

    // Helper function to merge a text key into data objects
    const mergeTextKey = (k: string, val: string): boolean => {
      // --- Projects ---
      for (const proj of exportProjects) {
        if (k === `proj_title_${proj.id}`) { proj.title = val; return true; }
        if (k === `proj_desc_${proj.id}`) { proj.description = val; return true; }
        if (k === `proj_category_${proj.id}` || k === `proj_cat_${proj.id}`) { proj.category = val; return true; }
        if (k === `proj_engine_${proj.id}` || k === `proj_eng_${proj.id}`) { proj.engine = val; return true; }
        if (k === `proj_role_${proj.id}`) { proj.role = val; return true; }
        if (k === `proj_status_${proj.id}`) { proj.status = val; return true; }
        if (k === `proj_link_${proj.id}`) { proj.link = val; return true; }
      }
      // --- Experiences ---
      for (const exp of exportExperiences) {
        if (k === `exp_role_${exp.id}`) { exp.role = val; return true; }
        if (k === `exp_company_${exp.id}`) { exp.company = val; return true; }
        if (k === `exp_desc_${exp.id}`) { exp.description = val; return true; }
        if (k === `exp_period_${exp.id}`) { exp.period = val; return true; }
        if (k === `exp_type_${exp.id}`) { exp.type = val; return true; }
        if (k === `exp_keynotes_${exp.id}` || k === `exp_notes_${exp.id}`) { exp.keyNotes = val; return true; }
      }
      // --- Certificates ---
      for (const cert of exportCertificates) {
        if (k === `cert_title_${cert.id}`) { cert.title = val; return true; }
        if (k === `cert_desc_${cert.id}`) { cert.description = val; return true; }
        if (k === `cert_issuer_${cert.id}` || k === `cert_iss_${cert.id}`) { cert.issuer = val; return true; }
        if (k === `cert_date_${cert.id}`) { cert.date = val; return true; }
      }
      // --- Skills ---
      for (const cat of exportSkills) {
        if (k === `skill_cat_${cat.title}`) { cat.title = val; return true; }
      }
      // --- Contact Buttons ---
      for (const btn of exportContactButtons) {
        if (k === `contact_label_${btn.id}`) { btn.label = val; return true; }
        if (k === `contact_text_${btn.id}`) { btn.displayText = val; return true; }
        if (k === `contact_url_${btn.id}`) { btn.url = val; return true; }
      }
      // --- Art Items (description) ---
      for (const art of exportArt3D) {
        if (k === `art_title_${art.id}` || k === `art_desc_${art.id}`) { art.description = val; return true; }
      }
      for (const art of exportArt2D) {
        if (k === `art_title_${art.id}` || k === `art_desc_${art.id}`) { art.description = val; return true; }
      }
      // --- Education (by index) ---
      const eduMatch = k.match(/^edu_(\w+)_(\d+)$/);
      if (eduMatch) {
        const field = eduMatch[1];
        const idx = parseInt(eduMatch[2]);
        if (exportEducation[idx]) {
          if (field === 'inst') exportEducation[idx].institution = val;
          else if (field === 'degree') exportEducation[idx].degree = val;
          else if (field === 'desc') exportEducation[idx].description = val;
          else if (field === 'score') exportEducation[idx].score = val;
          else if (field === 'scorelabel') exportEducation[idx].scoreLabel = val;
          return true;
        }
      }
      // --- Social Links ---
      if (k.startsWith('social_')) {
        const platform = k.replace('social_', '');
        if (platform in exportSocial) {
          (exportSocial as any)[platform] = val;
          return true;
        }
      }
      return false;
    };

    // Helper function to merge an image key into data objects
    const mergeImageKey = (k: string, val: string): boolean => {
      // --- Projects ---
      for (const proj of exportProjects) {
        if (k === `proj_img_${proj.id}`) { proj.image = val; return true; }
        const ssMatch = k.match(new RegExp(`^proj_ss_(\\d+)_${proj.id}$`));
        if (ssMatch) {
          const ssIdx = parseInt(ssMatch[1]);
          if (!proj.screenshots) proj.screenshots = [];
          proj.screenshots[ssIdx] = val;
          return true;
        }
      }
      // --- Experiences ---
      for (const exp of exportExperiences) {
        if (k === `exp_img_${exp.id}` || k === `exp_logo_${exp.id}`) { exp.image = val; return true; }
      }
      // --- Certificates ---
      for (const cert of exportCertificates) {
        if (k === `cert_img_${cert.id}`) { cert.image = val; return true; }
      }
      // --- Art Items ---
      for (const art of exportArt3D) {
        if (k === `art_item_${art.id}`) { art.url = val; return true; }
      }
      for (const art of exportArt2D) {
        if (k === `art_item_${art.id}`) { art.url = val; return true; }
      }
      // --- Education (by index) ---
      const eduImgMatch = k.match(/^edu_img_(\d+)$/);
      if (eduImgMatch) {
        const idx = parseInt(eduImgMatch[1]);
        if (exportEducation[idx]) { exportEducation[idx].image = val; return true; }
      }
      return false;
    };

    // 2. FIRST: Merge from CUSTOM_TEXTS in constants.ts (already deployed edits)
    if (CUSTOM_TEXTS) {
      for (const [k, val] of Object.entries(CUSTOM_TEXTS)) {
        if (!mergeTextKey(k, val)) {
          remainingTexts[k] = val;
        }
      }
    }

    // 3. THEN: Merge from CUSTOM_IMAGES in constants.ts
    if (CUSTOM_IMAGES) {
      for (const [k, val] of Object.entries(CUSTOM_IMAGES)) {
        if (!mergeImageKey(k, val)) {
          remainingImages[k] = val;
        }
      }
    }

    // 4. FINALLY: Merge from localStorage (overwrites constants.ts data with newer edits)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const val = localStorage.getItem(key);
      if (!val) continue;
      // Use helper functions to merge
      if (key.startsWith('text_')) {
        const k = key.replace('text_', '');
        if (!mergeTextKey(k, val)) {
          remainingTexts[k] = val;
        }
      }
      else if (key.startsWith('media_') || key.startsWith('img_')) {
        const k = key.replace(/^(media_|img_)/, '');
        if (!mergeImageKey(k, val)) {
          remainingImages[k] = val;
        }
      }
    }

    // 3. Generate TypeScript code with MERGED data
    const tsCode = `// Auto-generated from portfolio export on ${new Date().toISOString()}
// 100% LOCAL DATA - Replace your constants.ts with this file

import { SkillCategory, Project, Experience, Certificate, ContactButton, ArtItem, Education } from './types';

export const SKILL_CATEGORIES: SkillCategory[] = ${JSON.stringify(exportSkills, null, 2)};

export const PROJECTS: Project[] = ${JSON.stringify(exportProjects, null, 2)};

export const EXPERIENCES: Experience[] = ${JSON.stringify(exportExperiences, null, 2)};

export const CERTIFICATES: Certificate[] = ${JSON.stringify(exportCertificates, null, 2)};

export const CONTACT_BUTTONS: ContactButton[] = ${JSON.stringify(exportContactButtons, null, 2)};

export const PORTFOLIO_3D: ArtItem[] = ${JSON.stringify(exportArt3D, null, 2)};

export const PORTFOLIO_2D: ArtItem[] = ${JSON.stringify(exportArt2D, null, 2)};

export const EDUCATION: Education[] = ${JSON.stringify(exportEducation, null, 2)};

export const SOCIAL_LINKS = ${JSON.stringify(exportSocial, null, 2)};

// Remaining custom overrides (for fields not in main structures)
export const CUSTOM_TEXTS: Record<string, string> = ${JSON.stringify(remainingTexts, null, 2)};
export const CUSTOM_IMAGES: Record<string, string> = ${JSON.stringify(remainingImages, null, 2)};
`;

    // Download
    const blob = new Blob([tsCode], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `constants_${new Date().toISOString().split('T')[0]}.ts`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(
      '✅ PUBLISH BERHASIL!\n\n' +
      '📦 100% DATA LOKAL ANDA SUDAH DI-EXPORT:\n' +
      '• Semua judul, deskripsi → langsung di dalam PROJECTS\n' +
      '• Semua gambar → langsung di dalam objek masing-masing\n' +
      '• Education & Social Links → sudah ter-update\n\n' +
      '📋 CARA PAKAI:\n' +
      '1. Buka file yang diunduh\n' +
      '2. Ctrl+A → Ctrl+C\n' +
      '3. Timpa SEMUA isi constants.ts\n' +
      '4. Save & Deploy\n\n' +
      '🔥 Data server akan 100% diganti dengan data lokal Anda!'
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
    setIsPortfolioMenuOpen(false);
    if (href === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsMenuOpen(false);
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

  const reorderItems = <T,>(items: T[], fromIndex: number, toIndex: number): T[] => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= items.length || toIndex >= items.length) {
      return items;
    }
    const nextItems = [...items];
    const [moved] = nextItems.splice(fromIndex, 1);
    nextItems.splice(toIndex, 0, moved);
    return nextItems;
  };

  const handleDragStart = (
    event: React.DragEvent<HTMLElement>,
    payload: {
      type: string;
      fromIndex: number;
      catIndex?: number;
      itemIndex?: number;
      certIndex?: number;
    }
  ) => {
    if (!isEditMode) return;
    event.stopPropagation();
    setDragPayload(payload);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/json', JSON.stringify(payload));
  };

  const allowDrop = (event: React.DragEvent<HTMLElement>) => {
    if (!isEditMode) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const getDropPayload = (event: React.DragEvent<HTMLElement>) => {
    try {
      const rawPayload = event.dataTransfer.getData('application/json');
      return rawPayload ? JSON.parse(rawPayload) : dragPayload;
    } catch {
      return dragPayload;
    }
  };

  const moveProjectTo = (fromIndex: number, toIndex: number) => {
    setDynamicProjects(prev => {
      const updated = reorderItems(prev, fromIndex, toIndex);
      save('user_projects', updated);
      return updated;
    });
  };

  const moveExperienceTo = (fromIndex: number, toIndex: number) => {
    setDynamicExperiences(prev => {
      const updated = reorderItems(prev, fromIndex, toIndex);
      save('user_experiences', updated);
      return updated;
    });
  };

  const moveCertificateTo = (fromIndex: number, toIndex: number) => {
    setDynamicCertificates(prev => {
      const updated = reorderItems(prev, fromIndex, toIndex);
      save('user_certificates', updated);
      return updated;
    });
  };

  const moveContactButtonTo = (fromIndex: number, toIndex: number) => {
    setDynamicContactButtons(prev => {
      const updated = reorderItems(prev, fromIndex, toIndex);
      save('user_contact_buttons', updated);
      return updated;
    });
  };

  const moveSkillCategoryTo = (fromIndex: number, toIndex: number) => {
    setDynamicSkills(prev => {
      const updated = reorderItems(prev, fromIndex, toIndex);
      save('user_skills', updated);
      return updated;
    });
  };

  const moveSkillTo = (catIndex: number, fromIndex: number, toIndex: number) => {
    setDynamicSkills(prev => {
      const updated = prev.map((category, index) => (
        index === catIndex
          ? { ...category, skills: reorderItems(category.skills, fromIndex, toIndex) }
          : category
      ));
      save('user_skills', updated);
      return updated;
    });
  };

  const moveProjectScreenshotTo = (projectIndex: number, fromIndex: number, toIndex: number) => {
    setDynamicProjects(prev => {
      const updated = prev.map((project, index) => (
        index === projectIndex
          ? { ...project, screenshots: reorderItems(project.screenshots, fromIndex, toIndex) }
          : project
      ));
      save('user_projects', updated);
      return updated;
    });
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
    setActiveProjectId(newProject.id);
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
      image: "https://picsum.photos/seed/newcert/600/400",
      urls: ["https://picsum.photos/seed/newcert/600/400"],
      description: "Certificate description goes here."
    };
    setDynamicCertificates(prev => {
      const updated = [...prev, newCert];
      save('user_certificates', updated);
      return updated;
    });
  };
  const removeCertificate = (index: number) => {
    setDynamicCertificates(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      save('user_certificates', updated);
      return updated;
    });
  };
  const updateCertificateImage = (index: number, newUrl: string) => {
    setDynamicCertificates(prev => {
      const updated = prev.map((cert, i) => {
        if (i === index) {
          const newUrls = cert.urls ? [...cert.urls] : [cert.image];
          if (newUrls.length > 0) newUrls[0] = newUrl; else newUrls.push(newUrl);
          return { ...cert, image: newUrl, urls: newUrls };
        }
        return cert;
      });
      save('user_certificates', updated);
      return updated;
    });
  };
  const addCertificateImage = (index: number) => {
    setDynamicCertificates(prev => {
      const updated = prev.map((cert, i) => {
        if (i === index) {
          return { ...cert, urls: [...(cert.urls || [cert.image]), `https://picsum.photos/seed/cert_${Date.now()}/600/400`] };
        }
        return cert;
      });
      save('user_certificates', updated);
      return updated;
    });
  };
  const removeCertificateImage = (certIndex: number, imgIndex: number) => {
    setDynamicCertificates(prev => {
      const updated = prev.map((cert, i) => {
        if (i === certIndex) {
          const newUrls = (cert.urls || [cert.image]).filter((_, idx) => idx !== imgIndex);
          if (newUrls.length === 0) return cert;
          return { ...cert, image: newUrls[0], urls: newUrls };
        }
        return cert;
      });
      save('user_certificates', updated);
      return updated;
    });
  };
  const updateCertificateImageAtIndex = (certIndex: number, imgIndex: number, newUrl: string) => {
    setDynamicCertificates(prev => {
      const updated = prev.map((cert, i) => {
        if (i === certIndex) {
          const newUrls = [...(cert.urls || [cert.image])];
          newUrls[imgIndex] = newUrl;
          const newMainImage = imgIndex === 0 ? newUrl : cert.image;
          return { ...cert, image: newMainImage, urls: newUrls };
        }
        return cert;
      });
      save('user_certificates', updated);
      return updated;
    });
  };
  const moveCertificateImageTo = (certIndex: number, fromIndex: number, toIndex: number) => {
    setDynamicCertificates(prev => {
      const updated = prev.map((cert, index) => {
        if (index !== certIndex) return cert;
        const urls = reorderItems(cert.urls || [cert.image], fromIndex, toIndex);
        return { ...cert, image: urls[0], urls };
      });
      save('user_certificates', updated);
      return updated;
    });
  };
  const updateCertificateDescription = (index: number, newDesc: string) => {
    setDynamicCertificates(prev => {
      const updated = prev.map((cert, i) => {
        if (i === index) return { ...cert, description: newDesc };
        return cert;
      });
      save('user_certificates', updated);
      return updated;
    });
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
  const moveArtCategoryTo = (fromIndex: number, toIndex: number) => {
    setArtCategories(prev => {
      const updated = reorderItems(prev, fromIndex, toIndex);
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
  const moveArtItemTo = (catIndex: number, fromIndex: number, toIndex: number) => {
    setArtCategories(prev => {
      const updated = prev.map((cat, i) => (
        i === catIndex
          ? { ...cat, items: reorderItems(cat.items, fromIndex, toIndex) }
          : cat
      ));
      save('user_art_categories', updated);
      return updated;
    });
  };
  const moveArtItem = (catIndex: number, itemIndex: number, direction: -1 | 1) => {
    setArtCategories(prev => {
      const updated = prev.map((cat, i) => {
        if (i !== catIndex) return cat;
        const nextIndex = itemIndex + direction;
        if (nextIndex < 0 || nextIndex >= cat.items.length) return cat;

        const items = [...cat.items];
        [items[itemIndex], items[nextIndex]] = [items[nextIndex], items[itemIndex]];
        return { ...cat, items };
      });
      save('user_art_categories', updated);
      return updated;
    });
  };
  const moveArtItemImage = (catIndex: number, itemIndex: number, imageIndex: number, direction: -1 | 1) => {
    setArtCategories(prev => {
      const updated = prev.map((cat, i) => {
        if (i !== catIndex) return cat;
        return {
          ...cat,
          items: cat.items.map((item, j) => {
            if (j !== itemIndex) return item;
            const currentUrls = item.urls || [item.url];
            const nextIndex = imageIndex + direction;
            if (nextIndex < 0 || nextIndex >= currentUrls.length) return item;

            const urls = [...currentUrls];
            [urls[imageIndex], urls[nextIndex]] = [urls[nextIndex], urls[imageIndex]];
            return { ...item, url: urls[0], urls };
          })
        };
      });
      save('user_art_categories', updated);
      return updated;
    });
  };
  const moveArtItemImageTo = (catIndex: number, itemIndex: number, fromIndex: number, toIndex: number) => {
    setArtCategories(prev => {
      const updated = prev.map((cat, i) => {
        if (i !== catIndex) return cat;
        return {
          ...cat,
          items: cat.items.map((item, j) => {
            if (j !== itemIndex) return item;
            const urls = reorderItems(item.urls || [item.url], fromIndex, toIndex);
            return { ...item, url: urls[0], urls };
          })
        };
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

  const isVideoUrl = (url: string = '') => (
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    /\.(mp4|webm|ogg)$/i.test(url)
  );

  const preloadProjectMedia = (project: Project) => {
    const sources = [
      localStorage.getItem(`media_project_${project.id}_main`) || project.image,
      ...(project.screenshots || []).slice(0, 4).map((shot, index) => (
        localStorage.getItem(`media_project_${project.id}_shot_${index}`) || shot
      )),
    ];

    sources.forEach((src) => {
      if (!src || isVideoUrl(src) || src.startsWith('data:video')) return;
      const image = new window.Image();
      image.decoding = 'async';
      image.src = src;
    });
  };

  const getStoredText = (keys: string | string[], fallback: string) => {
    const lookupKeys = Array.isArray(keys) ? keys : [keys];
    for (const key of lookupKeys) {
      const localSaved = localStorage.getItem(`text_${key}`);
      if (localSaved !== null) return localSaved;
      if (CUSTOM_TEXTS && CUSTOM_TEXTS[key] !== undefined) return CUSTOM_TEXTS[key];
    }
    return fallback;
  };

  const renderEngineIcon = (engineIcon: Project['engineIcon'], size = 18) => {
    const logoMap: Partial<Record<NonNullable<Project['engineIcon']>, string>> = {
      unity: '/engine-logos/unity.png',
      roblox: '/engine-logos/roblox.png',
      godot: '/engine-logos/godot.png',
      unreal: '/engine-logos/unreal.png',
      gamemaker: '/engine-logos/gamemaker.png',
    };

    if (engineIcon === 'custom') return <LinkIcon size={size} />;
    if (!engineIcon || engineIcon === 'none' || !logoMap[engineIcon]) return null;

    return (
      <img
        src={logoMap[engineIcon]}
        alt={`${engineIcon} logo`}
        className="block object-contain"
        style={{ width: size, height: size }}
        draggable={false}
      />
    );
  };

  const renderProjectEngineControl = (project: Project, index: number) => {
    if (isEditMode) {
      return (
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-dark bg-white text-brand-dark">
            {renderEngineIcon(project.engineIcon, 18)}
          </span>
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
        </div>
      );
    }

    if (!project.engineIcon || project.engineIcon === 'none') return null;

    return (
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-brand-dark bg-white text-brand-dark shadow-retro-sm" title={project.engineIcon}>
        {renderEngineIcon(project.engineIcon, 20)}
      </span>
    );
  };

  const renderProjectMedia = (project: Project, index: number, compact = false) => {
    const mainMediaSrc = localStorage.getItem(`media_project_${project.id}_main`) || project.image;
    const isVideoContent = isVideoUrl(mainMediaSrc);

    return (
      <div className="flex flex-col gap-3">
        <div className="aspect-video overflow-hidden rounded-xl border-4 border-brand-dark dark:border-brand-bg bg-black/5 shadow-sm">
          <EditableMedia
            src={project.image}
            alt={project.title}
            className={`h-full w-full ${isVideoContent ? 'object-cover' : 'object-cover'}`}
            wrapperClassName="h-full w-full"
            storageKey={`project_${project.id}_main`}
            isEditing={isEditMode}
            onUpdate={(newUrl) => updateProjectMedia(index, 'main', newUrl)}
          />
        </div>

        <ThumbnailScrollContainer
          isEditing={isEditMode}
          className="flex gap-2 overflow-x-auto pb-2 retro-scrollbar scroll-smooth snap-x snap-mandatory"
        >
          {project.screenshots.map((shot, sIdx) => (
            <div
              key={sIdx}
              className={`flex-shrink-0 relative group/shot snap-start ${isEditMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
              draggable={isEditMode}
              onDragStart={(e) => handleDragStart(e, { type: 'project-screenshot', fromIndex: sIdx, itemIndex: index })}
              onDragOver={allowDrop}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const payload = getDropPayload(e);
                if (payload?.type === 'project-screenshot' && payload.itemIndex === index) {
                  moveProjectScreenshotTo(index, payload.fromIndex, sIdx);
                }
                setDragPayload(null);
              }}
            >
              <div className={`${compact ? 'h-20' : 'h-24 md:h-28'} w-auto overflow-hidden rounded-lg border-2 border-brand-dark dark:border-brand-bg bg-black/5`}>
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
                <>
                  <div className="absolute left-1 top-1 rounded-md border-2 border-white bg-brand-dark/80 p-1 text-white shadow-sm">
                    <GripVertical size={12} />
                  </div>
                  <button onClick={() => removeScreenshot(index, sIdx)} className="absolute top-1 right-1 bg-brand-red text-white p-1 rounded-md border-2 border-white shadow-retro-sm hover:scale-110 transition-transform z-40 cursor-pointer">
                    <Trash2 size={12} />
                  </button>
                </>
              )}
            </div>
          ))}
          {isEditMode && (
            <button onClick={() => addScreenshot(index)} className={`${compact ? 'h-20' : 'h-24 md:h-28'} min-w-[76px] flex-shrink-0 rounded-lg border-2 border-dashed border-brand-dark/30 dark:border-brand-bg/30 flex items-center justify-center text-brand-dark/50 dark:text-brand-bg/50 hover:bg-brand-dark/5 dark:hover:bg-brand-bg/5 hover:border-brand-dark dark:hover:border-brand-bg hover:text-brand-dark dark:hover:text-brand-bg transition-all snap-start`}>
              <Plus size={22} />
            </button>
          )}
        </ThumbnailScrollContainer>
      </div>
    );
  };

  const renderProjectDetail = (project: Project, index: number, compact = false) => (
    <Card variant="white" className={`${compact ? 'p-3' : 'p-4 xl:p-5'} text-brand-dark dark:text-brand-bg`} disableHover>
      <div className={`grid grid-cols-1 ${compact ? 'gap-4' : 'xl:grid-cols-12 gap-5'}`}>
        <div className={compact ? '' : 'xl:col-span-7'}>
          {renderProjectMedia(project, index, compact)}
        </div>
        <div className={`${compact ? 'gap-3' : 'xl:col-span-5 gap-4'} flex flex-col min-w-0`}>
          <div className="rounded-xl border-4 border-brand-dark dark:border-brand-bg bg-brand-blue p-4 shadow-retro-sm dark:shadow-retro-sm-light text-brand-dark">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-wrap items-center gap-1 text-xs font-bold opacity-80">
                <EditableText initialText={project.category} storageKey={`proj_cat_${project.id}`} isEditing={isEditMode} tag="span" fullWidth={false} className="w-auto min-w-[40px]" onUpdate={(newText) => updateProjectField(index, 'category', newText)} />
                <span>|</span>
                <EditableText initialText={project.engine} storageKey={`proj_eng_${project.id}`} isEditing={isEditMode} tag="span" fullWidth={false} className="w-auto min-w-[40px]" onUpdate={(newText) => updateProjectField(index, 'engine', newText)} />
              </div>
              {renderProjectEngineControl(project, index)}
            </div>
            <EditableText initialText={project.title} storageKey={`proj_title_${project.id}`} isEditing={isEditMode} tag="h3" className={`${compact ? 'text-xl' : 'text-2xl xl:text-3xl'} font-black leading-tight text-brand-dark`} onUpdate={(newText) => updateProjectField(index, 'title', newText)} />
            <EditableText initialText={project.description} storageKey={`proj_desc_${project.id}`} isEditing={isEditMode} tag="p" multiline={true} className="mt-3 text-sm font-medium leading-relaxed text-brand-dark" onUpdate={(newText) => updateProjectField(index, 'description', newText)} />
            <div className="mt-4 flex justify-end">
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

          <div className="flex items-center gap-3 rounded-xl border-2 border-brand-dark dark:border-brand-bg bg-brand-orange p-3 text-brand-dark">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-brand-dark bg-white">
              <Settings size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-bold uppercase opacity-70">Role</span>
              <EditableText initialText={project.role} storageKey={`proj_role_${project.id}`} isEditing={isEditMode} tag="span" className="font-bold" onUpdate={(newText) => updateProjectField(index, 'role', newText)} />
            </div>
          </div>

          {isEditMode && (
            <div className="bg-white p-2 border-2 border-brand-dark rounded text-brand-dark">
              <label className="text-xs font-bold uppercase block mb-1">Project Link:</label>
              <div className="flex items-center gap-2">
                <LinkIcon size={14} />
                <input type="text" value={project.link} onChange={(e) => updateProjectField(index, 'link', e.target.value)} className="w-full text-sm focus:outline-none" />
              </div>
            </div>
          )}

          {project.status === 'WIP' ? (
            <Button fullWidth disabled className="flex items-center justify-center gap-2 bg-gray-400 border-gray-600 text-gray-700 cursor-not-allowed shadow-none opacity-80">
              <Ban size={18} /> Work In Progress
            </Button>
          ) : (
            <a href={project.link} target="_blank" rel="noreferrer">
              <Button fullWidth variant="primary" className="flex items-center justify-center gap-2">
                View Project <ExternalLink size={18} />
              </Button>
            </a>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <>
      {showIntro && <IntroOverlay onComplete={() => setShowIntro(false)} />}

      <div key={appKey} className={`min-h-screen font-sans selection:bg-brand-orange selection:text-white pb-20 relative transition-colors duration-300 ${isDarkMode ? 'text-brand-bg' : 'text-brand-dark'} ${showIntro ? 'overflow-hidden h-screen' : ''}`}>
        <BackgroundAnimation isDarkMode={isDarkMode} />

        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-brand-bg/95 dark:bg-brand-dark/95 backdrop-blur-sm border-b-4 border-brand-dark dark:border-brand-bg py-2 px-3 md:px-6 transition-colors duration-300">
          <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <a href="#" onClick={(e) => scrollToSection(e, '#')} className="font-black text-base sm:text-lg md:text-xl tracking-tighter border-2 border-brand-dark dark:border-brand-bg px-3 py-1 rounded-lg bg-white dark:bg-brand-dark-bg dark:text-brand-bg shadow-retro-sm dark:shadow-retro-sm-light transition-all">
                <span className="sm:hidden">Adam H.</span>
                <span className="hidden sm:inline">Adam Haryanto</span>
              </a>
            </div>

            <div className="hidden md:flex items-center gap-4 xl:gap-6">
              <a href="#about" onClick={(e) => scrollToSection(e, '#about')} className="font-bold text-sm xl:text-base text-brand-dark dark:text-brand-bg hover:text-brand-orange transition-colors hover:underline decoration-4 underline-offset-4">About</a>
              <a href="#experience" onClick={(e) => scrollToSection(e, '#experience')} className="font-bold text-sm xl:text-base text-brand-dark dark:text-brand-bg hover:text-brand-orange transition-colors hover:underline decoration-4 underline-offset-4">Experience</a>
              <a href="#skills" onClick={(e) => scrollToSection(e, '#skills')} className="font-bold text-sm xl:text-base text-brand-dark dark:text-brand-bg hover:text-brand-orange transition-colors hover:underline decoration-4 underline-offset-4">Skills</a>

              <div className="relative group">
                <button
                  className="flex items-center gap-1 font-bold text-sm xl:text-base text-brand-dark dark:text-brand-bg hover:text-brand-orange transition-colors hover:underline decoration-4 underline-offset-4"
                  onClick={() => setPortfolioDropdownOpen(!portfolioDropdownOpen)}
                >
                  Portfolio <ChevronDown size={16} />
                </button>
                {(portfolioDropdownOpen) && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-brand-dark border-2 border-brand-dark dark:border-brand-bg shadow-retro dark:shadow-retro-light rounded-lg overflow-hidden flex flex-col z-50">
                    <a href="#portfolio" onClick={(e) => scrollToSection(e, '#portfolio')} className="px-4 py-2 font-bold text-brand-dark dark:text-brand-bg hover:bg-brand-orange hover:text-white border-b-2 border-brand-dark/10 dark:border-brand-bg/10">Project Portfolio</a>
                    <a href="#art-portfolio" onClick={(e) => scrollToSection(e, '#art-portfolio')} className="px-4 py-2 font-bold text-brand-dark dark:text-brand-bg hover:bg-brand-green hover:text-white border-b-2 border-brand-dark/10 dark:border-brand-bg/10">Art Portfolio</a>
                    <a href="#certificates" onClick={(e) => scrollToSection(e, '#certificates')} className="px-4 py-2 font-bold text-brand-dark dark:text-brand-bg hover:bg-brand-yellow hover:text-brand-dark">Certificates</a>
                  </div>
                )}
              </div>

              <a href="#education" onClick={(e) => scrollToSection(e, '#education')} className="font-bold text-sm xl:text-base text-brand-dark dark:text-brand-bg hover:text-brand-orange transition-colors hover:underline decoration-4 underline-offset-4">Education</a>
              <a href="#contact" onClick={(e) => scrollToSection(e, '#contact')} className="font-bold text-sm xl:text-base text-brand-dark dark:text-brand-bg hover:text-brand-orange transition-colors hover:underline decoration-4 underline-offset-4">Contact</a>

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
                  <button onClick={handleFactoryReset} className="p-2 bg-brand-bg text-brand-red border-2 border-brand-red hover:bg-brand-red hover:text-white rounded-full transition-colors tooltip shadow-sm ml-1" title="Sync from Github / Reset to Default">
                    <RefreshCw size={20} />
                  </button>
                  <button onClick={finishEditMode} className="flex items-center gap-2 px-3 py-1.5 rounded-full font-bold border-2 transition-all bg-brand-dark text-white border-brand-dark shadow-retro-sm" title="Selesai Edit">
                    <Check size={16} /> <span className="text-sm">Done</span>
                  </button>
                  <button onClick={cleanupStorage} className="p-2 ml-2 bg-gray-200 text-gray-700 border-2 border-gray-400 hover:bg-brand-red hover:text-white hover:border-brand-red rounded-full transition-colors tooltip shadow-sm" title="Clean Unused Storage (Fix Full Storage)">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="md:hidden" />
          </div>

          {/* Mobile Menu */}
          {false && isMenuOpen && (
            <div className="md:hidden absolute top-full left-0 w-full bg-brand-bg dark:bg-brand-dark-bg border-b-4 border-brand-dark dark:border-brand-bg shadow-xl z-50">
              <div className="p-3 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <a href="#about" onClick={(e) => scrollToSection(e, '#about')} className="rounded-lg border-2 border-brand-dark dark:border-brand-bg bg-white dark:bg-brand-dark px-3 py-2 text-sm font-black text-brand-dark dark:text-brand-bg">About</a>
                  <a href="#education" onClick={(e) => scrollToSection(e, '#education')} className="rounded-lg border-2 border-brand-dark dark:border-brand-bg bg-white dark:bg-brand-dark px-3 py-2 text-sm font-black text-brand-dark dark:text-brand-bg">Education</a>
                  <a href="#skills" onClick={(e) => scrollToSection(e, '#skills')} className="rounded-lg border-2 border-brand-dark dark:border-brand-bg bg-white dark:bg-brand-dark px-3 py-2 text-sm font-black text-brand-dark dark:text-brand-bg">Skills</a>
                  <a href="#certificates" onClick={(e) => scrollToSection(e, '#certificates')} className="rounded-lg border-2 border-brand-dark dark:border-brand-bg bg-white dark:bg-brand-dark px-3 py-2 text-sm font-black text-brand-dark dark:text-brand-bg">Certificates</a>
                </div>
                <div className="rounded-xl border-2 border-dashed border-brand-dark/30 dark:border-brand-bg/30 p-3">
                  <span className="block text-xs font-black uppercase tracking-wider opacity-60 text-brand-dark dark:text-brand-bg">Main navigation lives in the bottom tabs</span>
                </div>

                {isEditMode && (
                  <div className="flex flex-col gap-2 pt-4">
                    <button onClick={exportAsConstantsFile} className="flex justify-center items-center gap-2 font-bold text-white bg-brand-green border-2 border-brand-dark rounded-lg py-3 text-base">
                      <Upload size={18} /> 🚀 Publish (Deploy Perubahan)
                    </button>
                    <div className="flex gap-2">
                      <button onClick={cancelEditMode} className="flex-1 flex justify-center items-center gap-2 font-bold text-brand-red border-2 border-brand-red rounded-lg py-2">
                        <RotateCcw size={18} /> Cancel
                      </button>
                      <button onClick={handleFactoryReset} className="flex-1 flex justify-center items-center gap-2 font-bold text-brand-red border-2 border-brand-red/20 rounded-lg py-2 text-xs hover:bg-brand-red hover:text-white transition-colors">
                        <RefreshCw size={14} /> Sync from Github / Reset
                      </button>
                    </div>
                    <button onClick={cleanupStorage} className="w-full flex justify-center items-center gap-2 font-bold text-gray-500 border-2 border-gray-300 rounded-lg py-2 text-xs hover:bg-brand-red hover:text-white hover:border-brand-red transition-colors">
                      <Trash2 size={14} /> Clean Unused Storage
                    </button>
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

        {(isPortfolioMenuOpen || isMenuOpen) && (
          <div className="md:hidden fixed inset-x-3 bottom-[76px] z-50 rounded-2xl border-4 border-brand-dark dark:border-brand-bg bg-brand-bg dark:bg-brand-dark-bg p-3 shadow-retro dark:shadow-retro-light">
            {isPortfolioMenuOpen && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-brand-dark dark:text-brand-bg">
                  <span className="text-sm font-black uppercase">Portfolio</span>
                  <button type="button" onClick={() => setIsPortfolioMenuOpen(false)} className="rounded-full border-2 border-brand-dark dark:border-brand-bg bg-white dark:bg-brand-dark p-1">
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={(e) => scrollToSection(e, '#portfolio')} className="rounded-xl border-2 border-brand-dark bg-brand-orange px-2 py-3 text-xs font-black text-brand-dark">Projects</button>
                  <button type="button" onClick={(e) => scrollToSection(e, '#art-portfolio')} className="rounded-xl border-2 border-brand-dark bg-brand-green px-2 py-3 text-xs font-black text-brand-dark">Art</button>
                  <button type="button" onClick={(e) => scrollToSection(e, '#certificates')} className="rounded-xl border-2 border-brand-dark bg-brand-yellow px-2 py-3 text-xs font-black text-brand-dark">Certificates</button>
                </div>
              </div>
            )}

            {isMenuOpen && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-brand-dark dark:text-brand-bg">
                  <span className="text-sm font-black uppercase">More</span>
                  <button type="button" onClick={() => setIsMenuOpen(false)} className="rounded-full border-2 border-brand-dark dark:border-brand-bg bg-white dark:bg-brand-dark p-1">
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={(e) => scrollToSection(e, '#about')} className="rounded-lg border-2 border-brand-dark dark:border-brand-bg bg-white dark:bg-brand-dark px-2 py-2 text-xs font-black text-brand-dark dark:text-brand-bg">About</button>
                  <button type="button" onClick={(e) => scrollToSection(e, '#education')} className="rounded-lg border-2 border-brand-dark dark:border-brand-bg bg-white dark:bg-brand-dark px-2 py-2 text-xs font-black text-brand-dark dark:text-brand-bg">Education</button>
                  <button type="button" onClick={(e) => scrollToSection(e, '#skills')} className="rounded-lg border-2 border-brand-dark dark:border-brand-bg bg-white dark:bg-brand-dark px-2 py-2 text-xs font-black text-brand-dark dark:text-brand-bg">Skills</button>
                </div>
                <button type="button" onClick={toggleDarkMode} className="w-full rounded-lg border-2 border-brand-dark dark:border-brand-bg bg-white dark:bg-brand-dark px-3 py-2 text-sm font-black text-brand-dark dark:text-brand-bg flex items-center justify-center gap-2">
                  {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
                {isEditMode && (
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={finishEditMode} className="rounded-lg border-2 border-brand-dark bg-brand-green px-3 py-2 text-xs font-black text-white flex items-center justify-center gap-1">
                      <Check size={14} /> Done
                    </button>
                    <button onClick={cancelEditMode} className="rounded-lg border-2 border-brand-red px-3 py-2 text-xs font-black text-brand-red flex items-center justify-center gap-1">
                      <RotateCcw size={14} /> Cancel
                    </button>
                    <button onClick={exportPortfolioData} className="rounded-lg border-2 border-brand-blue px-3 py-2 text-xs font-black text-brand-blue flex items-center justify-center gap-1">
                      <Download size={14} /> Backup
                    </button>
                    <label className="rounded-lg border-2 border-brand-orange px-3 py-2 text-xs font-black text-brand-orange flex items-center justify-center gap-1 cursor-pointer">
                      <Upload size={14} /> Import
                      <input type="file" accept=".json" onChange={importPortfolioData} className="hidden" />
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t-4 border-brand-dark dark:border-brand-bg bg-brand-bg/95 dark:bg-brand-dark/95 backdrop-blur-sm px-2 py-2">
          <div className="grid grid-cols-5 gap-1">
            {[
              { href: '#', label: 'Home', icon: Home },
              { href: '#experience', label: 'Exp', icon: Briefcase },
              { href: 'portfolio-menu', label: 'Portfolio', icon: FolderOpen },
              { href: '#contact', label: 'Contact', icon: Mail },
              { href: 'more-menu', label: 'More', icon: Menu },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={(e) => {
                    if (item.href === 'portfolio-menu') {
                      setIsPortfolioMenuOpen(prev => !prev);
                      setIsMenuOpen(false);
                      return;
                    }
                    if (item.href === 'more-menu') {
                      setIsMenuOpen(prev => !prev);
                      setIsPortfolioMenuOpen(false);
                      return;
                    }
                    scrollToSection(e, item.href);
                  }}
                  className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-brand-dark dark:border-brand-bg px-1 py-1.5 text-brand-dark dark:text-brand-bg shadow-retro-sm dark:shadow-retro-sm-light active:translate-x-[1px] active:translate-y-[1px] ${(item.href === 'portfolio-menu' && isPortfolioMenuOpen) || (item.href === 'more-menu' && isMenuOpen) ? 'bg-brand-yellow dark:bg-brand-yellow dark:text-brand-dark' : 'bg-white dark:bg-brand-dark-bg'}`}
                >
                  <Icon size={18} />
                  <span className="w-full truncate text-[10px] font-black leading-none">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {isEditMode && (
          <div className="fixed bottom-24 md:bottom-4 right-4 z-50 bg-brand-dark text-white px-4 py-3 rounded-xl shadow-retro border-2 border-white animate-bounce pointer-events-none">
            <p className="font-bold text-sm">Tap text or images to edit!</p>
          </div>
        )}

        <div className="min-h-[calc(100vh-76px)] md:min-h-[62vh] flex items-center px-3 sm:px-4 lg:px-6 py-8 md:py-10">
          <div className="mx-auto grid w-full max-w-screen-2xl grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)] gap-5 lg:gap-8 items-center">
            <div className="min-w-0">
              <SearchHeader />
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="rounded-xl border-4 border-brand-dark dark:border-brand-bg bg-white dark:bg-brand-dark-bg p-3 text-center shadow-retro-sm dark:shadow-retro-sm-light">
                  <span className="block text-2xl md:text-3xl font-black text-brand-dark dark:text-brand-bg">{dynamicProjects.length}</span>
                  <span className="text-[10px] md:text-xs font-black uppercase opacity-60 text-brand-dark dark:text-brand-bg">Projects</span>
                </div>
                <div className="rounded-xl border-4 border-brand-dark dark:border-brand-bg bg-brand-yellow p-3 text-center shadow-retro-sm">
                  <span className="block text-2xl md:text-3xl font-black text-brand-dark">{artCategories.reduce((count, cat) => count + cat.items.length, 0)}</span>
                  <span className="text-[10px] md:text-xs font-black uppercase opacity-70 text-brand-dark">Artworks</span>
                </div>
                <div className="rounded-xl border-4 border-brand-dark dark:border-brand-bg bg-brand-blue p-3 text-center shadow-retro-sm">
                  <span className="block text-2xl md:text-3xl font-black text-brand-dark">{dynamicExperiences.length}</span>
                  <span className="text-[10px] md:text-xs font-black uppercase opacity-70 text-brand-dark">Experience</span>
                </div>
              </div>
            </div>
            <Card className="p-5 sm:p-6 md:p-8 w-full text-center" variant="green">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 text-brand-dark uppercase">Portfolio</h2>
              <EditableText initialText="Game Developer & Technical Artist" storageKey="hero_subtitle" isEditing={isEditMode} tag="p" className="font-bold text-base sm:text-lg md:text-xl mb-5 opacity-80 text-brand-dark" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                <a href="#portfolio" onClick={(e) => scrollToSection(e, '#portfolio')} className="w-full">
                  <Button fullWidth variant="secondary" className="flex items-center justify-center gap-2 px-4 py-2.5"><FolderOpen size={18} /> Projects</Button>
                </a>
                <a href={SOCIAL_LINKS.itch} target="_blank" rel="noreferrer" className="w-full">
                  <Button fullWidth variant="outline" className="bg-white text-brand-dark flex items-center justify-center gap-2 px-4 py-2.5">Itch.io <ArrowUpRight size={18} /></Button>
                </a>
              </div>
            </Card>
          </div>
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
              <div
                key={exp.id}
                className={`relative group/exp ${isEditMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
                draggable={isEditMode}
                onDragStart={(e) => handleDragStart(e, { type: 'experience', fromIndex: index })}
                onDragOver={allowDrop}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const payload = getDropPayload(e);
                  if (payload?.type === 'experience') moveExperienceTo(payload.fromIndex, index);
                  setDragPayload(null);
                }}
              >
                {(() => {
                  const isExpanded = expandedExperienceId === exp.id || isEditMode;
                  return (
                    <>
                    <Card variant="white" className="hidden md:flex flex-col h-full" noShadow={false}>
                      <div className="w-full h-48 flex-shrink-0 relative group">
                        <EditableMedia src={exp.image || "https://picsum.photos/seed/exp/100/100"} alt={exp.company} storageKey={`exp_img_${exp.id}`} isEditing={isEditMode} className="w-full h-full object-cover" wrapperClassName="w-full h-full" />
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-transparent to-white dark:to-brand-dark-bg pointer-events-none" />
                      </div>
                      <div className="p-6 md:p-8 flex flex-col flex-grow text-brand-dark dark:text-brand-bg">
                        <div className="flex justify-between items-start mb-2">
                          <EditableText initialText={exp.company} storageKey={`exp_comp_${exp.id}`} isEditing={isEditMode} tag="h3" className="text-xl md:text-2xl font-black leading-tight" />
                          <EditableText initialText={exp.period} storageKey={`exp_period_${exp.id}`} isEditing={isEditMode} tag="span" className="font-bold text-sm bg-brand-dark text-white px-3 py-1 rounded-md text-center ml-2 whitespace-nowrap" />
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

                    <Card variant="white" className="md:hidden flex flex-col h-full" noShadow={false}>
                      <div
                        role={!isEditMode ? 'button' : undefined}
                        tabIndex={!isEditMode ? 0 : undefined}
                        onClick={() => !isEditMode && setExpandedExperienceId(isExpanded ? null : exp.id)}
                        className="flex w-full gap-3 p-3 text-left"
                      >
                        <div className="h-20 w-24 md:h-24 md:w-28 flex-shrink-0 overflow-hidden rounded-lg border-2 border-brand-dark dark:border-brand-bg bg-black/5">
                          <EditableMedia src={exp.image || "https://picsum.photos/seed/exp/100/100"} alt={exp.company} storageKey={`exp_img_${exp.id}`} isEditing={isEditMode} className="w-full h-full object-cover" wrapperClassName="w-full h-full" />
                        </div>
                        <div className="min-w-0 flex-1 text-brand-dark dark:text-brand-bg">
                          <div className="flex items-start justify-between gap-2">
                            <EditableText initialText={exp.company} storageKey={`exp_comp_${exp.id}`} isEditing={isEditMode} tag="h3" className="text-base md:text-lg font-black leading-tight line-clamp-2" />
                            {!isEditMode && <ChevronDown size={18} className={`mt-1 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />}
                          </div>
                          <EditableText initialText={exp.period} storageKey={`exp_period_${exp.id}`} isEditing={isEditMode} tag="span" className="mt-2 inline-block font-bold text-[11px] bg-brand-dark text-white px-2 py-1 rounded-md text-center whitespace-nowrap" />
                          {!isEditMode && (
                            <div className={`mt-2 inline-block px-2 py-1 rounded-full text-[10px] font-bold border-2 border-brand-dark dark:border-brand-bg text-brand-dark ${exp.type === 'Work' ? 'bg-brand-green' : 'bg-brand-orange'}`}>{exp.role}</div>
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-4 text-brand-dark dark:text-brand-bg">
                          <div className="mb-4 pb-4 border-b-2 border-dashed border-gray-300/50 dark:border-brand-bg/30">
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
                          <EditableText initialText={exp.description} storageKey={`exp_desc_${exp.id}`} isEditing={isEditMode} tag="p" multiline={true} className="font-medium text-sm mb-4" />
                          <div className="bg-brand-yellow/30 p-3 rounded-lg border-2 border-brand-dark dark:border-brand-bg">
                            <span className="block text-xs font-black uppercase mb-1">Key Notes</span>
                            <EditableText initialText={exp.keyNotes} storageKey={`exp_notes_${exp.id}`} isEditing={isEditMode} tag="p" className="font-bold text-sm" />
                          </div>
                        </div>
                      )}
                    </Card>
                    </>
                  );
                })()}
                {isEditMode && (
                  <>
                    <div className="absolute -top-4 left-4 z-40 rounded-full border-2 border-brand-dark bg-brand-dark p-2 text-white shadow-retro-sm">
                      <GripVertical size={16} />
                    </div>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeExperience(index); }}
                      className="absolute -top-4 right-4 z-40 bg-brand-red text-white p-2 rounded-full shadow-retro-sm hover:scale-110 transition-transform cursor-pointer"
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
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
              <div
                key={catIndex}
                className={`flex flex-col gap-4 ${isEditMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
                draggable={isEditMode}
                onDragStart={(e) => handleDragStart(e, { type: 'skill-category', fromIndex: catIndex })}
                onDragOver={allowDrop}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const payload = getDropPayload(e);
                  if (payload?.type === 'skill-category') moveSkillCategoryTo(payload.fromIndex, catIndex);
                  setDragPayload(null);
                }}
              >
                <div className={`p-4 border-4 border-brand-dark dark:border-brand-bg rounded-xl shadow-retro dark:shadow-retro-light text-center font-black text-xl uppercase text-brand-dark ${catIndex === 0 ? 'bg-brand-orange' : catIndex === 1 ? 'bg-brand-blue' : 'bg-brand-yellow'}`}>
                  {isEditMode && <GripVertical size={18} className="mx-auto mb-1" />}
                  <EditableText initialText={category.title} storageKey={`skill_cat_${catIndex}`} isEditing={isEditMode} tag="span" />
                </div>
                <div className="flex flex-col gap-3 relative pb-4">
                  <div className="absolute left-1/2 top-0 bottom-12 w-1 bg-brand-dark/20 dark:bg-brand-bg/20 -translate-x-1/2 -z-10 border-l-2 border-dashed border-brand-dark dark:border-brand-bg"></div>
                  {category.skills.map((skill, sIndex) => (
                    <div
                      key={sIndex}
                      className={`relative group ${isEditMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
                      draggable={isEditMode}
                      onDragStart={(e) => handleDragStart(e, { type: 'skill', fromIndex: sIndex, catIndex })}
                      onDragOver={allowDrop}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const payload = getDropPayload(e);
                        if (payload?.type === 'skill' && payload.catIndex === catIndex) {
                          moveSkillTo(catIndex, payload.fromIndex, sIndex);
                        }
                        setDragPayload(null);
                      }}
                    >
                      {isEditMode ? (
                        <div className="flex gap-2 items-center">
                          <div className="rounded-lg border-2 border-brand-dark bg-brand-dark p-2 text-white shadow-retro-sm">
                            <GripVertical size={16} />
                          </div>
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
          {(() => {
            const activeProjectIndex = dynamicProjects.findIndex(project => project.id === activeProjectId);
            const activeProject = activeProjectIndex >= 0 ? dynamicProjects[activeProjectIndex] : null;

            return (
              <div className="space-y-4 md:space-y-5">
                <div className="relative">
                  <ThumbnailScrollContainer
                    isEditing={isEditMode}
                    className="flex gap-3 md:gap-4 overflow-x-auto pb-4 retro-scrollbar scroll-smooth snap-x snap-mandatory"
                  >
                  {dynamicProjects.map((project, index) => {
                    const isActive = activeProjectId === project.id;
                    const previewTitle = getStoredText(`proj_title_${project.id}`, project.title);
                    const previewRole = getStoredText(`proj_role_${project.id}`, project.role);
                    const previewCategory = getStoredText([`proj_cat_${project.id}`, `proj_category_${project.id}`], project.category);
                    const previewEngine = getStoredText([`proj_eng_${project.id}`, `proj_engine_${project.id}`], project.engine);
                    return (
                      <div
                        key={project.id}
                        className={`relative w-[78vw] max-w-[360px] md:w-[360px] lg:w-[400px] xl:w-[440px] flex-shrink-0 snap-start ${isEditMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
                        draggable={isEditMode}
                        onDragStart={(e) => handleDragStart(e, { type: 'project', fromIndex: index })}
                        onDragOver={allowDrop}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const payload = getDropPayload(e);
                          if (payload?.type === 'project') moveProjectTo(payload.fromIndex, index);
                          setDragPayload(null);
                        }}
                      >
                        <button
                          type="button"
                          onMouseEnter={() => preloadProjectMedia(project)}
                          onFocus={() => preloadProjectMedia(project)}
                          onTouchStart={() => preloadProjectMedia(project)}
                          onClick={() => {
                            preloadProjectMedia(project);
                            setActiveProjectId(isActive ? null : project.id);
                          }}
                          className={`w-full h-full overflow-hidden rounded-xl border-4 text-left transition-all ${isActive ? 'border-brand-dark dark:border-brand-bg bg-brand-yellow shadow-retro-sm dark:shadow-retro-sm-light' : 'border-brand-dark dark:border-brand-bg bg-white dark:bg-brand-dark-bg shadow-retro dark:shadow-retro-light hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-retro-sm'}`}
                        >
                          <div className="aspect-video overflow-hidden border-b-4 border-brand-dark dark:border-brand-bg bg-black/5">
                            <EditableMedia
                              src={project.image}
                              alt={project.title}
                              className="h-full w-full object-cover"
                              wrapperClassName="h-full w-full"
                              storageKey={`project_${project.id}_main`}
                              isEditing={false}
                            />
                          </div>
                          <div className="p-3 text-brand-dark dark:text-brand-bg">
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <span className={`rounded-full border-2 border-brand-dark px-2 py-0.5 text-[10px] font-black uppercase text-brand-dark ${project.status === 'Released' ? 'bg-brand-green' : project.status === 'WIP' ? 'bg-gray-300' : 'bg-brand-orange'}`}>{project.status}</span>
                              <span className="flex min-w-0 items-center gap-1 truncate text-[10px] font-black uppercase opacity-60">
                                {renderEngineIcon(project.engineIcon, 13)}
                                <span className="truncate">{previewCategory} | {previewEngine}</span>
                              </span>
                            </div>
                            <h3 className="line-clamp-2 text-base md:text-lg font-black leading-tight">{previewTitle}</h3>
                            <p className="mt-2 line-clamp-1 text-xs font-semibold opacity-75">{previewRole}</p>
                            <div className="mt-3 flex items-center gap-1 text-xs font-black uppercase text-brand-blue dark:text-brand-yellow">
                              <Eye size={14} />
                              {isActive ? 'Close Details' : 'Open Details'}
                            </div>
                          </div>
                        </button>

                        {isEditMode && (
                          <>
                            <div className="absolute -top-2 left-3 z-40 rounded-full border-2 border-brand-dark bg-brand-dark p-2 text-white shadow-retro-sm">
                              <GripVertical size={14} />
                            </div>
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeProject(index); }}
                              className="absolute -top-2 -right-2 z-40 bg-brand-red text-white p-2 rounded-full border-2 border-brand-dark shadow-retro-sm hover:scale-110 transition-transform cursor-pointer"
                              type="button"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                  {isEditMode && (
                    <button onClick={addProject} className="w-[78vw] max-w-[320px] md:w-[320px] aspect-video flex-shrink-0 snap-start rounded-xl border-4 border-dashed border-brand-dark/30 dark:border-brand-bg/30 p-5 flex flex-col items-center justify-center gap-2 text-brand-dark/50 dark:text-brand-bg/50 hover:bg-brand-dark/5 dark:hover:bg-brand-bg/5 hover:border-brand-dark dark:hover:border-brand-bg hover:text-brand-dark dark:hover:text-brand-bg transition-all font-black uppercase">
                      <Plus size={30} /> Add New Project
                    </button>
                  )}
                  </ThumbnailScrollContainer>
                </div>

                <div ref={projectDetailRef} className="scroll-mt-24">
                  {activeProject ? (
                    renderProjectDetail(activeProject, activeProjectIndex, false)
                  ) : (
                    <Card variant="white" className="p-5 md:p-8 flex flex-col items-center justify-center text-center text-brand-dark dark:text-brand-bg" disableHover>
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-4 border-brand-dark dark:border-brand-bg bg-brand-blue text-brand-dark">
                        <FolderOpen size={30} />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black uppercase">Choose a project</h3>
                      <p className="mt-2 max-w-md text-xs md:text-sm font-bold opacity-70">Swipe the project previews horizontally, then open one to see full details.</p>
                    </Card>
                  )}
                </div>
              </div>
            );
          })()}
        </Section>

        <Section id="art-portfolio" title="Art Portfolio" isEditing={isEditMode} storageKey="title_art">
          <div className="space-y-5">
            {artCategories.map((category, catIndex) => {
              const isCategoryExpanded = expandedArtCategories[category.id] ?? true;
              const previewItems = category.items.slice(0, 5);

              return (
                <div
                  key={category.id}
                  className={`relative group/category overflow-hidden rounded-xl border-4 border-brand-dark dark:border-brand-bg bg-white dark:bg-brand-dark-bg shadow-retro dark:shadow-retro-light ${isEditMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
                  draggable={isEditMode}
                  onDragStart={(e) => handleDragStart(e, { type: 'art-category', fromIndex: catIndex })}
                  onDragOver={allowDrop}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const payload = getDropPayload(e);
                    if (payload?.type === 'art-category') moveArtCategoryTo(payload.fromIndex, catIndex);
                    setDragPayload(null);
                  }}
                >
                  <div className={`flex flex-col gap-3 p-3 md:flex-row md:items-center md:justify-between ${catIndex % 3 === 0 ? 'bg-brand-orange' : catIndex % 3 === 1 ? 'bg-brand-green' : 'bg-brand-blue'}`}>
                    <div className="flex min-w-0 items-center gap-3 text-brand-dark">
                      {isEditMode && (
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-brand-dark bg-brand-dark text-white shadow-retro-sm">
                          <GripVertical size={18} />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setExpandedArtCategories(prev => ({ ...prev, [category.id]: !isCategoryExpanded }))}
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-brand-dark bg-white text-brand-dark shadow-retro-sm transition-transform hover:scale-105"
                        aria-label={isCategoryExpanded ? 'Collapse art category' : 'Expand art category'}
                      >
                        <ChevronDown size={22} className={`transition-transform ${isCategoryExpanded ? 'rotate-180' : ''}`} />
                      </button>
                      <div className="min-w-0">
                        <div className="text-xl md:text-2xl font-black uppercase leading-tight">
                          <EditableText initialText={category.title} storageKey={`art_cat_title_${category.id}`} isEditing={isEditMode} tag="span" />
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs font-black uppercase opacity-75">
                          <Images size={14} />
                          {category.items.length} items
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 md:justify-end">
                      <div className="flex -space-x-3 overflow-hidden">
                        {previewItems.map((item, itemIndex) => (
                          <div key={item.id} className="h-10 w-10 overflow-hidden rounded-lg border-2 border-brand-dark bg-white">
                            <EditableMedia
                              src={(item.urls && item.urls.length > 0 ? item.urls[0] : item.url)}
                              alt={`${category.title} preview ${itemIndex + 1}`}
                              className="h-full w-full object-contain"
                              wrapperClassName="h-full w-full"
                              storageKey={`art_item_${item.id}_0`}
                              isEditing={false}
                            />
                          </div>
                        ))}
                      </div>
                      {isEditMode && (
                        <div className="flex gap-2">
                          <button onClick={() => addArtItem(catIndex)} className="bg-brand-yellow text-brand-dark px-3 py-2 rounded-lg font-bold border-2 border-brand-dark hover:scale-105 transition-transform flex gap-2 items-center text-xs"><Plus size={14} /> Add</button>
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeArtCategory(catIndex); }}
                            className="bg-brand-red text-white px-3 py-2 rounded-lg font-bold border-2 border-brand-dark flex gap-2 items-center text-xs cursor-pointer hover:scale-105 transition-transform"
                            type="button"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isCategoryExpanded && (
                    <div className="p-3 md:p-4">
                      <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-3 md:gap-4">
                        {category.items.map((item, itemIndex) => {
                          const images = item.urls && item.urls.length > 0 ? item.urls : [item.url];
                          const hasMultipleImages = images.length > 1;
                          const isItemOpen = expandedArtItemId === item.id || isEditMode;
                          const artTitle = item.description || `Artwork #${itemIndex + 1}`;

                          return (
                            <div
                              key={item.id}
                              className={`group relative mb-3 md:mb-4 break-inside-avoid overflow-hidden rounded-xl border-4 border-brand-dark dark:border-brand-bg bg-white dark:bg-brand-dark-bg transition-all ${isEditMode ? 'cursor-grab active:cursor-grabbing' : ''} ${expandedArtItemId === item.id ? 'shadow-retro-sm dark:shadow-retro-sm-light ring-4 ring-brand-yellow' : ''}`}
                              draggable={isEditMode}
                              onDragStart={(e) => handleDragStart(e, { type: 'art-item', fromIndex: itemIndex, catIndex })}
                              onDragOver={allowDrop}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const payload = getDropPayload(e);
                                if (payload?.type === 'art-item' && payload.catIndex === catIndex) {
                                  moveArtItemTo(catIndex, payload.fromIndex, itemIndex);
                                }
                                setDragPayload(null);
                              }}
                            >
                              <div className="relative overflow-hidden bg-black/5">
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
                                    <div
                                      key={imgIndex}
                                      className={`relative w-full flex-shrink-0 snap-center ${!isEditMode ? 'cursor-zoom-in' : ''}`}
                                      draggable={isEditMode}
                                      onDragStart={(e) => handleDragStart(e, { type: 'art-image', fromIndex: imgIndex, catIndex, itemIndex })}
                                      onDragOver={allowDrop}
                                      onDrop={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const payload = getDropPayload(e);
                                        if (payload?.type === 'art-image' && payload.catIndex === catIndex && payload.itemIndex === itemIndex) {
                                          moveArtItemImageTo(catIndex, itemIndex, payload.fromIndex, imgIndex);
                                        }
                                        setDragPayload(null);
                                      }}
                                      onClick={!isEditMode ? (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setExpandedArtItemId(item.id);
                                        setSelectedArtPreview({
                                          title: artTitle,
                                          url: imgUrl,
                                          storageKey: `art_item_${item.id}_${imgIndex}`,
                                        });
                                      } : undefined}
                                    >
                                      <EditableMedia
                                        src={imgUrl}
                                        alt={`${category.title} ${itemIndex + 1} - ${imgIndex + 1}`}
                                        className="w-full h-auto object-contain"
                                        wrapperClassName="w-full h-auto"
                                        storageKey={`art_item_${item.id}_${imgIndex}`}
                                        isEditing={isEditMode}
                                        onUpdate={(newUrl) => updateArtItemImage(catIndex, itemIndex, imgIndex, newUrl)}
                                      />
                                      {isEditMode && images.length > 1 && (
                                        <>
                                          <div className="absolute bottom-2 left-2 z-40 rounded border-2 border-white bg-brand-dark/80 p-1 text-white shadow-sm">
                                            <GripVertical size={13} />
                                          </div>
                                          <button
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeImageFromArtItem(catIndex, itemIndex, imgIndex); }}
                                            className="absolute bottom-2 right-2 bg-brand-red text-white px-2 py-1 rounded text-xs font-bold border-2 border-white z-40 shadow-sm cursor-pointer flex items-center gap-1"
                                            type="button"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  ))}
                                </div>

                                {!isEditMode && (
                                  <div className={`pointer-events-none absolute inset-x-0 bottom-0 p-3 text-white transition-opacity duration-200 ${isItemOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88), rgba(0,0,0,0.35), transparent)' }}>
                                    <div className="art-title line-clamp-2 text-center text-xs md:text-sm font-black uppercase tracking-wide drop-shadow-lg">
                                      {artTitle}
                                    </div>
                                  </div>
                                )}

                                {hasMultipleImages && (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const gallery = document.getElementById(`gallery-${item.id}`);
                                        if (gallery) gallery.scrollBy({ left: -gallery.clientWidth, behavior: 'smooth' });
                                      }}
                                      className={`absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-opacity z-50 ${isEditMode || isItemOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                      aria-label="Previous"
                                      type="button"
                                    >
                                      <ChevronDown size={16} className="rotate-90" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const gallery = document.getElementById(`gallery-${item.id}`);
                                        if (gallery) gallery.scrollBy({ left: gallery.clientWidth, behavior: 'smooth' });
                                      }}
                                      className={`absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-opacity z-50 ${isEditMode || isItemOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                      aria-label="Next"
                                      type="button"
                                    >
                                      <ChevronDown size={16} className="-rotate-90" />
                                    </button>
                                    <div
                                      id={`indicator-${item.id}`}
                                      className="absolute left-2 top-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded-full font-bold z-30"
                                    >
                                      1/{images.length}
                                    </div>
                                  </>
                                )}

                                {isEditMode && (
                                  <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); addImageToArtItem(catIndex, itemIndex); }}
                                    className="absolute top-2 left-2 bg-brand-green text-brand-dark px-2 py-1 rounded text-[10px] font-bold border-2 border-brand-dark z-40 shadow-sm cursor-pointer flex items-center gap-1 hover:scale-105 transition-transform"
                                    type="button"
                                  >
                                    <Plus size={12} /> Add
                                  </button>
                                )}
                              </div>

                              {isItemOpen && (
                                <div className="border-t-4 border-brand-dark dark:border-brand-bg bg-brand-dark px-3 py-2">
                                  <EditableText
                                    initialText={artTitle}
                                    storageKey={`art_desc_${item.id}`}
                                    isEditing={isEditMode}
                                    className="art-title text-white font-black uppercase tracking-wider drop-shadow-lg text-center"
                                    tag="div"
                                  />
                                </div>
                              )}

                              {isEditMode && (
                                <>
                                  <div className="flex items-center justify-between gap-2 border-t-2 border-brand-dark/20 dark:border-brand-bg/20 bg-white/90 dark:bg-brand-dark-bg/90 px-2 py-2">
                                    <div className="flex items-center gap-1 rounded-md border-2 border-brand-dark bg-brand-dark px-2 py-1 text-xs font-black uppercase text-white">
                                      <GripVertical size={14} />
                                      Drag
                                    </div>
                                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeArtItem(catIndex, itemIndex); }} className="bg-brand-red text-white p-1 rounded border-2 border-brand-dark z-40 shadow-sm cursor-pointer" type="button" title="Remove artwork">
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                        {category.items.length === 0 && (
                          <div className="col-span-full py-10 text-center opacity-50 font-bold border-2 border-dashed border-brand-dark dark:border-brand-bg rounded-xl">No items yet. Click "Add" to start.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {isEditMode && (
              <button onClick={addArtCategory} className="w-full border-4 border-dashed border-brand-dark/30 dark:border-brand-bg/30 rounded-xl p-6 flex flex-col items-center justify-center text-brand-dark/50 dark:text-brand-bg/50 hover:bg-brand-dark/5 dark:hover:bg-brand-bg/5 hover:border-brand-dark dark:hover:border-brand-bg hover:text-brand-dark dark:hover:text-brand-bg transition-all group">
                <Plus size={40} className="mb-2 group-hover:scale-100 transition-transform" />
                <span className="font-black text-lg uppercase">Add New Portfolio Group</span>
              </button>
            )}
          </div>
        </Section>

        {selectedArtPreview && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm md:p-6"
            onClick={() => setSelectedArtPreview(null)}
          >
            <div className="relative w-full max-w-6xl animate-bounce-in" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setSelectedArtPreview(null)}
                className="absolute -right-1 -top-5 z-50 rounded-full border-2 border-brand-dark dark:border-brand-bg bg-brand-red p-2 text-white shadow-retro-sm transition-transform hover:scale-110 md:-right-5"
                type="button"
                aria-label="Close artwork preview"
              >
                <X size={24} />
              </button>

              <div className="max-h-[88vh] overflow-hidden rounded-xl border-4 border-brand-dark dark:border-brand-bg bg-brand-bg dark:bg-brand-dark-bg p-2 shadow-retro dark:shadow-retro-light">
                <div className="flex max-h-[78vh] items-center justify-center overflow-hidden rounded-lg border-2 border-brand-dark/20 bg-black/10 dark:border-brand-bg/20">
                  <EditableMedia
                    src={selectedArtPreview.url}
                    alt={selectedArtPreview.title}
                    storageKey={selectedArtPreview.storageKey}
                    isEditing={false}
                    className="max-h-[78vh] w-full object-contain"
                    wrapperClassName="flex max-h-[78vh] w-full items-center justify-center"
                  />
                </div>
                <div className="art-title mt-2 rounded-lg border-2 border-brand-dark dark:border-brand-bg bg-brand-dark px-4 py-3 text-center text-sm font-black uppercase tracking-wide text-white md:text-lg">
                  {selectedArtPreview.title}
                </div>
              </div>
            </div>
          </div>
        )}

        <Section id="certificates" title="Certificates" isEditing={isEditMode} storageKey="title_certs">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
            {dynamicCertificates.map((cert, index) => (
              <div
                key={cert.id}
                className={`relative group/cert ${isEditMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
                draggable={isEditMode}
                onDragStart={(e) => handleDragStart(e, { type: 'certificate', fromIndex: index })}
                onDragOver={allowDrop}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const payload = getDropPayload(e);
                  if (payload?.type === 'certificate') moveCertificateTo(payload.fromIndex, index);
                  setDragPayload(null);
                }}
              >
                <Card variant="white" className="p-2 md:p-3 group cursor-pointer hover:-translate-y-1 transition-transform" noShadow={false}>
                  <div className="aspect-[4/3] border-2 border-brand-dark dark:border-brand-bg rounded-lg overflow-hidden mb-3 relative cursor-pointer bg-white" onClick={() => setSelectedCertificate(cert)}>
                    <EditableMedia
                      src={cert.image}
                      alt={cert.title}
                      className="w-full h-full object-contain transition-all"
                      storageKey={`cert_img_${cert.id}`}
                      isEditing={isEditMode}
                      wrapperClassName="w-full h-full"
                      onUpdate={(newUrl) => updateCertificateImage(index, newUrl)}
                    />
                    {(cert.urls && cert.urls.length > 1) && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                        +{cert.urls.length - 1}
                      </div>
                    )}
                  </div>
                  <div className={`p-2 md:p-3 rounded-lg border-2 border-brand-dark dark:border-brand-bg text-center font-bold text-xs md:text-sm text-brand-dark ${index % 2 === 0 ? 'bg-brand-orange' : 'bg-brand-blue'} cursor-pointer`} onClick={() => setSelectedCertificate(cert)}>
                    <EditableText initialText={cert.title} storageKey={`cert_title_${cert.id}`} isEditing={isEditMode} tag="span" />
                  </div>
                  <div className="mt-2 text-[10px] md:text-xs text-center border-t border-dashed border-gray-400 dark:border-brand-bg/50 pt-2 text-brand-dark dark:text-brand-bg cursor-pointer" onClick={() => setSelectedCertificate(cert)}>
                    <span className="font-bold">Issuer: </span>
                    <EditableText initialText={cert.issuer} storageKey={`cert_iss_${cert.id}`} isEditing={isEditMode} tag="span" />
                    <span className="mx-2">|</span>
                    {isEditMode ? (
                      <EditableText initialText={cert.date} storageKey={`cert_date_${cert.id}`} isEditing={isEditMode} tag="span" />
                    ) : (
                      <span className="font-bold text-brand-blue hover:text-brand-dark transition-colors">Click For More Details</span>
                    )}
                  </div>
                </Card>
                {isEditMode && (
                  <>
                    <div className="absolute -top-3 left-3 z-40 rounded-full border-2 border-brand-dark bg-brand-dark p-2 text-white shadow-retro-sm">
                      <GripVertical size={16} />
                    </div>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeCertificate(index); }}
                      className="absolute -top-3 -right-3 bg-brand-red text-white p-2 rounded-full border-2 border-brand-dark shadow-retro-sm z-40 cursor-pointer"
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
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
        {selectedCertificate && (() => {
          const certIndex = dynamicCertificates.findIndex(c => c.id === selectedCertificate.id);
          const currentCert = certIndex >= 0 ? dynamicCertificates[certIndex] : selectedCertificate;
          return (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedCertificate(null)}>
              <div className="relative max-w-4xl w-full animate-bounce-in" onClick={e => e.stopPropagation()}>
                <button onClick={() => setSelectedCertificate(null)} className="absolute -top-5 -right-2 md:-right-5 bg-brand-red text-white p-2 rounded-full border-2 border-brand-dark dark:border-brand-bg shadow-retro-sm dark:shadow-retro-sm-light hover:scale-110 transition-transform z-50">
                  <X size={24} />
                </button>

                <div className="bg-brand-bg dark:bg-brand-dark-bg p-2 rounded-xl border-4 border-brand-dark dark:border-brand-bg w-full shadow-retro dark:shadow-retro-light max-h-[85vh] md:max-h-[90vh] overflow-y-auto retro-scrollbar">
                  <div className="flex flex-col gap-4 p-2">
                    <div className="font-black text-2xl md:text-3xl text-center text-brand-dark dark:text-brand-bg p-2 border-b-2 border-dashed border-brand-dark/20 dark:border-brand-bg/20">
                      <EditableText initialText={currentCert.title} storageKey={`cert_title_${currentCert.id}`} isEditing={isEditMode} tag="span" />
                    </div>

                    {/* Gallery */}
                    <div className="space-y-4">
                      {currentCert.urls?.map((url, imgIdx) => (
                        <div
                          key={imgIdx}
                          className={`relative group border-4 border-brand-dark dark:border-brand-bg rounded-lg overflow-hidden bg-black/5 ${isEditMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
                          draggable={isEditMode}
                          onDragStart={(e) => handleDragStart(e, { type: 'certificate-image', fromIndex: imgIdx, certIndex })}
                          onDragOver={allowDrop}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const payload = getDropPayload(e);
                            if (payload?.type === 'certificate-image' && payload.certIndex === certIndex) {
                              moveCertificateImageTo(certIndex, payload.fromIndex, imgIdx);
                            }
                            setDragPayload(null);
                          }}
                        >
                          <EditableMedia
                            src={url}
                            alt={`${currentCert.title} - ${imgIdx + 1}`}
                            className="w-full h-auto object-contain"
                            wrapperClassName="w-full h-auto"
                            storageKey={`cert_${currentCert.id}_img_${imgIdx}`}
                            isEditing={isEditMode}
                            onUpdate={(newUrl) => certIndex >= 0 && updateCertificateImageAtIndex(certIndex, imgIdx, newUrl)}
                          />
                          {isEditMode && currentCert.urls && currentCert.urls.length > 1 && (
                            <button
                              onClick={() => certIndex >= 0 && removeCertificateImage(certIndex, imgIdx)}
                              className="absolute top-2 right-2 bg-brand-red text-white p-2 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform z-40"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                          {isEditMode && (
                            <div className="absolute left-2 top-2 rounded-full border-2 border-white bg-brand-dark/80 p-2 text-white shadow-sm">
                              <GripVertical size={16} />
                            </div>
                          )}
                        </div>
                      ))}
                      {isEditMode && certIndex >= 0 && (
                        <button onClick={() => addCertificateImage(certIndex)} className="w-full py-4 border-2 border-dashed border-brand-dark dark:border-brand-bg rounded-lg flex items-center justify-center gap-2 font-bold text-brand-dark/50 dark:text-brand-bg/50 hover:bg-brand-dark/5 dark:hover:bg-brand-bg/5 hover:text-brand-dark dark:hover:text-brand-bg transition-all">
                          <Plus size={20} /> Add Another Image
                        </button>
                      )}
                    </div>

                    <div className="p-4 bg-brand-dark/5 dark:bg-white/5 rounded-xl border-2 border-brand-dark/10 dark:border-brand-bg/10">
                      <div className="flex flex-col gap-2">
                        <div className="text-sm font-bold opacity-70 uppercase tracking-widest text-brand-dark dark:text-brand-bg">Details</div>
                        <div className="font-medium text-brand-dark dark:text-brand-bg">
                          <span className="font-bold">Issued by: </span>
                          <EditableText initialText={currentCert.issuer} storageKey={`cert_iss_${currentCert.id}`} isEditing={isEditMode} tag="span" />
                        </div>
                        <div className="font-medium text-brand-dark dark:text-brand-bg">
                          <span className="font-bold">Date: </span>
                          <EditableText initialText={currentCert.date} storageKey={`cert_date_${currentCert.id}`} isEditing={isEditMode} tag="span" />
                        </div>
                        <div className="mt-4 pt-4 border-t border-brand-dark/10 dark:border-brand-bg/10">
                          <EditableText
                            initialText={currentCert.description || "No description provided."}
                            storageKey={`cert_desc_${currentCert.id}`}
                            isEditing={isEditMode}
                            tag="p"
                            multiline={true}
                            className="text-sm md:text-base leading-relaxed text-brand-dark dark:text-brand-bg opacity-90"
                            onUpdate={(val) => certIndex >= 0 && updateCertificateDescription(certIndex, val)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
        <Section id="contact" title="Contact Me" isEditing={isEditMode} storageKey="title_contact">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
            <div className="lg:col-span-2 space-y-4 md:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
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
                    <div
                      key={btn.id}
                      className={`relative group/contact ${isEditMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
                      draggable={isEditMode}
                      onDragStart={(e) => handleDragStart(e, { type: 'contact-button', fromIndex: index })}
                      onDragOver={allowDrop}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const payload = getDropPayload(e);
                        if (payload?.type === 'contact-button') moveContactButtonTo(payload.fromIndex, index);
                        setDragPayload(null);
                      }}
                    >
                      {isEditMode ? (
                        <Card variant={btn.variant} className="p-4 text-brand-dark">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 justify-between">
                              <div className="flex items-center gap-2">
                                <GripVertical size={18} />
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
                          <Card variant={btn.variant} className={`p-3 md:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${getHoverColor(btn.variant)} cursor-pointer text-brand-dark`}>
                            <div className="flex items-center gap-4 flex-shrink-0">
                              {renderIcon(btn.icon)}
                              <span className="font-bold text-base md:text-lg">{btn.label}</span>
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
              <Card variant="white" className="p-4 md:p-6">
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
                    <textarea required value={contactForm.message} onChange={(e) => handleContactFormChange('message', e.target.value)} className="w-full border-2 border-brand-dark dark:border-brand-bg p-2 rounded-lg bg-brand-bg dark:bg-brand-dark-bg dark:text-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-orange h-28 md:h-32 resize-none" placeholder="Let's build something awesome..." />
                  </div>
                  <Button type="submit" fullWidth className="flex justify-center items-center gap-2"><Send size={18} /> Send Email</Button>
                </form>
              </Card>
            </div>
            <div className="hidden lg:block lg:col-span-1">
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
