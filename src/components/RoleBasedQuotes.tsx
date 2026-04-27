'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote } from 'lucide-react';

// Types
export type UserRole = 'patient' | 'doctor' | 'therapist' | 'admin' | 'guest';

interface QuoteData {
  text: string;
  author: string;
  role: UserRole | 'all';
}

interface RoleBasedQuotesProps {
  role?: UserRole; // 'patient', 'doctor', 'therapist', 'admin', or 'guest' (default for landing)
  interval?: number; // How often to switch quotes (ms)
  className?: string;
}

// Quote database
const quotes: QuoteData[] = [
  // General Health Quotes (for landing page / all roles)
  { text: "The greatest wealth is health.", author: "Virgil", role: 'all' },
  { text: "Health is a state of body. Wellness is a state of being.", author: "J. Stanford", role: 'all' },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn", role: 'all' },
  { text: "A healthy outside starts from the inside.", author: "Robert Urich", role: 'all' },
  { text: "Your body hears everything your mind says.", author: "Naomi Judd", role: 'all' },

  // Patient Motivational Quotes
  { text: "Every recovery is a journey, not a destination. Celebrate each step forward.", author: "Unknown", role: 'patient' },
  { text: "Your strength is not defined by your body's current state, but by your spirit's determination.", author: "Unknown", role: 'patient' },
  { text: "The human body is a self-healing machine. Give it the right conditions and watch it thrive.", author: "Anonymous", role: 'patient' },
  { text: "Every inch of progress is a victory. Patience and persistence heal.", author: "Physiotherapy Wisdom", role: 'patient' },
  { text: "Recovery is not about returning to who you were, but becoming who you can be.", author: "Unknown", role: 'patient' },

  // Doctor/Healer Professional Quotes
  { text: "The good physician treats the disease; the great physician treats the patient who has the disease.", author: "William Osler", role: 'doctor' },
  { text: "Healing is a matter of time, but it is sometimes also a matter of opportunity.", author: "Hippocrates", role: 'doctor' },
  { text: "Wherever the art of medicine is loved, there is also a love of humanity.", author: "Hippocrates", role: 'doctor' },
  { text: "The art of healing comes from nature, not from the physician.", author: "Paracelsus", role: 'doctor' },
  { text: "To cure sometimes, to relieve often, to comfort always.", author: "Edward Livingston Trudeau", role: 'doctor' },

  // Therapist Specific Quotes
  { text: "The therapist's touch can awaken the body's own wisdom to heal.", author: "Unknown", role: 'therapist' },
  { text: "Movement is the language of the body. Therapy is the poetry of healing.", author: "Anonymous", role: 'therapist' },
  { text: "We don't just treat conditions; we restore possibilities.", author: "Physical Therapy Manifesto", role: 'therapist' },
  { text: "Every joint mobilized, every muscle stretched, is a step toward independence.", author: "Therapy Philosophy", role: 'therapist' },
];

export default function RoleBasedQuotes({ role = 'guest', interval = 6000, className = '' }: RoleBasedQuotesProps) {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  // Filter quotes based on role
  const filteredQuotes = quotes.filter((quote) => {
    if (quote.role === 'all') return true;
    if (role === 'doctor' || role === 'therapist') {
      return quote.role === 'doctor' || quote.role === 'therapist' || quote.role === 'all';
    }
    return quote.role === role || quote.role === 'all';
  });

  useEffect(() => {
    // Reset index when role changes
    setCurrentQuoteIndex(0);
  }, [role]);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentQuoteIndex((prev) => (prev + 1) % filteredQuotes.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval, filteredQuotes.length]);

  if (filteredQuotes.length === 0) return null;

  const currentQuote = filteredQuotes[currentQuoteIndex];

  const variants = {
    enter: (dir: number) => ({
      opacity: 0,
      scale: 0.9,
      y: dir > 0 ? 20 : -20,
    }),
    center: {
      opacity: 1,
      scale: 1,
      y: 0,
    },
    exit: (dir: number) => ({
      opacity: 0,
      scale: 0.9,
      y: dir < 0 ? 20 : -20,
    }),
  };

  return (
    <div className={`relative max-w-3xl mx-auto px-6 ${className}`}>
      {/* Decorative Elements */}
      <div className="absolute -top-8 -left-4 text-rose-500/20">
        <Quote className="w-16 h-16" />
      </div>
      <div className="absolute -bottom-8 -right-4 text-rose-500/20 rotate-180">
        <Quote className="w-16 h-16" />
      </div>

      <div className="relative min-h-[200px] flex items-center justify-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQuoteIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              opacity: { duration: 0.5 },
              scale: { duration: 0.5 },
              y: { duration: 0.5 },
            }}
            className="text-center px-8 py-6"
          >
            <blockquote 
              className="text-2xl md:text-3xl font-serif text-white mb-6 leading-relaxed"
              style={{ fontFamily: 'var(--font-playfair-display)' }}
            >
              "{currentQuote.text}"
            </blockquote>
            
            <div className="flex items-center justify-center gap-2">
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
              <cite className="text-rose-300 text-sm md:text-base not-italic font-medium">
                — {currentQuote.author}
              </cite>
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Quote Category Indicator */}
      <div className="flex justify-center mt-6">
        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 uppercase tracking-wider">
          {role === 'guest' ? 'Health Inspiration' : 
           role === 'patient' ? 'Patient Motivation' :
           role === 'doctor' ? 'Medical Wisdom' : 'Healing Art'}
        </span>
      </div>
    </div>
  );
}
