'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { Activity, Heart, Brain, Baby, Dumbbell, Bone, ArrowRight, CheckCircle, Clock, Calendar, X, UserCircle, Award, CalendarCheck, Sparkles } from 'lucide-react';
import Logo from './Logo';

interface DoctorData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'doctor';
  avatar?: string;
  profileCompleted?: boolean;
  doctorProfile?: {
    education?: string;
    experience?: string;
    specialization?: string;
    availableDays?: string[];
    timings?: string;
  };
}

interface LandingPageProps {
  onLogin: () => void;
  onSignup: () => void;
  doctors?: DoctorData[];
}

const services = [
  {
    id: 1,
    title: "Children's Therapy",
    description: "Gentle, playful therapy techniques to support motor development, improve mobility, and address congenital conditions in children.",
    image: 'https://images.unsplash.com/photo-1584030373081-f37b4bb6a921?w=600&h=400&fit=crop',
    icon: 'baby',
  },
  {
    id: 2,
    title: 'Ortho-Neuro-Sports Physiotherapy',
    description: 'Comprehensive care covering orthopedic injury recovery, neurological rehabilitation, and sports performance enhancement in one place.',
    image: 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=600&h=400&fit=crop',
    icon: 'activity',
  },
  {
    id: 3,
    title: 'Back & Neck Pain Treatment',
    description: 'Specialized manual therapy and exercises to alleviate chronic back and neck pain, improve posture, and restore spinal health.',
    image: 'https://images.unsplash.com/photo-1562375732-d7-5862d2d5f3b?w=600&h=400&fit=crop',
    icon: 'bone',
  },
  {
    id: 4,
    title: 'Neuro Rehabilitation',
    description: 'Focused rehabilitation for stroke, Parkinson\'s, and spinal cord injuries to regain motor function and independence.',
    image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&h=400&fit=crop',
    icon: 'brain',
  },
];

const serviceIcons: Record<string, React.ReactNode> = {
  baby: <Baby className="w-8 h-8" />,
  activity: <Activity className="w-8 h-8" />,
  bone: <Bone className="w-8 h-8" />,
  brain: <Brain className="w-8 h-8" />,
};

const DUMMY_DOCTORS: DoctorData[] = [
  {
    id: 'dummy1',
    name: 'Dr. Sarah Ahmed',
    email: 'sarah@physio.com',
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
    email: 'ali@physio.com',
    phone: '+1234567891',
    role: 'doctor',
    profileCompleted: true,
    doctorProfile: {
      education: 'Masters in Orthopedic Physio, AKU',
      experience: '12 years',
      specialization: 'Orthopedic Therapy',
      availableDays: ['Tuesday', 'Thursday', 'Saturday'],
      timings: '10:00 AM - 6:00 PM',
    },
  },
  {
    id: 'dummy3',
    name: 'Dr. Fatima Khan',
    email: 'fatima@physio.com',
    phone: '+1234567892',
    role: 'doctor',
    profileCompleted: true,
    doctorProfile: {
      education: 'Neurological PT Specialist, UCLA',
      experience: '10 years',
      specialization: 'Neurological Rehab',
      availableDays: ['Monday', 'Tuesday', 'Thursday'],
      timings: '8:00 AM - 4:00 PM',
    },
  },
  {
    id: 'dummy4',
    name: 'Dr. Ahmed Raza',
    email: 'ahmed@physio.com',
    phone: '+1234567893',
    role: 'doctor',
    profileCompleted: true,
    doctorProfile: {
      education: 'Sports PT Certification, UK',
      experience: '8 years',
      specialization: 'Sports Injuries',
      availableDays: ['Wednesday', 'Friday', 'Saturday'],
      timings: '11:00 AM - 7:00 PM',
    },
  },
  {
    id: 'dummy5',
    name: 'Dr. Aisha Malik',
    email: 'aisha@physio.com',
    phone: '+1234567894',
    role: 'doctor',
    profileCompleted: true,
    doctorProfile: {
      education: 'Pediatric PT Specialist, Canada',
      experience: '6 years',
      specialization: 'Pediatric Care',
      availableDays: ['Monday', 'Tuesday', 'Wednesday'],
      timings: '9:00 AM - 3:00 PM',
    },
  },
  {
    id: 'dummy6',
    name: 'Dr. Omar Sheikh',
    email: 'omar@physio.com',
    phone: '+1234567895',
    role: 'doctor',
    profileCompleted: true,
    doctorProfile: {
      education: 'Manual Therapy Expert, Germany',
      experience: '20 years',
      specialization: 'Manual Therapy',
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timings: '8:00 AM - 8:00 PM',
    },
  },
];

interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

function Section({ children, className }: SectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

interface HeroSectionProps {
  onLogin: () => void;
  onSignup: () => void;
}

function HeroSection({ onLogin, onSignup, doctors }: HeroSectionProps & { doctors?: DoctorData[] }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const displayedDoctors = doctors && doctors.length > 0 ? doctors : DUMMY_DOCTORS;

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1920&h=1080&fit=crop')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50" />
      </motion.div>

      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-black/50 backdrop-blur-md border-b border-white/10"
      >
        <div className="flex items-center">
          <Logo width={200} height={64} className="cursor-pointer" showTagline={true} />
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onLogin}
            className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={onSignup}
            className="px-4 py-2 bg-gradient-to-r from-rose-600 to-crimson-700 text-white text-sm font-medium rounded-lg"
          >
            Get Started
          </button>
        </div>
      </motion.nav>

      <motion.div style={{ opacity }} className="relative z-10 max-w-6xl mx-auto px-4 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto"
        >
          Expert physiotherapy tailored to your recovery journey. Track your progress, manage sessions, and heal faster.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 8px 32px rgba(225, 29, 72, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={onSignup}
            className="px-8 py-4 text-lg flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-crimson-700 text-white font-bold rounded-2xl shadow-lg shadow-rose-900/30 backdrop-blur-xl border border-white/10 hover:border-rose-500/30 transition-all"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 8px 32px rgba(255, 255, 255, 0.1)' }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogin}
            className="px-8 py-4 text-lg bg-white/5 text-white font-bold rounded-2xl border border-white/10 backdrop-blur-xl shadow-lg hover:border-white/20 transition-all"
          >
            Sign In
          </motion.button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 rounded-full border-2 border-slate-400 flex justify-center pt-2"
        >
          <motion.div className="w-1 h-2 bg-slate-400 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function WhatIsPhysiotherapySection() {
  return (
    <Section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="glass-card p-8 md:p-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl red-gradient flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">What is Physiotherapy?</h2>
          </div>

          <p className="text-lg text-slate-300 leading-relaxed mb-6">
            Physiotherapy is a healthcare profession that uses evidence-based techniques to restore, maintain, and maximize functional movement and overall well-being. Through personalized treatment plans, our expert therapists help patients recover from injuries, manage chronic conditions, and improve their quality of life.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {[
              'Movement Assessment',
              'Manual Therapy',
              'Exercise Prescription',
              'Pain Management',
              'Rehabilitation',
              'Prevention',
            ].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
              >
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-slate-300 text-sm">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

function ServicesSection() {
  return (
    <Section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Our <span className="text-gradient">Specialized Services</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Comprehensive physiotherapy solutions tailored to your specific needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="glass-card overflow-hidden group cursor-pointer"
            >
              <div className="relative h-48 overflow-hidden">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url('${service.image}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                <div className="absolute bottom-4 left-4 w-10 h-10 rounded-lg red-gradient flex items-center justify-center text-white">
                  {serviceIcons[service.icon]}
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function WhyChooseUsSection() {
  const benefits = [
    { title: 'Expert Therapists', description: 'Certified professionals with years of experience in specialized physiotherapy.' },
    { title: 'Personalized Care', description: 'Tailored treatment plans designed specifically for your unique condition.' },
    { title: 'Modern Facilities', description: 'State-of-the-art equipment and comfortable treatment rooms.' },
    { title: 'Flexible Scheduling', description: 'Appointment times that fit your busy lifestyle.' },
  ];

  return (
    <Section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Why Choose <span className="text-gradient">Us</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Experience the difference of quality healthcare
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="glass-card p-6 text-center"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl red-gradient flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
              <p className="text-slate-400 text-sm">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function CTASection({ onSignup }: { onSignup: () => void }) {
  return (
    <Section className="py-20 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto glass-card p-8 md:p-12 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 red-gradient opacity-20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 blue-gradient opacity-20 rounded-full blur-3xl" />

        <div className="relative z-10 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Start Your Recovery Journey Today
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of patients who have transformed their lives with our expert physiotherapy care.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSignup}
            className="glass-button px-10 py-4 text-lg"
          >
            Book Your First Session
          </motion.button>
        </div>
      </motion.div>
    </Section>
  );
}

function Footer() {
  return (
    <footer className="py-12 px-4 border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center">
            <Logo width={180} height={60} showTagline={true} />
          </div>
          <p className="text-slate-400 text-sm">
            &copy; 2026 Body Experts. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

interface LandingPageProps {
  onLogin: () => void;
  onSignup: () => void;
}

export default function LandingPage({ onLogin, onSignup, doctors }: LandingPageProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorData | null>(null);
  const displayedDoctors = doctors && doctors.length > 0 ? doctors : DUMMY_DOCTORS;

  return (
    <div className="min-h-screen bg-slate-950">
      <HeroSection onLogin={onLogin} onSignup={onSignup} doctors={displayedDoctors} />

      <ServicesSection />
      
      <WhyChooseUsSection />
      <CTASection onSignup={onSignup} />

      <div className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-gradient text-center mb-4">Our Expert Doctors</h2>
          <p className="text-slate-400 text-center mb-12">Meet our team of specialized physiotherapists</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedDoctors.slice(0, 6).map((doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedDoctor(doctor)}
                className="group relative p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-rose-500/30 hover:shadow-lg hover:shadow-rose-500/10 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600 to-crimson-700 flex items-center justify-center border border-white/10 shadow-lg shadow-rose-900/20">
                    <span className="text-white font-bold text-xl">
                      {doctor.name.split(' ')[1]?.charAt(0) || doctor.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{doctor.name}</h3>
                    <p className="text-rose-400 text-sm">{doctor.doctorProfile?.specialization}</p>
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-3">{doctor.doctorProfile?.education}</p>
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                  <Clock className="w-4 h-4" />
                  <span>{doctor.doctorProfile?.timings}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{doctor.doctorProfile?.availableDays?.join(', ')}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedDoctor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.6, bounce: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#111] to-black border border-white/10 shadow-2xl"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-rose-500/10 blur-3xl pointer-events-none" />
              
              <button
                onClick={() => setSelectedDoctor(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 transition-all z-10"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <div className="relative p-8">
                <div className="flex flex-col items-center text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                    className="w-28 h-28 mb-4 rounded-2xl bg-gradient-to-br from-rose-600 to-crimson-700 flex items-center justify-center border border-white/10 shadow-lg shadow-rose-900/30"
                  >
                    <span className="text-white font-bold text-4xl">
                      {selectedDoctor.name.split(' ')[1]?.charAt(0) || selectedDoctor.name.charAt(0)}
                    </span>
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedDoctor.name}</h2>
                  <p className="text-rose-400 font-medium">{selectedDoctor.doctorProfile?.specialization}</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <Award className="w-5 h-5 text-rose-400" />
                    <div className="text-left">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Education</p>
                      <p className="text-white text-sm">{selectedDoctor.doctorProfile?.education}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <UserCircle className="w-5 h-5 text-rose-400" />
                    <div className="text-left">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Experience</p>
                      <p className="text-white text-sm">{selectedDoctor.doctorProfile?.experience}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <CalendarCheck className="w-5 h-5 text-rose-400" />
                    <div className="text-left">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Availability</p>
                      <p className="text-white text-sm">{selectedDoctor.doctorProfile?.availableDays?.join(', ')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <Clock className="w-5 h-5 text-rose-400" />
                    <div className="text-left">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Timings</p>
                      <p className="text-white text-sm">{selectedDoctor.doctorProfile?.timings}</p>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(225, 29, 72, 0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedDoctor(null);
                    onSignup();
                  }}
                  className="w-full py-4 bg-gradient-to-r from-rose-600 to-crimson-700 text-white font-bold rounded-2xl shadow-lg shadow-rose-900/30 border border-white/10 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Book Appointment
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}