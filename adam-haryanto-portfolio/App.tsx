import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Download, ExternalLink, Mail, Phone, Instagram, Linkedin, Github, Pencil, RotateCcw, Check, Plus, Trash2, Ban, Send, Link as LinkIcon, ChevronDown, Settings, Video, AlertTriangle, Moon, Sun } from 'lucide-react';
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

  // Dynamic Data States
  const [dynamicSkills, setDynamicSkills] = useState<SkillCategory[]>(SKILL_CATEGORIES);
  const [dynamicProjects, setDynamicProjects] = useState<Project[]>(PROJECTS);
  const [dynamicExperiences, setDynamicExperiences] = useState<Experience[]>(EXPERIENCES);
  const [dynamicCertificates, setDynamicCertificates] = useState<Certificate[]>(CERTIFICATES);
  const [dynamicContactButtons, setDynamicContactButtons] = useState<ContactButton[]>(CONTACT_BUTTONS);

  const [artCategories, setArtCategories] = useState<ArtCategory[]>([
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
  ]);

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

  // Load data from local storage
  useEffect(() => {
    const loadData = (key: string, setter: React.Dispatch<React.SetStateAction<any>>, prefix: string) => {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setter(ensureIds(parsed, prefix));
        } catch (e) { console.error(e); }
      }
    };

    loadData('user_skills', setDynamicSkills, 'skill');
    loadData('user_projects', setDynamicProjects, 'proj');
    loadData('user_experiences', setDynamicExperiences, 'exp');
    loadData('user_certificates', setDynamicCertificates, 'cert');
    loadData('user_contact_buttons', setDynamicContactButtons, 'contact');

    // Special load for Art Categories
    const savedArt = localStorage.getItem('user_art_categories');
    if (savedArt) {
      try {
        const parsed = JSON.parse(savedArt);
        const fixed = parsed.map((cat: ArtCategory, i: number) => ({
          ...cat,
          items: ensureIds(cat.items, `art_${i}`)
        }));
        setArtCategories(fixed);
      } catch (e) { console.error(e); }
    } else {
      // Migration logic for old structure
      const old3D = localStorage.getItem('user_portfolio_3d');
      const old2D = localStorage.getItem('user_portfolio_2d');
      if (old3D || old2D) {
        const newCats = [...artCategories];
        if (old3D) { try { newCats[0].items = JSON.parse(old3D).map((u: string, i: number) => ({ id: `3d_mig_${i}`, url: u, type: 'image' })); } catch (e) { } }
        if (old2D) { try { newCats[1].items = JSON.parse(old2D).map((u: string, i: number) => ({ id: `2d_mig_${i}`, url: u, type: 'image' })); } catch (e) { } }
        setArtCategories(newCats);
        localStorage.setItem('user_art_categories', JSON.stringify(newCats));
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
    setDynamicProjects(prevProjects => {
      const updated = prevProjects.map((project, idx) => {
        if (idx === projectIndex) {
          return {
            ...project,
            screenshots: [...project.screenshots, "https://picsum.photos/seed/newshot/300/200"]
          };
        }
        return project;
      });
      save('user_projects', updated);
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
    setArtCategories([...artCategories, newCat]);
    save('user_art_categories', [...artCategories, newCat]);
  };
  const removeArtCategory = (index: number) => {
    const updated = [...artCategories];
    updated.splice(index, 1);
    setArtCategories(updated);
    save('user_art_categories', updated);
  };
  const addArtItem = (catIndex: number) => {
    const updated = [...artCategories];
    updated[catIndex].items.push({ id: `art_item_${Date.now()}`, url: "https://picsum.photos/seed/newart/400/300", type: 'image' });
    setArtCategories(updated);
    save('user_art_categories', updated);
  };
  const removeArtItem = (catIndex: number, itemIndex: number) => {
    const updated = [...artCategories];
    updated[catIndex].items.splice(itemIndex, 1);
    setArtCategories(updated);
    save('user_art_categories', updated);
  };
  const updateArtItemUrl = (catIndex: number, itemIndex: number, newUrl: string) => {
    const updated = [...artCategories];
    updated[catIndex].items[itemIndex].url = newUrl;
    setArtCategories(updated);
    save('user_art_categories', updated);
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
                  <button onClick={cancelEditMode} className="p-2 bg-brand-bg text-brand-red border-2 border-brand-red hover:bg-brand-red hover:text-white rounded-full transition-colors tooltip shadow-sm" title="Undo all changes (Cancel Session)">
                    <RotateCcw size={20} />
                  </button>
                  <button onClick={finishEditMode} className="flex items-center gap-2 px-3 py-1.5 rounded-full font-bold border-2 transition-all bg-brand-green text-white border-brand-dark shadow-retro-sm">
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
                  <div className="flex gap-2 pt-4">
                    <button onClick={cancelEditMode} className="flex-1 flex justify-center items-center gap-2 font-bold text-brand-red border-2 border-brand-red rounded-lg py-2">
                      <RotateCcw size={18} /> Cancel
                    </button>
                    <button onClick={handleFactoryReset} className="flex-1 flex justify-center items-center gap-2 font-bold text-brand-dark/50 border-2 border-brand-dark/20 rounded-lg py-2 text-xs">
                      <AlertTriangle size={14} /> Factory Reset
                    </button>
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
                <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 border-4 border-brand-dark rounded-lg overflow-hidden bg-white">
                  <EditableImage src={edu.image || "https://picsum.photos/seed/edu/200/200"} alt={edu.institution} storageKey={`edu_img_${index}`} isEditing={isEditMode} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 text-brand-dark">
                  <EditableText initialText={edu.institution} storageKey={`edu_inst_${index}`} isEditing={isEditMode} tag="h3" className="text-2xl md:text-3xl font-black mb-2" />
                  <p className="text-xl font-bold opacity-80 mb-4">{edu.degree}</p>
                  <EditableText initialText={edu.description} storageKey={`edu_desc_${index}`} isEditing={isEditMode} tag="p" multiline={true} className="font-medium leading-relaxed" />
                </div>
                <div className="bg-brand-dark/10 p-6 rounded-xl border-2 border-brand-dark min-w-[150px] text-center text-brand-dark">
                  <span className="block text-4xl font-black">{edu.score}</span>
                  <span className="text-xs font-bold uppercase tracking-wider opacity-70">{edu.scoreLabel}</span>
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
                    <EditableImage src={exp.image || "https://picsum.photos/seed/exp/100/100"} alt={exp.company} storageKey={`exp_img_${exp.id}`} isEditing={isEditMode} className="w-full h-full object-cover" wrapperClassName="w-full h-full" />
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
                          <ExternalLink className="w-5 h-5 opacity-50 text-brand-dark" />
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
                    {category.items.map((item, itemIndex) => (
                      <div key={item.id} className="group relative border-4 border-brand-dark dark:border-brand-bg rounded-xl overflow-hidden bg-black/5">
                        <EditableMedia src={item.url} alt={`${category.title} ${itemIndex + 1}`} className="w-full h-auto block transition-transform duration-500 group-hover:scale-105" wrapperClassName="w-full h-auto" storageKey={`art_item_${item.id}`} isEditing={isEditMode} onUpdate={(newUrl) => updateArtItemUrl(catIndex, itemIndex, newUrl)} />
                        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center pb-6 transition-opacity duration-300 pointer-events-none ${isEditMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          <div className="pointer-events-auto px-4 text-center w-full">
                            <EditableText initialText={`Artwork #${itemIndex + 1}`} storageKey={`art_desc_${item.id}`} isEditing={isEditMode} className="text-white font-black text-lg uppercase tracking-wider drop-shadow-md" />
                          </div>
                        </div>
                        {isEditMode && (
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeArtItem(catIndex, itemIndex); }} className="absolute top-2 right-2 bg-brand-red text-white p-1 rounded border-2 border-white z-40 shadow-sm cursor-pointer" type="button">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
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
                          <Card variant={btn.variant} className={`p-4 flex items-center justify-between ${getHoverColor(btn.variant)} cursor-pointer text-brand-dark`}>
                            <div className="flex items-center gap-4">
                              {renderIcon(btn.icon)}
                              <span className="font-bold text-lg">{btn.label}</span>
                            </div>
                            <span className="font-black text-xs md:text-sm truncate max-w-[150px]">{btn.displayText}</span>
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