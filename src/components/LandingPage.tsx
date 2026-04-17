'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Activity, Heart, Brain, Baby, Dumbbell, ArrowRight, CheckCircle } from 'lucide-react';

const services = [
  {
    id: 1,
    title: 'Orthopedic Physio',
    description: 'Specialized treatment for bone, joint, and muscle injuries. Ideal for post-surgery recovery and fracture rehab.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop',
    icon: 'bone',
  },
  {
    id: 2,
    title: 'Neurological Physio',
    description: 'Focused care for Stroke, Parkinson\'s, and Spinal injuries to restore motor functions.',
    image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&h=400&fit=crop',
    icon: 'brain',
  },
  {
    id: 3,
    title: 'Sports Physio',
    description: 'Performance-based recovery for athletes to get back in the game faster and prevent future injuries.',
    image: 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=600&h=400&fit=crop',
    icon: 'dumbbell',
  },
  {
    id: 4,
    title: 'Pediatric Physio',
    description: 'Supporting physical development and mobility in children with congenital or acquired conditions.',
    image: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=600&h=400&fit=crop',
    icon: 'baby',
  },
];

const serviceIcons: Record<string, React.ReactNode> = {
  bone: <Activity className="w-8 h-8" />,
  brain: <Brain className="w-8 h-8" />,
  dumbbell: <Dumbbell className="w-8 h-8" />,
  baby: <Baby className="w-8 h-8" />,
};

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

function HeroSection({ onLogin, onSignup }: HeroSectionProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

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

      <motion.div style={{ opacity }} className="relative z-10 max-w-6xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="inline-block px-4 py-2 rounded-full glass-card text-sm text-slate-300 mb-6">
            Premium Healthcare Experience
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-5xl md:text-7xl font-bold mb-6"
        >
          <span className="text-gradient">Revitalize Your Movement,</span>
          <br />
          <span className="text-white">Reclaim Your Life.</span>
        </motion.h1>

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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSignup}
            className="glass-button px-8 py-4 text-lg flex items-center justify-center gap-2"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogin}
            className="glass-button secondary px-8 py-4 text-lg"
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Physio Clinic</h3>
              <p className="text-slate-400 text-sm">Premium Care</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm">
            &copy; 2026 Physio Clinic. All rights reserved.
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

export default function LandingPage({ onLogin, onSignup }: LandingPageProps) {
  return (
    <div className="min-h-screen">
      <HeroSection onLogin={onLogin} onSignup={onSignup} />
      <WhatIsPhysiotherapySection />
      <ServicesSection />
      <CTASection onSignup={onSignup} />
      <Footer />
    </div>
  );
}