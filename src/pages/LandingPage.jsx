import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Award,
  Briefcase,
  CheckCircle2,
  Compass,
  HeartHandshake,
  Menu,
  Moon,
  ShieldCheck,
  Sparkles,
  Sprout,
  Sun,
  TrendingUp,
  X,
} from 'lucide-react'
import Logo from '../components/common/Logo'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import Modal from '../components/common/Modal'
import { HeroGrowthIllustration } from '../components/common/BotanicalIllustrations'
import { useTheme } from '../context/ThemeContext'
import './LandingPage.css'

const SAMPLE_TESTIMONIALS = [
  {
    name: 'Aarav M.',
    role: 'B.Tech Computer Science (Sample Student)',
    quote:
      'Finding a weekend UI micro-gig alongside campus volunteering used to take five different apps. Having Earn, Impact, and Grow in one place keeps me focused.',
  },
  {
    name: 'Meera S.',
    role: 'Design & Media Undergraduate (Sample Student)',
    quote:
      'Tracking my volunteering hours and portfolio gigs together made it effortless to show real-world experience during internship interviews.',
  },
  {
    name: 'Rohan K.',
    role: 'Economics Student (Sample Student)',
    quote:
      'Setting monthly learning goals and matching them with paid research micro-gigs helped me turn classroom theory into verified skills.',
  },
]

const INFO_MODALS = {
  about: {
    title: 'About BloomUp',
    body: 'BloomUp is a student-first opportunity and growth platform designed to connect college and university learners with paid micro-gigs (Earn), community volunteering (Impact), and structured skill development (Grow).',
  },
  contact: {
    title: 'Contact BloomUp',
    body: 'Have questions about campus partnerships, student organizations, or technical support? Reach out via your campus coordinator or open an issue on the project repository.',
  },
  privacy: {
    title: 'Privacy Policy',
    body: 'BloomUp stores only the profile, skill, application, and learning goal data you explicitly provide. Authentication is powered by Supabase Auth, and Row Level Security ensures your private applications and progress remain accessible only to you.',
  },
  terms: {
    title: 'Terms of Use',
    body: 'BloomUp is provided as an MVP student opportunity platform. Earnings and impact points displayed on the platform represent verified activity tracking rather than direct bank transfers.',
  },
}

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeModal, setActiveModal] = useState(null)

  return (
    <div id="home" className="lp-page">
      {/* Navigation */}
      <header className="lp-nav">
        <div className="container lp-nav-inner">
          <Link to="/" aria-label="BloomUp Home">
            <Logo />
          </Link>

          <nav className="lp-nav-links" aria-label="Main navigation">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#how-it-works">How It Works</a>
          </nav>

          <div className="lp-nav-actions">
            <button
              type="button"
              className="lp-icon-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <Link to="/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary">Sign Up</Button>
            </Link>
          </div>

          <div className="lp-mobile-toggle" style={{ gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              className="lp-icon-btn"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              type="button"
              className="lp-icon-btn"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <div className={`lp-mobile-menu ${mobileOpen ? 'open' : ''}`}>
          <a href="#home" onClick={() => setMobileOpen(false)}>Home</a>
          <a href="#about" onClick={() => setMobileOpen(false)}>About</a>
          <a href="#how-it-works" onClick={() => setMobileOpen(false)}>How It Works</a>
          <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
            <Link to="/login" style={{ flex: 1 }} onClick={() => setMobileOpen(false)}>
              <Button variant="outline" fullWidth>Log In</Button>
            </Link>
            <Link to="/signup" style={{ flex: 1 }} onClick={() => setMobileOpen(false)}>
              <Button variant="primary" fullWidth>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="lp-hero">
        <div className="container lp-hero-grid">
          <div className="bu-fade-up">
            <span className="lp-eyebrow">
              <Sprout size={15} /> Student Opportunity & Growth Platform
            </span>
            <h1 className="lp-hero-title">
              Grow your skills. Earn your worth. Make an impact.
            </h1>
            <p className="lp-hero-desc">
              Discover opportunities, earn through your skills, contribute to meaningful causes, and
              build the future you want with BloomUp.
            </p>
            <div className="lp-hero-cta">
              <Link to="/signup">
                <Button size="lg" variant="primary">
                  Get Started <ArrowRight size={18} />
                </Button>
              </Link>
              <a href="#pillars">
                <Button size="lg" variant="outline">
                  Explore Opportunities
                </Button>
              </a>
            </div>

            <div className="lp-pillar-strip">
              <div className="lp-pillar-mini">
                <Briefcase size={18} color="#84C233" />
                <span>Earn Micro-Gigs</span>
              </div>
              <div className="lp-pillar-mini">
                <HeartHandshake size={18} color="#F7931E" />
                <span>Make Impact</span>
              </div>
              <div className="lp-pillar-mini">
                <TrendingUp size={18} color="#F6C827" />
                <span>Grow Skills</span>
              </div>
            </div>
          </div>

          <div className="lp-hero-visual">
            <HeroGrowthIllustration />
          </div>
        </div>
      </section>

      {/* Three Pillars */}
      <section id="pillars" className="lp-section lp-section-alt">
        <div className="container">
          <div className="lp-section-head">
            <Badge tone="green">THE THREE PILLARS</Badge>
            <h2 style={{ marginTop: 10 }}>One ecosystem for your student journey</h2>
            <p>
              Balance income, community contribution, and continuous learning without juggling
              disconnected tools.
            </p>
          </div>

          <div className="lp-grid-3">
            <article className="bu-card bu-card-interactive lp-pillar-card">
              <div
                className="lp-pillar-icon bu-leaf-tile"
                style={{ backgroundColor: 'var(--bg-badge-green)', color: '#5c8f1d' }}
              >
                <Briefcase size={24} />
              </div>
              <Badge tone="green">EARN</Badge>
              <h3>Turn your skills into opportunities.</h3>
              <p>
                Browse verified paid micro-gigs in design, coding, tutoring, content creation, and
                research. Build real experience and track verified rewards.
              </p>
            </article>

            <article className="bu-card bu-card-interactive lp-pillar-card">
              <div
                className="lp-pillar-icon bu-leaf-tile"
                style={{ backgroundColor: 'var(--bg-badge-orange)', color: '#c46b09' }}
              >
                <HeartHandshake size={24} />
              </div>
              <Badge tone="orange">IMPACT</Badge>
              <h3>Make a difference beyond yourself.</h3>
              <p>
                Join environmental clean-ups, tree plantation drives, and teaching initiatives.
                Record verified volunteering hours, earn impact points, and unlock badges.
              </p>
            </article>

            <article className="bu-card bu-card-interactive lp-pillar-card">
              <div
                className="lp-pillar-icon bu-leaf-tile"
                style={{ backgroundColor: 'var(--bg-badge-yellow)', color: '#a88108' }}
              >
                <Sprout size={24} />
              </div>
              <Badge tone="yellow">GROW</Badge>
              <h3>Become better, one step at a time.</h3>
              <p>
                Track technical and soft skills, set target dates for learning goals, explore
                curated resources, and watch your capability grow each week.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="lp-section">
        <div className="container">
          <div className="lp-section-head">
            <Badge tone="yellow">HOW IT WORKS</Badge>
            <h2 style={{ marginTop: 10 }}>From signup to measurable growth</h2>
            <p>Four simple steps to launch your BloomUp student profile.</p>
          </div>

          <div className="lp-grid-4">
            {[
              {
                num: '1',
                title: 'Create your profile',
                desc: 'Share your education, skills, interests, and career goals during guided onboarding.',
              },
              {
                num: '2',
                title: 'Discover opportunities',
                desc: 'Get matched with paid micro-gigs and volunteering events tailored to your strengths.',
              },
              {
                num: '3',
                title: 'Earn, contribute & learn',
                desc: 'Apply with a tailored note, complete meaningful work, and pursue learning goals.',
              },
              {
                num: '4',
                title: 'Track your progress',
                desc: 'Monitor verified earnings, volunteering hours, impact points, and skill milestones.',
              },
            ].map((step) => (
              <div key={step.num} className="bu-card lp-step-card">
                <div className="lp-step-num">{step.num}</div>
                <h3 style={{ fontSize: '1.08rem' }}>{step.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why BloomUp */}
      <section id="about" className="lp-section lp-section-alt">
        <div className="container">
          <div className="lp-section-head">
            <Badge tone="orange">WHY BLOOMUP</Badge>
            <h2 style={{ marginTop: 10 }}>Designed for ambitious, purpose-driven students</h2>
            <p>
              BloomUp brings together paid experience, social impact, and personal development into
              one cohesive student workspace.
            </p>
          </div>

          <div className="lp-grid-2">
            {[
              {
                icon: Compass,
                title: 'Personalized Smart Matching',
                desc: 'Rule-based recommendations highlight gigs and volunteering roles that match your skills and interests—with clear explanations.',
              },
              {
                icon: ShieldCheck,
                title: 'Verified Progress & Integrity',
                desc: 'Earnings, volunteering hours, and impact points are recorded only upon verified completion—giving your profile genuine credibility.',
              },
              {
                icon: Sparkles,
                title: 'Unified Application Hub',
                desc: 'Track pending, accepted, rejected, and completed applications across both Earn and Impact from one clean timeline.',
              },
              {
                icon: Award,
                title: 'Skills & Goal Accountability',
                desc: 'Visualize your proficiency levels, set deadline-backed learning goals, and celebrate milestones with achievement badges.',
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="bu-card lp-feature-row">
                  <div
                    className="bu-leaf-tile"
                    style={{
                      width: 46,
                      height: 46,
                      flexShrink: 0,
                      backgroundColor: 'var(--bg-badge-green)',
                      color: '#5c8f1d',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.08rem', marginBottom: 6 }}>{item.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.93rem' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Sample / Demo Testimonials */}
      <section className="lp-section">
        <div className="container">
          <div className="lp-section-head">
            <Badge tone="brown">DEMO / SAMPLE TESTIMONIALS</Badge>
            <h2 style={{ marginTop: 10 }}>What the student experience looks like</h2>
            <p>
              Sample stories illustrating how students use BloomUp (clearly labeled demo content).
            </p>
          </div>

          <div className="lp-grid-3">
            {SAMPLE_TESTIMONIALS.map((t) => (
              <blockquote
                key={t.name}
                className="bu-card"
                style={{ margin: 0, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brand-green)' }}>
                  <CheckCircle2 size={18} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 800 }}>DEMO STORY</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', flex: 1 }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{t.name}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{t.role}</div>
                </div>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="lp-section" style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="lp-final-cta">
            <h2>Ready to grow your skills, earn your worth, and make an impact?</h2>
            <p>
              Create your student profile in minutes and start exploring curated micro-gigs,
              volunteering drives, and learning goals.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link to="/signup">
                <Button size="lg" variant="primary">
                  Create Free Student Account <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.35)' }}
                >
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="container lp-footer-inner">
          <div>
            <Logo size={30} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 6 }}>
              Grow your skills. Earn your worth. Make an impact.
            </p>
          </div>

          <div className="lp-footer-links">
            <button type="button" onClick={() => setActiveModal('about')}>About</button>
            <button type="button" onClick={() => setActiveModal('contact')}>Contact</button>
            <button type="button" onClick={() => setActiveModal('privacy')}>Privacy Policy</button>
            <button type="button" onClick={() => setActiveModal('terms')}>Terms</button>
            <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </div>
      </footer>

      <Modal
        isOpen={Boolean(activeModal)}
        onClose={() => setActiveModal(null)}
        title={activeModal ? INFO_MODALS[activeModal].title : ''}
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', lineHeight: 1.7 }}>
          {activeModal ? INFO_MODALS[activeModal].body : ''}
        </p>
      </Modal>
    </div>
  )
}
