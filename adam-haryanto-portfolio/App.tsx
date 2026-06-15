import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  ExternalLink,
  Gamepad2,
  Github,
  Instagram,
  Linkedin,
  Link as LinkIcon,
  Mail,
  Menu,
  Palette,
  Phone,
  Send,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import {
  CERTIFICATES,
  CONTACT_BUTTONS,
  CUSTOM_IMAGES,
  CUSTOM_TEXTS,
  EDUCATION,
  EXPERIENCES,
  PORTFOLIO_2D,
  PORTFOLIO_3D,
  PROJECTS,
  SKILL_CATEGORIES,
  SOCIAL_LINKS,
} from './constants';
import {
  ArtCategory,
  Certificate,
  ContactButton,
  Experience,
  Project,
  SkillCategory,
} from './types';

const NAV_ITEMS = [
  ['About', '#about'],
  ['Education', '#education'],
  ['Experience', '#experience'],
  ['Skills', '#skills'],
  ['Projects', '#projects'],
  ['Art', '#art'],
  ['Contact', '#contact'],
] as const;

function readStoredData<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readText(key: string, fallback: string): string {
  try {
    return localStorage.getItem(`text_${key}`) || CUSTOM_TEXTS[key] || fallback;
  } catch {
    return CUSTOM_TEXTS[key] || fallback;
  }
}

function readImage(key: string, fallback: string): string {
  try {
    return (
      localStorage.getItem(`img_${key}`) ||
      localStorage.getItem(`media_${key}`) ||
      CUSTOM_IMAGES[key] ||
      fallback
    );
  } catch {
    return CUSTOM_IMAGES[key] || fallback;
  }
}

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^?&/]+)/i,
  );
  return match?.[1] || null;
}

function getPreviewUrl(url: string): string {
  const youtubeId = getYouTubeId(url);
  return youtubeId
    ? `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`
    : url;
}

function getProjectImage(project: Project): string {
  return readImage(`project_${project.id}_main`, project.image);
}

function getArtImage(item: { id: string; url: string; urls?: string[] }): string {
  const firstImage = item.urls?.[0] || item.url;
  return readImage(`art_item_${item.id}_0`, firstImage);
}

function getContactIcon(icon: ContactButton['icon']) {
  switch (icon) {
    case 'instagram':
      return Instagram;
    case 'phone':
      return Phone;
    case 'mail':
      return Mail;
    case 'linkedin':
      return Linkedin;
    case 'github':
      return Github;
    default:
      return LinkIcon;
  }
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [projects] = useState<Project[]>(() =>
    readStoredData('user_projects', PROJECTS),
  );
  const [experiences] = useState<Experience[]>(() =>
    readStoredData('user_experiences', EXPERIENCES),
  );
  const [skills] = useState<SkillCategory[]>(() =>
    readStoredData('user_skills', SKILL_CATEGORIES),
  );
  const [certificates] = useState<Certificate[]>(() =>
    readStoredData('user_certificates', CERTIFICATES),
  );
  const [contacts] = useState<ContactButton[]>(() =>
    readStoredData('user_contact_buttons', CONTACT_BUTTONS),
  );
  const [artCategories] = useState<ArtCategory[]>(() =>
    readStoredData('user_art_categories', [
      { id: '3d', title: '3D Portfolio', items: PORTFOLIO_3D },
      { id: '2d', title: '2D Portfolio', items: PORTFOLIO_2D },
    ]),
  );

  const profileImage = useMemo(
    () =>
      readImage(
        'profile_main',
        'https://picsum.photos/seed/adam-haryanto/900/1200',
      ),
    [],
  );

  const aboutCopy = readText(
    'about_desc',
    "I'm a Game Developer with over 3 years of experience. My skills include 3D modeling, C# and Lua programming, 2D art, graphic design, game design, and project management. Proficient in using Unity Engine and Roblox Studio. Highly adaptable to production workflows and experienced in team collaboration.",
  );

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -48px' },
    );

    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setSelectedCertificate(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const handleContactSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const subject = `Portfolio inquiry from ${contactForm.name}`;
    const body = `Name: ${contactForm.name}\nEmail: ${contactForm.email}\n\n${contactForm.message}`;
    const email =
      contacts.find((item) => item.icon === 'mail')?.url.replace('mailto:', '') ||
      SOCIAL_LINKS.email;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className={`site-header ${isScrolled ? 'is-scrolled' : ''}`}>
        <a className="wordmark" href="#top" onClick={closeMenu}>
          <span>AH</span>
          <strong>Adam Haryanto</strong>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {NAV_ITEMS.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <a className="header-cta" href="#contact">
            Let&apos;s talk
            <ArrowUpRight size={17} />
          </a>
          <button
            className="menu-button"
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>

        <div
          id="mobile-menu"
          className={`mobile-menu ${menuOpen ? 'is-open' : ''}`}
        >
          {NAV_ITEMS.map(([label, href], index) => (
            <a key={href} href={href} onClick={closeMenu}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              {label}
            </a>
          ))}
        </div>
      </header>

      <main id="main">
        <section id="top" className="hero">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-copy" data-reveal="left">
            <div className="eyebrow">
              <span className="status-dot" />
              Available for selected projects
            </div>
            <h1>
              Building worlds
              <span> players remember.</span>
            </h1>
            <p className="hero-intro">
              {readText('hero_subtitle', 'Game Developer & Technical Artist')}{' '}
              working across gameplay, 3D art, and interactive production.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#projects">
                Explore projects
                <ArrowDown size={18} />
              </a>
              <a
                className="button button-ghost"
                href={SOCIAL_LINKS.itch}
                target="_blank"
                rel="noreferrer"
              >
                Play on itch.io
                <ArrowUpRight size={18} />
              </a>
            </div>
          </div>

          <div className="hero-visual" data-reveal="scale">
            <div className="hero-image-wrap">
              <img
                src={profileImage}
                alt="Adam Haryanto, game developer and technical artist"
                width="900"
                height="1200"
                fetchPriority="high"
              />
              <span className="image-index">AH / 01</span>
            </div>
            <div className="hero-card hero-card-top">
              <Gamepad2 size={23} />
              <span>Game design</span>
            </div>
            <div className="hero-card hero-card-bottom">
              <Palette size={23} />
              <span>Technical art</span>
            </div>
          </div>

          <div className="hero-metrics" data-reveal="up">
            <div>
              <strong>3+</strong>
              <span>Years creating</span>
            </div>
            <div>
              <strong>{projects.length}</strong>
              <span>Featured projects</span>
            </div>
            <div>
              <strong>Top 15</strong>
              <span>GAMESEED 2025</span>
            </div>
          </div>
        </section>

        <section id="about" className="section section-light">
          <div className="section-heading" data-reveal="up">
            <p>01 / About</p>
            <h2>Creative range, technical focus.</h2>
          </div>

          <div className="about-grid">
            <article className="about-statement" data-reveal="left">
              <Sparkles size={32} />
              <p>{aboutCopy}</p>
            </article>

            <article className="principle-card accent-orange" data-reveal="scale">
              <span>Working principle</span>
              <h3>&ldquo;Finish what you start.&rdquo;</h3>
              <p>
                I value clear ownership, practical problem solving, and shipping
                work that feels deliberate.
              </p>
            </article>

            <article className="principle-card accent-cyan" data-reveal="scale">
              <span>Core role</span>
              <h3>Indie Game Developer</h3>
              <p>
                From gameplay systems to visual assets, I bridge design and
                implementation.
              </p>
            </article>
          </div>
        </section>

        <section id="education" className="section section-ink">
          <div className="section-heading section-heading-inverse" data-reveal="up">
            <p>02 / Education</p>
            <h2>Learning by making.</h2>
          </div>

          <div className="education-list">
            {EDUCATION.map((education, index) => (
              <article
                className="education-row"
                key={education.institution}
                data-reveal={index % 2 ? 'left' : 'up'}
              >
                <span className="education-number">0{index + 1}</span>
                <div className="education-logo">
                  <img
                    src={education.image}
                    alt={`${education.institution} logo`}
                    width="120"
                    height="120"
                    loading="lazy"
                  />
                </div>
                <div className="education-copy">
                  <p>{education.degree}</p>
                  <h3>{education.institution}</h3>
                  <span>{education.description}</span>
                </div>
                <div className="education-score">
                  <strong>{education.score}</strong>
                  <span>{education.scoreLabel}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="experience" className="section section-light">
          <div className="section-heading" data-reveal="up">
            <p>03 / Experience</p>
            <h2>Roles that shaped the craft.</h2>
          </div>

          <div className="experience-grid">
            {experiences.map((experience, index) => (
              <article
                className="experience-card"
                key={experience.id}
                data-reveal={index % 3 === 0 ? 'left' : 'up'}
                style={{ '--delay': `${(index % 3) * 70}ms` } as React.CSSProperties}
              >
                <div className="experience-media">
                  <img
                    src={readImage(`exp_img_${experience.id}`, experience.image || '')}
                    alt={`${experience.company} work`}
                    width="720"
                    height="420"
                    loading="lazy"
                  />
                </div>
                <div className="experience-body">
                  <div className="card-meta">
                    <span>{experience.type}</span>
                    <span>{experience.period}</span>
                  </div>
                  <h3>{experience.company}</h3>
                  <strong>{experience.role}</strong>
                  <p>{experience.description}</p>
                  <div className="key-note">
                    <Zap size={17} />
                    {experience.keyNotes}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="skills" className="section section-accent">
          <div className="section-heading" data-reveal="up">
            <p>04 / Capabilities</p>
            <h2>A multi-disciplinary toolkit.</h2>
          </div>

          <div className="skills-grid">
            {skills.map((category, categoryIndex) => (
              <article
                className="skill-column"
                key={category.title}
                data-reveal="up"
                style={{ '--delay': `${categoryIndex * 90}ms` } as React.CSSProperties}
              >
                <div className="skill-column-heading">
                  <span>0{categoryIndex + 1}</span>
                  <h3>{category.title}</h3>
                </div>
                <ul>
                  {category.skills.map((skill) => (
                    <li key={skill}>
                      <span>{skill}</span>
                      <ArrowUpRight size={15} />
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="projects" className="section section-ink">
          <div className="section-heading section-heading-inverse" data-reveal="up">
            <p>05 / Selected work</p>
            <h2>Games built with intent.</h2>
          </div>

          <div className="project-list">
            {projects.map((project, index) => {
              const image = getProjectImage(project);
              return (
                <article
                  className="project-row"
                  key={project.id}
                  data-reveal={index % 2 ? 'left' : 'up'}
                >
                  <a
                    className="project-media"
                    href={project.link || '#'}
                    target={project.link ? '_blank' : undefined}
                    rel={project.link ? 'noreferrer' : undefined}
                    aria-label={`Open ${project.title}`}
                  >
                    <img
                      src={getPreviewUrl(image)}
                      alt={`${project.title} project preview`}
                      width="1200"
                      height="720"
                      loading={index < 2 ? 'eager' : 'lazy'}
                    />
                    <span className="project-index">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="project-open">
                      <ExternalLink size={20} />
                    </span>
                  </a>
                  <div className="project-copy">
                    <div className="card-meta">
                      <span>{project.category}</span>
                      <span className={`status status-${project.status.toLowerCase()}`}>
                        {project.status}
                      </span>
                    </div>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <dl>
                      <div>
                        <dt>Role</dt>
                        <dd>{project.role}</dd>
                      </div>
                      <div>
                        <dt>Engine</dt>
                        <dd>{project.engine}</dd>
                      </div>
                    </dl>
                    {project.link && (
                      <a
                        className="text-link"
                        href={project.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View project
                        <ArrowUpRight size={17} />
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="art" className="section section-light art-section">
          <div className="section-heading" data-reveal="up">
            <p>06 / Art archive</p>
            <h2>Visual experiments and production work.</h2>
          </div>

          {artCategories.map((category, categoryIndex) => (
            <div className="art-category" key={category.id}>
              <div className="art-category-heading" data-reveal="left">
                <span>{String(categoryIndex + 1).padStart(2, '0')}</span>
                <h3>{category.title}</h3>
                <p>{category.items.length} pieces</p>
              </div>
              <div className="art-grid">
                {category.items.map((item, itemIndex) => (
                  <figure
                    className={`art-card art-card-${(itemIndex % 5) + 1}`}
                    key={item.id}
                    data-reveal="scale"
                    style={
                      { '--delay': `${(itemIndex % 4) * 55}ms` } as React.CSSProperties
                    }
                  >
                    <img
                      src={getPreviewUrl(getArtImage(item))}
                      alt={item.description || `${category.title} artwork ${itemIndex + 1}`}
                      width="900"
                      height="900"
                      loading="lazy"
                    />
                    <figcaption>
                      <span>{item.description || `Study ${itemIndex + 1}`}</span>
                      {item.urls && item.urls.length > 1 && (
                        <small>{item.urls.length} frames</small>
                      )}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section id="certificates" className="section section-muted">
          <div className="section-heading" data-reveal="up">
            <p>07 / Recognition</p>
            <h2>Milestones, courses, and certificates.</h2>
          </div>

          <div className="certificate-grid">
            {certificates.map((certificate, index) => (
              <button
                className="certificate-card"
                type="button"
                key={certificate.id}
                onClick={() => setSelectedCertificate(certificate)}
                data-reveal="up"
                style={{ '--delay': `${(index % 3) * 65}ms` } as React.CSSProperties}
              >
                <img
                  src={certificate.image}
                  alt=""
                  width="640"
                  height="420"
                  loading="lazy"
                />
                <span>{certificate.date}</span>
                <h3>{certificate.title}</h3>
                <p>{certificate.issuer}</p>
                <ArrowUpRight className="certificate-arrow" />
              </button>
            ))}
          </div>
        </section>

        <section id="contact" className="section contact-section">
          <div className="contact-intro" data-reveal="left">
            <p>08 / Contact</p>
            <h2>Have a game, world, or visual idea in mind?</h2>
            <span>
              Tell me what you&apos;re building and where you need help. I&apos;ll
              respond with a clear next step.
            </span>

            <div className="contact-links">
              {contacts.map((contact) => {
                const Icon = getContactIcon(contact.icon);
                return (
                  <a
                    href={contact.url}
                    target={contact.url.startsWith('http') ? '_blank' : undefined}
                    rel={contact.url.startsWith('http') ? 'noreferrer' : undefined}
                    key={contact.id}
                  >
                    <Icon size={20} />
                    <span>
                      <small>{contact.label}</small>
                      {contact.displayText}
                    </span>
                    <ArrowUpRight size={17} />
                  </a>
                );
              })}
            </div>
          </div>

          <form className="contact-form" onSubmit={handleContactSubmit} data-reveal="up">
            <div className="form-heading">
              <Mail size={24} />
              <h3>Start a conversation</h3>
            </div>
            <label>
              <span>Your name</span>
              <input
                type="text"
                name="name"
                autoComplete="name"
                required
                value={contactForm.name}
                onChange={(event) =>
                  setContactForm({ ...contactForm, name: event.target.value })
                }
                placeholder="Name"
              />
            </label>
            <label>
              <span>Your email</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                value={contactForm.email}
                onChange={(event) =>
                  setContactForm({ ...contactForm, email: event.target.value })
                }
                placeholder="you@example.com"
              />
            </label>
            <label>
              <span>Project details</span>
              <textarea
                name="message"
                required
                value={contactForm.message}
                onChange={(event) =>
                  setContactForm({ ...contactForm, message: event.target.value })
                }
                placeholder="A short overview of the project, scope, and timeline."
              />
            </label>
            <button className="button button-primary form-submit" type="submit">
              Send inquiry
              <Send size={18} />
            </button>
          </form>
        </section>
      </main>

      <footer className="site-footer">
        <a className="wordmark" href="#top">
          <span>AH</span>
          <strong>Adam Haryanto</strong>
        </a>
        <p>Game Developer & Technical Artist</p>
        <div>
          <a href={SOCIAL_LINKS.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href={SOCIAL_LINKS.itch} target="_blank" rel="noreferrer">
            itch.io
          </a>
        </div>
        <span>© {new Date().getFullYear()} Adam Haryanto</span>
      </footer>

      {selectedCertificate && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={() => setSelectedCertificate(null)}
        >
          <article
            className="certificate-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="certificate-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              aria-label="Close certificate details"
              onClick={() => setSelectedCertificate(null)}
            >
              <X />
            </button>
            <div className="modal-gallery">
              {(selectedCertificate.urls?.length
                ? selectedCertificate.urls
                : [selectedCertificate.image]
              ).map((image, index) => (
                <img
                  key={`${image}-${index}`}
                  src={image}
                  alt={`${selectedCertificate.title}, page ${index + 1}`}
                  width="1200"
                  height="850"
                />
              ))}
            </div>
            <div className="modal-copy">
              <div className="card-meta">
                <span>{selectedCertificate.issuer}</span>
                <span>{selectedCertificate.date}</span>
              </div>
              <h2 id="certificate-title">{selectedCertificate.title}</h2>
              <p>{selectedCertificate.description}</p>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}

export default App;
