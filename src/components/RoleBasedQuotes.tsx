'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  // Patient Motivational Quotes
  { text: "Health is a state of body. Wellness is a state of being.", author: "J. Stanford", role: 'patient' },
  { text: "The greatest wealth is health.", author: "Virgil", role: 'patient' },
  { text: "Nourishing yourself is a safer way to live.", author: "Unknown", role: 'patient' },
  { text: "Recovery is not about returning to who you were, but becoming who you can be.", author: "Unknown", role: 'patient' },
  { text: "Every recovery is a journey, not a destination. Celebrate each step forward.", author: "Unknown", role: 'patient' },
  { text: "The human body is a self-healing machine. Give it the right conditions and watch it thrive.", author: "Anonymous", role: 'patient' },
  { text: "Every inch of progress is a victory. Patience and persistence heal.", author: "Physiotherapy Wisdom", role: 'patient' },
  { text: "Your strength is not defined by your body's current state, but by your spirit's determination.", author: "Unknown", role: 'patient' },

  // Doctor/Healer Professional Quotes
  { text: "The physician treats, but nature heals.", author: "Aristotle", role: 'doctor' },
  { text: "Where the art of medicine is loved, there is also a love of humanity.", author: "Hippocrates", role: 'doctor' },
  { text: "Focus on the progress, not the pain.", author: "Unknown", role: 'doctor' },
  { text: "The good physician treats the disease; the great physician treats the patient who has the disease.", author: "William Osler", role: 'doctor' },
  { text: "Healing is a matter of time, but it is sometimes also a matter of opportunity.", author: "Hippocrates", role: 'doctor' },
  { text: "To cure sometimes, to relieve often, to comfort always.", author: "Edward Livingston Trudeau", role: 'doctor' },

  // Admin/Management Quotes
  { text: "Management is doing things right; leadership is doing the right things.", author: "Peter Drucker", role: 'admin' },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney", role: 'admin' },
  { text: "Organize. Implement. Succeed.", author: "Unknown", role: 'admin' },
  { text: "Efficiency is doing things right; effectiveness is doing the right things.", author: "Peter Drucker", role: 'admin' },
  { text: "Success is not the key to happiness. Happiness is the key to success.", author: "Albert Schweitzer", role: 'admin' },

  // Therapist Specific Quotes
  { text: "The therapist's touch can awaken the body's own wisdom to heal.", author: "Unknown", role: 'therapist' },
  { text: "Movement is the language of the body. Therapy is the poetry of healing.", author: "Anonymous", role: 'therapist' },
  { text: "We don't just treat conditions; we restore possibilities.", author: "Physical Therapy Manifesto", role: 'therapist' },
  { text: "Every joint mobilized, every muscle stretched, is a step toward independence.", author: "Therapy Philosophy", role: 'therapist' },
];

export default function RoleBasedQuotes({ role = 'guest', interval = 6000, className = '' }: RoleBasedQuotesProps) {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // Filter quotes based on role
  const filteredQuotes = quotes.filter((quote) => {
    if (role === 'doctor' || role === 'therapist') {
      return quote.role === 'doctor' || quote.role === 'therapist';
    }
    return quote.role === role;
  });

  useEffect(() => {
    // Reset index when role changes
    setCurrentQuoteIndex(0);
  }, [role]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % filteredQuotes.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval, filteredQuotes.length]);

  if (filteredQuotes.length === 0) return null;

  const currentQuote = filteredQuotes[currentQuoteIndex];

  const variants = {
    enter: (dir: number) => ({
      opacity: 0,
      scale: 0.95,
      y: 30,
    }),
    center: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        opacity: { duration: 0.6, ease: 'easeOut' },
        scale: { duration: 0.6, ease: 'easeOut' },
        y: { duration: 0.6, ease: 'easeOut' },
      }
    },
    exit: (dir: number) => ({
      opacity: 0,
      scale: 0.95,
      y: -30,
      transition: {
        duration: 0.4,
      },
    }),
   };

  return (
    <div className={`relative max-w-3xl mx-auto px-6 ${className}`}>

      <div className="relative min-h-[200px] flex items-center justify-center">
         <AnimatePresence mode="wait">
          <motion.div
            key={currentQuoteIndex}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
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
           role === 'doctor' ? 'Medical Wisdom' :
           role === 'therapist' ? 'Therapy Focus' : 'Management'}
        </span>
      </div>
    </div>
  );
}
