'use client';

import { motion } from 'framer-motion';
import { Sun, Moon, CloudSun } from 'lucide-react';
import { useMemo } from 'react';

interface SmartGreetingProps {
  name: string;
  className?: string;
}

export default function SmartGreeting({ name, className = '' }: SmartGreetingProps) {
  // Fix: Yahan key names ko match kar diya gaya hai
  const { timeOfDay, Icon, accentColor, glowColor } = useMemo(() => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return {
        timeOfDay: 'Morning',
        Icon: Sun,
        accentColor: 'from-amber-400 to-orange-500',
        glowColor: 'shadow-amber-500/20',
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        timeOfDay: 'Afternoon',
        Icon: CloudSun,
        accentColor: 'from-sky-400 to-blue-500',
        glowColor: 'shadow-sky-500/20',
      };
    } else {
      return {
        timeOfDay: 'Evening',
        Icon: Moon,
        accentColor: 'from-indigo-400 to-purple-600',
        glowColor: 'shadow-indigo-500/20',
      };
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`premium-glass p-4 flex items-center gap-4 ${className}`}
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className={`p-3 rounded-xl bg-gradient-to-br ${accentColor} shadow-lg ${glowColor}`}
      >
        {/* Ab Icon undefined nahi hoga */}
        <Icon className="w-6 h-6 text-white" />
      </motion.div>
      <div className="flex-1">
        <p className="text-slate-400 text-sm uppercase tracking-wider">Good {timeOfDay}</p>
        <h2 className="text-2xl font-bold text-white">
          {name?.split(' ')[0]}! <span className="text-rose-500">Ready to heal?</span>
        </h2>
      </div>
    </motion.div>
  );
}