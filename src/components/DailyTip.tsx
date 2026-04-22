'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Sparkles, Heart, Activity, ChevronLeft, ChevronRight } from 'lucide-react';

const PHYSIOTHERAPY_TIPS = [
  "Take a 5-minute stretch break every hour to improve circulation and reduce muscle tension.",
  "Stay hydrated! Aim for 8 glasses of water daily to support muscle recovery and joint health.",
  "Practice deep breathing exercises for 5 minutes to reduce stress and improve oxygen flow to muscles.",
  "Maintain good posture while sitting—keep your back straight and feet flat on the floor.",
  "Warm up before any exercise with 5-10 minutes of light cardio to prevent injuries.",
  "Sleep on a medium-firm mattress to support spinal alignment and reduce back pain.",
  "Incorporate balance exercises like standing on one foot to improve stability and prevent falls.",
  "Use ice for acute injuries (15-20 minutes) to reduce swelling and pain.",
  "Apply heat for chronic stiffness (15-20 minutes) to increase blood flow and relax muscles.",
  "Listen to your body—pain is a signal to stop or modify the activity.",
  "Strengthen your core with planks and bridges to support your lower back.",
  "Take short walks after meals to aid digestion and improve overall mobility.",
  "Practice neck stretches every 30 minutes if you work at a desk all day.",
  "Wear supportive shoes with proper arch support to reduce impact on joints.",
  "Include protein-rich foods in your diet to support muscle repair and growth.",
  "Use a foam roller daily to release muscle tightness and improve flexibility.",
  "Avoid prolonged sitting—set a timer to stand up and move every 30 minutes.",
  "Practice mindfulness meditation for 10 minutes daily to manage pain perception.",
  "Gradually increase exercise intensity—the 10% rule: don't increase more than 10% per week.",
  "Celebrate small victories in your recovery journey to stay motivated and positive.",
];

interface DailyTipProps {
  className?: string;
}

export default function DailyTip({ className = '' }: DailyTipProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // Get one tip per day using localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('dailyTipDate');
    let storedIndex = parseInt(localStorage.getItem('dailyTipIndex') || '0', 10);
    
    if (storedDate !== today) {
      storedIndex = Math.floor(Math.random() * PHYSIOTHERAPY_TIPS.length);
      localStorage.setItem('dailyTipDate', today);
      localStorage.setItem('dailyTipIndex', storedIndex.toString());
    }
    setCurrentTipIndex(storedIndex);
  }, []);

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % PHYSIOTHERAPY_TIPS.length);
  };

  const prevTip = () => {
    setCurrentTipIndex((prev) => (prev - 1 + PHYSIOTHERAPY_TIPS.length) % PHYSIOTHERAPY_TIPS.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`premium-glass p-6 ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 10 }}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30"
        >
          <Lightbulb className="w-5 h-5 text-white" />
        </motion.div>
        <div>
          <h3 className="text-lg font-semibold text-white">Daily Wellness Tip</h3>
          <p className="text-slate-400 text-xs">Your health, our priority</p>
        </div>
      </div>

      <div className="relative min-h-[120px] flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTipIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            <p className="text-slate-300 text-base leading-relaxed">
              {PHYSIOTHERAPY_TIPS[currentTipIndex]}
            </p>
            <div className="flex items-center gap-2 mt-3 text-slate-500 text-xs">
              <Sparkles className="w-3 h-3" />
              <span>Tip #{currentTipIndex + 1} of {PHYSIOTHERAPY_TIPS.length}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={prevTip}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-400" />
        </motion.button>

        <div className="flex gap-1">
          {PHYSIOTHERAPY_TIPS.slice(0, 5).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentTipIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentTipIndex % 5
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 w-4'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            />
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={nextTip}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </motion.button>
      </div>
    </motion.div>
  );
}
