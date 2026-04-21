'use client';

import { motion } from 'framer-motion';
import { Sun, Moon, CloudSun, CloudMoon } from 'lucide-react';
import { useMemo } from 'react';

interface SmartGreetingProps {
  name: string;
  className?: string;
}

export default function SmartGreeting({ name, className = '' }: SmartGreetingProps) {
  const { timeOfDay, icon: Icon, accentColor } = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return {
        timeOfDay: 'Morning',
        Icon: Sun,
        accentColor: 'from-amber-400 to-orange-500',
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        timeOfDay: 'Afternoon',
        Icon: CloudSun,
        accentColor: 'from-sky-400 to-blue-500',
      };
    } else {
      return {
        timeOfDay: 'Evening',
        Icon: Moon,
        accentColor: 'from-indigo-400 to-purple-600',
      };
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`flex items-center gap-3 ${className}`}
    >
      <div className={`p-2 rounded-xl bg-gradient-to-br ${accentColor} shadow-lg shadow-${accentColor.split(' ')[0].replace('from-', '')}/20`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-slate-400 text-sm">Good {timeOfDay}</p>
        <h2 className="text-2xl font-bold text-white">
          {name.split(' ')[0]}! <span className="text-gold">Ready to heal?</span>
        </h2>
      </div>
    </motion.div>
  );
}
