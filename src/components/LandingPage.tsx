'use client';

/**
 * LandingPage — Healthcare Business Automation Platform
 * ------------------------------------------------------
 * Repositioned from a physiotherapy-clinic-specific page into a universal
 * healthcare business automation platform. Physiotherapy is now presented
 * as ONE example workflow among several (dental, medical, dermatology,
 * rehab, specialist practices) rather than the identity of the product.
 *
 * SEO note: this is a client component, so metadata cannot be exported from
 * here. Set the following in the parent page.tsx / layout.tsx:
 *
 *   export const metadata = {
 *     title: 'Healthcare Management & Automation Software | [BRAND]',
 *     description:
 *       'Automate appointments, patients, staff workflows, memberships and
 *        payments from one platform built for healthcare businesses —
 *        clinics, practices and care centers of every kind.',
 *   };
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useReducedMotion,
  AnimatePresence,
} from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Calendar,
  X,
  UserCircle,
  Award,
  CalendarCheck,
  Sparkles,
  Stethoscope,
  Smile,
  Activity,
  Sun,
  Users,
  Building2,
  CalendarDays,
  ClipboardList,
  CreditCard,
  BarChart3,
  ShieldCheck,
  Workflow,
  Layers,
  ChevronDown,
  Bell,
  Lock,
  FileText,
  Zap,
  MessageSquareText,
  FolderKanban,
  Settings2,
} from 'lucide-react';
import Logo from './Logo';
import PremiumImageCarousel from './PremiumImageCarousel';
import RoleBasedQuotes from './RoleBasedQuotes';
import { heroCarouselImages } from '@/lib/servicesData';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DoctorData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  profileCompleted: boolean;
  doctorProfile: {
    education: string;
    experience: string;
    specialization: string;
    availableDays: string[];
    timings: string;
  };
}

interface LandingPageProps {
  onLogin?: () => void;
  onSignup?: () => void;
  doctors?: DoctorData[];
}

/* Demo staff data spans multiple healthcare business types on purpose —
   this grid doubles as a live preview of the platform's staff-profile
   feature, not a single clinic's team page. */
const DUMMY_DOCTORS: DoctorData[] = [
  {
    id: 'dummy1',
    name: 'Dr. Sarah Ahmed',
    email: 'sarah@example.com',
    phone: '+1234567890',
    role: 'doctor',
    profileCompleted: true,
    doctorProfile: {
      education: 'PhD in Physical Therapy, Harvard University',
      experience: '15 years',
      specialization: 'Sports Rehabilitation',
      availableDays: ['Monday', 'Wednesday', 'Friday'],
      timings: '9:00 AM - 5:00 PM',
    },
  },
  {
    id: 'dummy2',
    name: 'Dr. Muhammad Ali',
    email: 'ali@example.com',
    phone: '+1234567891',
    role: 'doctor',
    profileCompleted: true,
    doctorProfile: {
      education: 'DDS, Orthodontics — AKU',
      experience: '12 years',
      specialization: 'Dental & Orthodontics',
      availableDays: ['Tuesday', 'Thursday', 'Saturday'],
      timings: '10:00 AM - 6:00 PM',
    },
  },
  {
    id: 'dummy3',
    name: 'Dr. Fatima Khan',
    email: 'fatima@example.com',
    phone: '+1234567892',
    role: 'doctor',
    profileCompleted: true,
    doctorProfile: {
      education: 'MD Dermatology, UCLA',
      experience: '10 years',
      specialization: 'Dermatology & Aesthetics',
      availableDays: ['Monday', 'Tuesday', 'Thursday'],
      timings: '8:00 AM - 4:00 PM',
    },
  },
  {
    id: 'dummy4',
    name: 'Dr. Ahmed Raza',
    email: 'ahmed@example.com',
    phone: '+1234567893',
    role: 'doctor',
    profileCompleted: true,
    doctorProfile: {
      education: 'Sports Medicine Certification, UK',
      experience: '8 years',
      specialization: 'General Medical Practice',
      availableDays: ['Wednesday', 'Friday', 'Saturday'],
      timings: '11:00 AM - 7:00 PM',
    },
  },
  {
    id: 'dummy5',
    name: 'Dr. Aisha Malik',
    email: 'aisha@example.com',
    phone: '+1234567894',
    role: 'doctor',
    profileCompleted: true,
    doctorProfile: {
      education: 'Pediatric Care Specialist, Canada',
      experience: '6 years',
      specialization: 'Pediatric Care',
      availableDays: ['Monday', 'Tuesday', 'Wednesday'],
      timings: '9:00 AM - 3:00 PM',
    },
  },
  {
    id: 'dummy6',
    name: 'Dr. Omar Sheikh',
    email: 'omar@example.com',
    phone: '+1234567895',
    role: 'doctor',
    profileCompleted: true,
    doctorProfile: {
      education: 'Manual Therapy Expert, Germany',
      experience: '20 years',
      specialization: 'Rehabilitation & Manual Therapy',
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timings: '8:00 AM - 8:00 PM',
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Shared primitives                                                  */
/* ------------------------------------------------------------------ */

function Section({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      id={id}
      ref={ref}
      initial={reduceMotion ? undefined : { opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : reduceMotion ? {} : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-semibold uppercase tracking-[0.2em]">
      {children}
    </span>
  );
}

function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-gradient-to-r from-rose-400 via-rose-300 to-amber-200 bg-clip-text text-transparent">
      {children}
    </span>
  );
}

function AnimatedCounter({
  value,
  suffix = '',
  duration = 1200,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isInView) return;
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    let raf: number;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isInView, value, duration, reduceMotion]);

  return (
    <span ref={ref}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Navbar                                                             */
/* ------------------------------------------------------------------ */

function Navbar({ onLogin, onSignup }: { onLogin: () => void; onSignup: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Platform', href: '#platform' },
    { label: 'Solutions', href: '#solutions' },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'bg-slate-950/80 backdrop-blur-md border-b border-white/10'
          : 'bg-gradient-to-b from-black/40 to-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        <Logo width={180} height={56} className="cursor-pointer" showTagline={false} />

        <div className="hidden lg:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-slate-300 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={onLogin}
            className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onSignup}
            className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-rose-800 text-white text-sm font-semibold rounded-lg shadow-lg shadow-rose-900/30"
          >
            Book a Demo
          </motion.button>
        </div>

        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="lg:hidden p-2 text-white"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <div className="w-6 flex flex-col gap-1.5">
            <span
              className={`h-0.5 bg-white transition-transform ${mobileOpen ? 'translate-y-2 rotate-45' : ''}`}
            />
            <span className={`h-0.5 bg-white transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
            <span
              className={`h-0.5 bg-white transition-transform ${mobileOpen ? '-translate-y-2 -rotate-45' : ''}`}
            />
          </div>
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-slate-950/95 backdrop-blur-md border-b border-white/10 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-slate-300 hover:text-white text-sm"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                <button onClick={onLogin} className="text-left text-slate-300 text-sm py-2">
                  Sign In
                </button>
                <button
                  onClick={onSignup}
                  className="px-5 py-3 bg-gradient-to-r from-rose-600 to-rose-800 text-white text-sm font-semibold rounded-lg"
                >
                  Book a Demo
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero — dashboard mockup instead of a physio-specific photo         */
/* ------------------------------------------------------------------ */

function DashboardMockup() {
  const reduceMotion = useReducedMotion();
  const cards = [
    { icon: CalendarDays, label: "Today's Appointments", value: 34, accent: 'text-rose-300' },
    { icon: Users, label: 'Active Patients', value: 812, accent: 'text-amber-300' },
    { icon: ClipboardList, label: 'Pending Approvals', value: 6, accent: 'text-sky-300' },
    { icon: CreditCard, label: 'Revenue This Month', value: 48200, accent: 'text-emerald-300', prefix: '$' },
  ];

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <motion.div
        animate={reduceMotion ? {} : { y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-semibold">
            Operations Overview
          </span>
          <Bell className="w-4 h-4 text-slate-400" />
        </div>

        <div className="p-5 grid grid-cols-2 gap-3">
          {cards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * i, duration: 0.6 }}
              className="rounded-xl bg-white/5 border border-white/10 p-4"
            >
              <card.icon className={`w-4 h-4 mb-2 ${card.accent}`} />
              <div className="text-white font-bold text-xl leading-none">
                {card.prefix ?? ''}
                <AnimatedCounter value={card.value} />
              </div>
              <div className="text-slate-400 text-[11px] mt-1">{card.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="px-5 pb-5">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400 font-medium">Staff Availability</span>
              <span className="text-[10px] text-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Live
              </span>
            </div>
            <div className="flex items-end gap-1.5 h-16">
              {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 0.4 + i * 0.06, duration: 0.6, ease: 'easeOut' }}
                  className="flex-1 rounded-t bg-gradient-to-t from-rose-600/80 to-amber-300/80"
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating notification card */}
      <motion.div
        initial={{ opacity: 0, x: 20, y: 20 }}
        animate={reduceMotion ? { opacity: 1, x: -12, y: -10 } : { opacity: 1, x: [-12, -20, -12], y: [-10, -18, -10] }}
        transition={{ delay: 0.9, duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="hidden sm:flex absolute -top-6 -right-8 items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-xl"
      >
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <div className="text-white text-xs font-semibold">Appointment confirmed</div>
          <div className="text-slate-400 text-[10px]">Synced across staff in real time</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: [0, 10, 0] }}
        transition={{ delay: 1.1, duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        className="hidden sm:flex absolute -bottom-6 -left-8 items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-xl"
      >
        <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
          <Zap className="w-4 h-4 text-rose-400" />
        </div>
        <div>
          <div className="text-white text-xs font-semibold">Workflow automated</div>
          <div className="text-slate-400 text-[10px]">3 manual steps removed</div>
        </div>
      </motion.div>
    </div>
  );
}

function HeroSection({ onLogin, onSignup }: { onLogin: () => void; onSignup: () => void }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden pt-24">
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        <PremiumImageCarousel
          images={heroCarouselImages}
          interval={5000}
          showControls={false}
          showIndicators={false}
          height="h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/85 to-slate-950" />
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 max-w-7xl mx-auto px-6 py-16 w-full">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Eyebrow>Healthcare Business Automation</Eyebrow>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.08]"
              style={{ fontFamily: 'var(--font-playfair-display)' }}
            >
              Run Your Healthcare Business.
              <br />
              <GradientText>We&rsquo;ll Handle the Busywork.</GradientText>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-6 text-lg text-slate-300 leading-relaxed max-w-xl"
            >
              Manage appointments, patients, staff, memberships, payments and records from one
              platform — built to adapt to the way your clinic or practice actually works.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="mt-9 flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 12px 32px rgba(225, 29, 72, 0.35)' }}
                whileTap={{ scale: 0.97 }}
                onClick={onSignup}
                className="px-8 py-4 flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-rose-800 text-white font-semibold rounded-xl shadow-lg shadow-rose-900/30"
              >
                Book a Free Demo
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.a
                href="#how-it-works"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 flex items-center justify-center gap-2 bg-white/5 text-white font-semibold rounded-xl border border-white/15 hover:bg-white/10 transition-colors"
              >
                See How It Works
              </motion.a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-slate-400"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Works for clinics of any specialty
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Configured around your workflow
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <DashboardMockup />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Built for your practice — industry cards                           */
/* ------------------------------------------------------------------ */

const INDUSTRIES = [
  {
    icon: Smile,
    name: 'Dental Clinics',
    blurb: 'Appointments, patient records, treatment workflows, follow-ups and payments.',
  },
  {
    icon: Activity,
    name: 'Physiotherapy',
    blurb: 'Sessions, treatment plans, progress tracking, memberships and therapist workflows.',
  },
  {
    icon: Stethoscope,
    name: 'Medical Clinics',
    blurb: 'Appointments, patient management, staff coordination and administrative workflows.',
  },
  {
    icon: Sun,
    name: 'Dermatology & Aesthetic',
    blurb: 'Patient journeys, treatment records, follow-ups and payments.',
  },
  {
    icon: Building2,
    name: 'Rehabilitation Centers',
    blurb: 'Patient progress, appointments, treatment plans and staff management.',
  },
  {
    icon: Users,
    name: 'Specialist Practices',
    blurb: 'Organize appointments, patients, staff, records and daily operations.',
  },
];

function IndustriesSection() {
  const [active, setActive] = useState(0);

  return (
    <Section id="solutions" className="py-24 px-6 bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-playfair-display)' }}
          >
            One Platform. <GradientText>Every Healthcare Workflow.</GradientText>
          </h2>
          <p className="text-slate-400 text-lg">
            Whether you run a dental clinic, physiotherapy practice, medical center, specialist
            clinic or growing healthcare business, the platform adapts to the way your team works.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {INDUSTRIES.map((industry, i) => {
            const Icon = industry.icon;
            const isActive = active === i;
            return (
              <motion.button
                key={industry.name}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className={`text-left p-6 rounded-2xl border transition-all duration-300 ${
                  isActive
                    ? 'bg-white/[0.07] border-rose-500/40 shadow-lg shadow-rose-900/10'
                    : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                    isActive ? 'bg-gradient-to-br from-rose-600 to-rose-800' : 'bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-1.5">{industry.name}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{industry.blurb}</p>
              </motion.button>
            );
          })}
        </div>

        <p className="text-center text-slate-500 text-sm mt-8">
          Same platform, same core workflows — configured around how your business operates.
        </p>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Problem section                                                    */
/* ------------------------------------------------------------------ */

const MANUAL_TOOLS = ['Spreadsheets', 'WhatsApp Messages', 'Paper Records', 'Phone Calls', 'Manual Approvals'];

function ProblemSection() {
  return (
    <Section className="py-24 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5"
          style={{ fontFamily: 'var(--font-playfair-display)' }}
        >
          Still Running Your Practice <GradientText>Manually?</GradientText>
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-16">
          Appointment chaos, scattered spreadsheets, WhatsApp follow-ups and paper records don&rsquo;t
          scale — and they quietly eat hours your team could spend with patients.
        </p>

        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-8 items-center">
          <div className="space-y-3">
            {MANUAL_TOOLS.map((tool, i) => (
              <motion.div
                key={tool}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm text-left"
              >
                {tool}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="hidden md:flex flex-col items-center gap-2"
          >
            <ArrowRight className="w-8 h-8 text-rose-400" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Automated</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="p-8 rounded-2xl bg-gradient-to-br from-rose-600/15 to-transparent border border-rose-500/30"
          >
            <Workflow className="w-9 h-9 text-rose-400 mb-4 mx-auto" />
            <div className="text-white font-bold text-xl mb-1">One Centralized Platform</div>
            <p className="text-slate-400 text-sm">
              Appointments, records and approvals, all in sync — automatically.
            </p>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Solution / feature grid                                            */
/* ------------------------------------------------------------------ */

const FEATURES = [
  { icon: CalendarDays, title: 'Smart Appointment Management', desc: 'Organize schedules, availability and appointment statuses in one view.' },
  { icon: Users, title: 'Patient Management', desc: 'Keep patient information organized, searchable and accessible.' },
  { icon: FolderKanban, title: 'Staff & Professional Workflows', desc: 'Give each team member the tools and permissions they need.' },
  { icon: FileText, title: 'Digital Medical Documents', desc: 'Securely upload, manage and access relevant patient documents.' },
  { icon: Award, title: 'Membership Management', desc: 'Manage subscriptions, benefits, requests and membership activity.' },
  { icon: CreditCard, title: 'Payments & Financial Tracking', desc: 'Track payments, membership revenue and financial activity.' },
  { icon: ClipboardList, title: 'Approvals', desc: 'Centralize requests and approval workflows in one place.' },
  { icon: BarChart3, title: 'Analytics', desc: 'Understand your business through meaningful dashboards.' },
  { icon: Bell, title: 'Real-Time Updates', desc: 'Keep information synchronized across the whole platform.' },
  { icon: Lock, title: 'Role-Based Access', desc: 'Give admins, professionals and patients appropriate access.' },
];

function SolutionSection() {
  return (
    <Section id="features" className="py-24 px-6 bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-playfair-display)' }}
          >
            Everything Your Healthcare Business Needs. <GradientText>In One Place.</GradientText>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.08, duration: 0.5 }}
                whileHover={{ y: -4, borderColor: 'rgba(244,63,94,0.35)' }}
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-rose-300" />
                </div>
                <h3 className="text-white font-semibold text-base mb-1.5">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Automation workflow                                                 */
/* ------------------------------------------------------------------ */

const WORKFLOW_STEPS = [
  { label: 'Patient books an appointment', icon: CalendarDays },
  { label: 'Appointment appears on the dashboard', icon: BarChart3 },
  { label: 'Staff receives an update', icon: Bell },
  { label: 'Patient status changes', icon: Users },
  { label: 'Records are updated', icon: FileText },
  { label: 'Payment & membership status updates', icon: CreditCard },
  { label: 'Management sees the activity', icon: ClipboardList },
];

function AutomationSection() {
  return (
    <Section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-playfair-display)' }}
          >
            Stop Doing Manually What <GradientText>Software Can Do Automatically.</GradientText>
          </h2>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute left-6 top-6 bottom-6 w-px bg-gradient-to-b from-rose-500/50 via-white/10 to-transparent" />
          <div className="space-y-4">
            {WORKFLOW_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="relative flex items-center gap-4 pl-0 md:pl-16"
                >
                  <div className="hidden md:flex absolute left-0 w-12 h-12 rounded-full bg-slate-900 border border-rose-500/40 items-center justify-center z-10">
                    <Icon className="w-5 h-5 text-rose-300" />
                  </div>
                  <div className="flex md:hidden w-10 h-10 rounded-full bg-slate-900 border border-rose-500/40 items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-rose-300" />
                  </div>
                  <div className="flex-1 px-5 py-4 rounded-xl bg-white/[0.03] border border-white/10 text-slate-200 text-sm sm:text-base">
                    {step.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Before / After                                                     */
/* ------------------------------------------------------------------ */

const BEFORE = ['Spreadsheets', 'Paper records', 'WhatsApp messages', 'Manual approvals', 'Scattered information', 'Difficult reporting'];
const AFTER = ['Centralized dashboard', 'Digital patient management', 'Automated workflows', 'Faster approvals', 'Real-time updates', 'Better reporting'];

function BeforeAfterSection() {
  return (
    <Section className="py-24 px-6 bg-slate-950">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white"
            style={{ fontFamily: 'var(--font-playfair-display)' }}
          >
            Before <GradientText>&amp;</GradientText> After
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-white/[0.02] border border-white/10"
          >
            <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Before</span>
            <h3 className="text-white text-xl font-semibold mt-2 mb-5">Manual processes</h3>
            <ul className="space-y-3">
              {BEFORE.map((item) => (
                <li key={item} className="flex items-center gap-3 text-slate-400 text-sm">
                  <X className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="p-8 rounded-2xl bg-gradient-to-br from-rose-600/10 to-transparent border border-rose-500/25"
          >
            <span className="text-[11px] uppercase tracking-[0.2em] text-rose-300 font-semibold">After</span>
            <h3 className="text-white text-xl font-semibold mt-2 mb-5">Automated operations</h3>
            <ul className="space-y-3">
              {AFTER.map((item) => (
                <li key={item} className="flex items-center gap-3 text-slate-200 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Role-based experience                                              */
/* ------------------------------------------------------------------ */

const ROLES = [
  {
    icon: Settings2,
    title: 'Admin',
    items: ['Users & staff', 'Appointments', 'Memberships & payments', 'Analytics', 'Business operations'],
  },
  {
    icon: Stethoscope,
    title: 'Healthcare Professional',
    items: ['Assigned patients', 'Appointments', 'Treatment & progress notes', 'Session status', 'Patient workflows'],
  },
  {
    icon: UserCircle,
    title: 'Patient',
    items: ['Profile', 'Appointments', 'Medical documents', 'Membership status', 'Progress & records'],
  },
];

function RoleSection() {
  return (
    <Section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-playfair-display)' }}
          >
            One Platform. <GradientText>Every Role Covered.</GradientText>
          </h2>
          <p className="text-slate-400 text-lg">
            Admins, healthcare professionals and patients each get an experience built for what
            they actually need to do.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {ROLES.map((role, i) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-7 rounded-2xl bg-white/[0.03] border border-white/10"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-600 to-rose-800 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-4">{role.title}</h3>
                <ul className="space-y-2.5">
                  {role.items.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-slate-400 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-rose-400/70 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Analytics section                                                  */
/* ------------------------------------------------------------------ */

function AnalyticsSection() {
  const stats = [
    { label: 'Appointments Today', value: 34 },
    { label: 'Active Patients', value: 812 },
    { label: 'Completed Sessions', value: 219 },
    { label: 'Pending Approvals', value: 6 },
  ];

  return (
    <Section className="py-24 px-6 bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-playfair-display)' }}
          >
            Know What&rsquo;s Happening <GradientText>Across Your Practice.</GradientText>
          </h2>
          <p className="text-slate-400 text-lg">Illustrative demo data — your dashboard reflects your own activity.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center"
            >
              <div className="text-3xl font-bold text-white mb-1">
                <AnimatedCounter value={stat.value} />
              </div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Security                                                           */
/* ------------------------------------------------------------------ */

function SecuritySection() {
  const points = [
    'Role-based access controls',
    'Secure authentication',
    'Controlled permissions per user type',
    'Secure document management',
    'Protected patient information',
  ];

  return (
    <Section className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <ShieldCheck className="w-10 h-10 text-rose-400 mx-auto mb-5" />
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5"
          style={{ fontFamily: 'var(--font-playfair-display)' }}
        >
          Your Data Deserves <GradientText>Serious Protection.</GradientText>
        </h2>
        <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
          Built with secure access controls for sensitive healthcare information — designed with
          healthcare data protection in mind at every layer.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto">
          {points.map((point) => (
            <div key={point} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
              <Lock className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span className="text-slate-300 text-sm">{point}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Flexibility                                                        */
/* ------------------------------------------------------------------ */

function FlexibilitySection() {
  return (
    <Section id="platform" className="py-24 px-6 bg-slate-950">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <Layers className="w-9 h-9 text-rose-400 mb-5" />
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-5 leading-tight"
            style={{ fontFamily: 'var(--font-playfair-display)' }}
          >
            Your Workflow Is Unique. <GradientText>Your Software Should Be Too.</GradientText>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Every healthcare business works differently. The platform can be configured around
            your team&rsquo;s workflow, branding, roles, services and operational requirements —
            without needing a different product for every specialty.
          </p>
        </div>
        <div className="space-y-3">
          {[
            { icon: Workflow, text: 'Custom appointment & service types' },
            { icon: Users, text: 'Configurable staff roles & permissions' },
            { icon: MessageSquareText, text: 'Branded patient-facing experience' },
          ].map((row) => (
            <div key={row.text} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <row.icon className="w-5 h-5 text-rose-300 flex-shrink-0" />
              <span className="text-slate-300 text-sm">{row.text}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  How it works                                                       */
/* ------------------------------------------------------------------ */

const STEPS = [
  { n: '01', title: 'Tell Us How You Work', desc: 'We understand your current workflow and operational challenges.' },
  { n: '02', title: 'Configure Your Platform', desc: 'Customize the system around your business and your team.' },
  { n: '03', title: 'Automate Your Operations', desc: 'Connect appointments, patients, staff, payments and workflows.' },
  { n: '04', title: 'Run Your Business Smarter', desc: 'Your team spends less time on repetitive administration.' },
];

function HowItWorksSection() {
  return (
    <Section id="how-it-works" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white"
            style={{ fontFamily: 'var(--font-playfair-display)' }}
          >
            How It <GradientText>Works</GradientText>
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/10"
            >
              <span className="text-4xl font-bold text-rose-500/25 leading-none">{step.n}</span>
              <h3 className="text-white font-semibold text-lg mt-3 mb-2">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              {i < STEPS.length - 1 && (
                <ArrowRight className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 w-5 h-5 text-slate-700" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  CTA section                                                        */
/* ------------------------------------------------------------------ */

function CTASection({ onSignup }: { onSignup: () => void }) {
  return (
    <Section className="py-24 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto p-10 md:p-14 rounded-3xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 border border-white/10 relative overflow-hidden text-center"
      >
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-rose-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-sky-600/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Stop Managing Everything Manually?
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
            See how your healthcare business could run with a smarter, more organized workflow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={onSignup}
              className="px-9 py-4 bg-gradient-to-r from-rose-600 to-rose-800 text-white font-semibold rounded-xl shadow-lg shadow-rose-900/30"
            >
              Book a Free Demo
            </motion.button>
            <motion.a
              href="#features"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="px-9 py-4 bg-white/5 text-white font-semibold rounded-xl border border-white/15 hover:bg-white/10 transition-colors"
            >
              Explore the Platform
            </motion.a>
          </div>
        </div>
      </motion.div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ                                                                 */
/* ------------------------------------------------------------------ */

const FAQS = [
  {
    q: 'What types of healthcare businesses can use the platform?',
    a: 'Dental clinics, physiotherapy practices, medical clinics, dermatology and aesthetic clinics, rehabilitation centers, specialist practices and other appointment-based healthcare businesses.',
  },
  {
    q: 'Is this software only for physiotherapy clinics?',
    a: 'No. Physiotherapy is one example workflow. The underlying platform is built to adapt to many types of healthcare and medical businesses.',
  },
  {
    q: 'Can the platform be customized for my clinic?',
    a: 'Yes. Appointment types, staff roles, services and workflows can be configured around how your business actually operates.',
  },
  {
    q: 'Can I manage appointments and patients?',
    a: 'Yes. Appointment scheduling and patient management are core parts of the platform.',
  },
  {
    q: 'Can different staff members have different permissions?',
    a: 'Yes. Role-based access lets admins, healthcare professionals and other staff see only what is relevant to their work.',
  },
  {
    q: 'Can I manage memberships and payments?',
    a: 'Yes. The platform includes membership management and payment and financial tracking.',
  },
  {
    q: 'Can patients access their information?',
    a: 'Yes. Patients can access their profile, appointments, documents and relevant records.',
  },
  {
    q: 'Does it work on mobile devices?',
    a: 'Yes. The platform is designed to work across desktop, tablet and mobile.',
  },
  {
    q: 'Can I request a demo?',
    a: 'Yes — use the "Book a Free Demo" button anywhere on this page to get started.',
  },
];

function FAQItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-white/10">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-white font-medium">{q}</span>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="text-slate-400 text-sm leading-relaxed pb-5">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <Section id="faq" className="py-24 px-6 bg-slate-950">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white"
            style={{ fontFamily: 'var(--font-playfair-display)' }}
          >
            Frequently Asked <GradientText>Questions</GradientText>
          </h2>
        </div>

        <div>
          {FAQS.map((faq, i) => (
            <FAQItem
              key={faq.q}
              q={faq.q}
              a={faq.a}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Staff / professional profiles preview (repurposed doctor grid)     */
/* ------------------------------------------------------------------ */

function StaffPreviewSection({ doctors }: { doctors: DoctorData[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<DoctorData | null>(null);

  return (
    <Section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-4">
          <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">
            Product Preview
          </span>
        </div>
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-playfair-display)' }}
          >
            This Is What <GradientText>Staff Profiles</GradientText> Look Like
          </h2>
          <p className="text-slate-400 text-lg">
            Example data across a few specialties — dental, dermatology, physiotherapy and general
            practice — showing how the platform organizes your team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.slice(0, 6).map((doctor, index) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelected(doctor)}
              className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-rose-500/30 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-600 to-rose-800 flex items-center justify-center border-2 border-rose-400/40 flex-shrink-0">
                  <span className="text-white font-bold text-lg">
                    {doctor.name.split(' ')[1]?.charAt(0) || doctor.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">{doctor.name}</h3>
                  <p className="text-rose-400 text-xs">{doctor.doctorProfile?.specialization}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{doctor.doctorProfile?.timings}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                <span>{doctor.doctorProfile?.availableDays?.join(', ')}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#111] to-black border border-white/10 shadow-2xl"
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 transition-all z-10"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <div className="p-8">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-24 h-24 mb-4 rounded-full bg-gradient-to-br from-rose-600 to-rose-800 flex items-center justify-center border-2 border-rose-400/50">
                    <span className="text-white font-bold text-3xl">
                      {selected.name.split(' ')[1]?.charAt(0) || selected.name.charAt(0)}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">{selected.name}</h2>
                  <p className="text-rose-400 font-medium">{selected.doctorProfile?.specialization}</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <Award className="w-5 h-5 text-rose-400 flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Education</p>
                      <p className="text-white text-sm">{selected.doctorProfile?.education}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <UserCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Experience</p>
                      <p className="text-white text-sm">{selected.doctorProfile?.experience}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <CalendarCheck className="w-5 h-5 text-rose-400 flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Availability</p>
                      <p className="text-white text-sm">{selected.doctorProfile?.availableDays?.join(', ')}</p>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelected(null);
                    router.push('/login');
                  }}
                  className="w-full py-4 bg-gradient-to-r from-rose-600 to-rose-800 text-white font-bold rounded-2xl shadow-lg shadow-rose-900/30 border border-white/10 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Book a Free Demo
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                              */
/* ------------------------------------------------------------------ */

function Footer() {
  const columns = [
    {
      title: 'Platform',
      links: [
        { label: 'Overview', href: '#platform' },
        { label: 'Solutions', href: '#solutions' },
        { label: 'Features', href: '#features' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'How It Works', href: '#how-it-works' },
        { label: 'FAQ', href: '#faq' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
      ],
    },
  ];

  return (
    <footer className="py-16 px-6 border-t border-white/10 bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-10">
          <div>
            <Logo width={170} height={56} showTagline={true} />
            <p className="text-slate-400 text-sm mt-4 max-w-xs leading-relaxed">
              Healthcare business automation for clinics and practices of every kind — appointments,
              patients, staff, memberships and payments, in one platform.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-white text-sm font-semibold mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <NextLink href={link.href} className="text-slate-400 hover:text-white text-sm transition-colors">
                      {link.label}
                    </NextLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs">&copy; 2026 Body Experts. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Root component                                                     */
/* ------------------------------------------------------------------ */

export default function LandingPage({ doctors }: LandingPageProps) {
  const router = useRouter();
  const displayedDoctors = doctors && doctors.length > 0 ? doctors : DUMMY_DOCTORS;

  const goToLogin = () => router.push('/login');

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar onLogin={goToLogin} onSignup={goToLogin} />
      <HeroSection onLogin={goToLogin} onSignup={goToLogin} />
      <IndustriesSection />
      <ProblemSection />
      <SolutionSection />
      <AutomationSection />
      <BeforeAfterSection />
      <RoleSection />

      <Section className="py-24 px-6 bg-slate-900/30">
        <RoleBasedQuotes role="guest" />
      </Section>

      <AnalyticsSection />
      <StaffPreviewSection doctors={displayedDoctors} />
      <SecuritySection />
      <FlexibilitySection />
      <HowItWorksSection />
      <CTASection onSignup={goToLogin} />
      <FAQSection />
      <Footer />
    </div>
  );
}