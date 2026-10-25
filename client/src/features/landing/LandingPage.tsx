import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Plus,
  Check,
  Kanban,
  Search,
  BarChart3,
  MessageSquare,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Navbar } from './Navbar';
import { HeroVisual } from '@/components/common/HeroVisual';
import { BarFieldVisualization } from '@/components/common/BarFieldVisualization';
import { Button } from '@/components/ui/Button';
import { PRODUCT_NAME, PRODUCT_TAGLINE } from '@/constants/app';

export const LandingPage: React.FC = () => {
  // Typing effect for eyebrow
  const eyebrowFullText = 'TASK MANAGEMENT, ORGANIZED';
  const [eyebrowText, setEyebrowText] = useState('');

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setEyebrowText(eyebrowFullText.slice(0, index + 1));
      index++;
      if (index >= eyebrowFullText.length) {
        clearInterval(interval);
      }
    }, 60);
    return () => clearInterval(interval);
  }, []);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqItems = [
    {
      q: 'How does team assignment work in Tasklane?',
      a: 'Any workspace member can be assigned tasks. Once assigned, team members can update statuses, comment on progress, and reorder their personal backlog. Admins can reassign work at any time across the entire team.'
    },
    {
      q: 'What is the difference between Admin and User roles?',
      a: 'Admins have complete visibility across all workspace tasks, user permissions, and aggregate metrics. Regular users have focused scopes: they view, edit, and track tasks they either created or were assigned to.'
    },
    {
      q: 'How is overdue work calculated?',
      a: 'A task is automatically marked overdue if its due date is prior to the start of today in your local timezone and its status is not completed. Overdue items are flagged in high-contrast red across all views.'
    },
    {
      q: 'Can I export filtered task views to CSV?',
      a: 'Yes. The Export CSV action exports your currently applied search query, status filters, and priority selections. The output stream automatically escapes formulas to prevent CSV injection vulnerabilities.'
    },
    {
      q: 'Is my workspace data isolated and private?',
      a: 'Every endpoint enforces server-side role validation and authentication boundaries. Unauthorized resource queries return 404 responses so the existence of private workspace items is never exposed.'
    },
    {
      q: 'How do I get started with Tasklane?',
      a: 'Simply click Start for free to register your account. The first registered user automatically becomes the workspace administrator with full permissions to manage team members, tasks, and system settings.'
    }
  ];

  const features = [
    {
      tag: 'VISUAL WORKFLOW',
      title: 'Fluid Kanban Board',
      desc: 'Drag and drop tasks effortlessly across To Do, In Progress, and Completed columns with persistent ordering and optimistic updates.',
      icon: Kanban
    },
    {
      tag: 'FAST LOOKUP',
      title: 'Smart Search & Filters',
      desc: 'Debounced server-side title queries combined with multi-select status and priority filters that synchronize directly with URL parameters.',
      icon: Search
    },
    {
      tag: 'METRICS & TRENDS',
      title: 'Comprehensive Analytics',
      desc: 'Interactive Recharts donut distributions, priority breakdowns, and rolling 7, 14, and 30-day task completion velocity timelines.',
      icon: BarChart3
    },
    {
      tag: 'AUDIT TRAIL',
      title: 'Timeline & Comments',
      desc: 'Inspect granular task change history, status transitions, reassignment logs, and integrated discussion threads.',
      icon: MessageSquare
    },
    {
      tag: 'ENTERPRISE ACCESS',
      title: 'Role-Based Security',
      desc: 'Strict least-privilege architecture separating administrator organization controls from individual team member scopes.',
      icon: ShieldCheck
    }
  ];

  const pipelineSteps = [
    'Create',
    'Assign',
    'Prioritize',
    'Track',
    'Complete',
    'Review'
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary overflow-x-hidden">
      <Navbar />

      {/* 1. HERO SECTION (Split rounded-[40px] tiles) */}
      <section className="pt-24 lg:pt-28 pb-16 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* Left Tile (Large card grey #E9E9E9) */}
          <div className="rounded-[40px] bg-cardgrey p-8 sm:p-12 lg:p-16 flex flex-col justify-between min-h-[460px] lg:min-h-[540px]">
            {/* Top: Eyebrow */}
            <div>
              <div className="inline-flex items-center font-mono text-xs uppercase tracking-wider text-primary font-medium mb-6">
                <span>{eyebrowText}</span>
                <span className="blinking-cursor" />
              </div>

              {/* Hero Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] leading-[1.08] font-medium tracking-tight text-text-primary mb-6">
                Plan, assign, and finish work with clarity
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-lg mb-8">
                {PRODUCT_NAME} gives your team one calm place to create tasks, set priorities, track deadlines, and see exactly where work stands.
              </p>
            </div>

            {/* Bottom: Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link to="/register">
                <Button variant="primary" size="lg">
                  Start for free
                  <ArrowRight className="w-4 h-4 stroke-[1.5]" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Tile: Atmospheric visual composition */}
          <HeroVisual />
        </div>
      </section>

      {/* 2. STATS SECTION WITH ANIMATED BAR-FIELD */}
      <section className="py-24 px-6 lg:px-8 max-w-7xl mx-auto border-t border-border">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-wider text-primary font-medium block mb-3">
              BUILT FOR FOCUS
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-text-primary leading-tight">
              <span>Everything your team is working on, in one view </span>
              <span className="opacity-40">from first draft to done.</span>
            </h2>
          </div>
          <a href="#features" className="self-start lg:self-end">
            <button className="btn-tertiary">
              Explore the features
              <ChevronRight className="w-4 h-4 btn-arrow stroke-[1.5]" />
            </button>
          </a>
        </div>

        {/* Animated Bar-field */}
        <div className="py-6 mb-12 rounded-3xl bg-surface border border-border px-6">
          <BarFieldVisualization count={52} />
        </div>

        {/* Four Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
          <div className="flex flex-col gap-1 border-l-2 border-primary/40 pl-4">
            <span className="text-2xl sm:text-3xl font-semibold text-primary font-mono">3</span>
            <span className="text-xs font-mono uppercase tracking-wider text-text-muted">Task states</span>
          </div>
          <div className="flex flex-col gap-1 border-l-2 border-primary/40 pl-4">
            <span className="text-2xl sm:text-3xl font-semibold text-primary font-mono">100%</span>
            <span className="text-xs font-mono uppercase tracking-wider text-text-muted">Role-based access</span>
          </div>
          <div className="flex flex-col gap-1 border-l-2 border-primary/40 pl-4">
            <span className="text-2xl sm:text-3xl font-semibold text-primary font-mono">Real time</span>
            <span className="text-xs font-mono uppercase tracking-wider text-text-muted">Overdue tracking</span>
          </div>
          <div className="flex flex-col gap-1 border-l-2 border-primary/40 pl-4">
            <span className="text-2xl sm:text-3xl font-semibold text-primary font-mono">1 click</span>
            <span className="text-xs font-mono uppercase tracking-wider text-text-muted">CSV export</span>
          </div>
        </div>
      </section>

      {/* 3. FEATURE SHOWCASE (id="features") */}
      <section id="features" className="py-24 px-6 lg:px-8 max-w-7xl mx-auto border-t border-border">
        <div className="mb-16">
          <span className="font-mono text-xs uppercase tracking-wider text-primary font-medium block mb-3">
            PRODUCT CAPABILITIES
          </span>
          <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-text-primary">
            Designed for clarity, engineered for speed
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`rounded-2xl border border-border p-8 bg-white transition-all hover:border-primary/50 hover:shadow-sm ${
                  idx === 0 ? 'md:col-span-2 lg:col-span-2' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs uppercase tracking-wider text-primary font-medium">
                    {feature.tag}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-primary">
                    <Icon className="w-5 h-5 stroke-[1.5]" />
                  </div>
                </div>
                <h3 className="text-xl font-medium text-text-primary mb-2.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. WORKFLOW PIPELINE MARQUEE (id="workflow") */}
      <section id="workflow" className="py-20 bg-surface border-y border-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-8 text-center">
          <span className="font-mono text-xs uppercase tracking-wider text-text-muted font-medium">
            WORKFLOW PIPELINE
          </span>
        </div>
        <div className="relative flex overflow-hidden select-none py-2">
          {/* Edge fade gradients for polished visual cutoff */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-36 bg-gradient-to-r from-surface to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-36 bg-gradient-to-l from-surface to-transparent z-10" />

          {/* Marquee track moving from left to right */}
          <div className="flex gap-4 animate-marquee-ltr whitespace-nowrap">
            {[
              ...pipelineSteps, ...pipelineSteps, ...pipelineSteps, ...pipelineSteps,
              ...pipelineSteps, ...pipelineSteps, ...pipelineSteps, ...pipelineSteps
            ].map((step, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white border border-border font-mono text-sm font-medium text-text-primary shadow-xs hover:border-primary/50 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>{step}</span>
                <ArrowRight className="w-3.5 h-3.5 text-text-muted stroke-[1.5]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PERMISSIONS COMPARISON TABLE (id="permissions") */}
      <section id="permissions" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="font-mono text-xs uppercase tracking-wider text-primary font-medium block mb-3">
            ACCESS ARCHITECTURE
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-text-primary mb-4">
            Role-based boundaries built for trust
          </h2>
          <p className="text-text-secondary text-sm sm:text-base">
            Granular permission controls ensure sensitive organizational oversight remains protected while team members stay focused on assigned tasks.
          </p>
        </div>

        {/* Comparison Table with Mobile Scroll Container */}
        <div className="overflow-x-auto rounded-2xl border border-border bg-white max-w-4xl mx-auto shadow-2xs">
          <div className="min-w-[540px]">
            <div className="grid grid-cols-12 bg-surface px-6 py-4 border-b border-border text-xs font-mono uppercase tracking-wider text-text-muted">
              <div className="col-span-6 font-medium">Capability</div>
              <div className="col-span-3 text-center font-medium">User Role</div>
              <div className="col-span-3 text-center font-medium text-primary">Admin Role</div>
            </div>

            <div className="divide-y divide-border text-sm">
              {[
                { label: 'Create new tasks', user: true, admin: true },
                { label: 'Assign tasks to any active member', user: true, admin: true },
                { label: 'Edit and delete self-created tasks', user: true, admin: true },
                { label: 'Change status & order of assigned tasks', user: true, admin: true },
                { label: 'View all organization tasks', user: false, admin: true },
                { label: 'Edit or delete any team task', user: false, admin: true },
                { label: 'Manage user roles & account status', user: false, admin: true },
                { label: 'Export filtered CSV records', user: true, admin: true },
                { label: 'Delete any user discussion comment', user: false, admin: true },
              ].map((row) => (
                <div key={row.label} className="grid grid-cols-12 px-6 py-3.5 items-center hover:bg-surface/50 transition-colors">
                  <div className="col-span-6 text-text-primary font-medium">{row.label}</div>
                  <div className="col-span-3 flex justify-center">
                    {row.user ? (
                      <Check className="w-4 h-4 text-primary stroke-[2]" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-border" />
                    )}
                  </div>
                  <div className="col-span-3 flex justify-center">
                    {row.admin ? (
                      <Check className="w-4 h-4 text-primary stroke-[2]" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-border" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION (id="faq") */}
      <section id="faq" className="py-24 px-6 lg:px-8 max-w-7xl mx-auto border-t border-border">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sticky Left Column */}
          <div className="lg:col-span-4">
            <div className="sticky top-28">
              <span className="font-mono text-xs uppercase tracking-wider text-primary font-medium block mb-3">
                QUESTIONS & ANSWERS
              </span>
              <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-text-navy leading-tight mb-4">
                Frequently asked questions
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Everything you need to know about Tasklane product mechanics, permissions, and deployment.
              </p>
            </div>
          </div>

          {/* Accordion Right Column */}
          <div className="lg:col-span-8 divide-y divide-border">
            {faqItems.map((item, idx) => (
              <div key={idx} className="py-5">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between text-left gap-4 group cursor-pointer"
                >
                  <span className="text-base font-medium text-text-primary group-hover:text-primary transition-colors">
                    {item.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full border border-border flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      openFaq === idx ? 'rotate-45 bg-surface' : ''
                    }`}
                  >
                    <Plus className="w-4 h-4 text-text-muted stroke-[1.5]" />
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-text-secondary leading-relaxed pt-3 pb-1">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CLOSING CALL-TO-ACTION BAND */}
      <section className="py-16 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-[40px] bg-navy text-white p-10 sm:p-14 lg:p-20 text-center flex flex-col items-center">
          <span className="font-mono text-xs uppercase tracking-wider text-primary-light font-medium mb-4">
            GET STARTED TODAY
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight max-w-2xl mb-6 text-white leading-tight">
            Bring calm and focus back to your team's everyday work
          </h2>
          <p className="text-white/70 max-w-xl text-base sm:text-lg mb-8 leading-relaxed">
            Create tasks in seconds, organize sprints on the Kanban board, and track deadlines with confidence.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/register">
              <Button variant="primary" size="lg" className="bg-primary text-white hover:bg-primary-dark">
                Create free account
                <ArrowRight className="w-4 h-4 stroke-[1.5]" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="secondary-inverted"
                size="lg"
              >
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FOOTER (#FAFAFA) */}
      <footer className="bg-surface border-t border-border py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white">
                <svg width="15" height="15" viewBox="0 0 32 32" fill="none">
                  <path d="M8 10h16M8 16h10M8 22h13" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-text-primary">
                {PRODUCT_NAME}
              </span>
            </div>
            <p className="text-sm text-text-secondary max-w-sm mb-6 leading-relaxed">
              {PRODUCT_TAGLINE}. Engineered for reliability, privacy, and production workloads.
            </p>
            <div className="flex items-center gap-2.5">
              {['Docs', 'Status', 'GitHub'].map((social) => (
                <a
                  key={social}
                  href="#top"
                  className="w-9 h-9 rounded-full border border-border bg-white flex items-center justify-center text-xs font-mono text-text-secondary hover:text-text-primary hover:border-primary transition-colors"
                >
                  {social[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-text-primary font-medium mb-4">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm text-text-secondary">
              <li><a href="#features" className="hover:text-text-primary transition-colors">Kanban Board</a></li>
              <li><a href="#features" className="hover:text-text-primary transition-colors">Smart Filters</a></li>
              <li><a href="#features" className="hover:text-text-primary transition-colors">Analytics</a></li>
              <li><a href="#permissions" className="hover:text-text-primary transition-colors">Permissions</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-text-primary font-medium mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm text-text-secondary">
              <li><a href="#workflow" className="hover:text-text-primary transition-colors">About</a></li>
              <li><a href="#workflow" className="hover:text-text-primary transition-colors">Careers</a></li>
              <li><a href="#workflow" className="hover:text-text-primary transition-colors">Press</a></li>
              <li><a href="#workflow" className="hover:text-text-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-text-primary font-medium mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-text-secondary">
              <li><a href="#faq" className="hover:text-text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#faq" className="hover:text-text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#faq" className="hover:text-text-primary transition-colors">Security</a></li>
              <li><a href="#faq" className="hover:text-text-primary transition-colors">Compliance</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-text-muted">
          <span>&copy; {new Date().getFullYear()} {PRODUCT_NAME} Systems Inc. All rights reserved.</span>
          <span>Designed with restraint and precision.</span>
        </div>
      </footer>
    </div>
  );
};
