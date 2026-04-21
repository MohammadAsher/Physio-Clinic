'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'red' | 'blue' | 'amber' | 'emerald';
  className?: string;
}

const colorClasses = {
  red: 'stroke-red-500',
  blue: 'stroke-blue-500',
  amber: 'stroke-amber-500',
  emerald: 'stroke-emerald-500',
};

export default function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  label,
  showPercentage = true,
  color = 'red',
  className = '',
}: CircularProgressProps) {
  const [displayedValue, setDisplayedValue] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / max) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayedValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#gradient-${color})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
        />
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
            {color === 'red' && (
              <>
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#ef4444" />
              </>
            )}
            {color === 'blue' && (
              <>
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#38bdf8" />
              </>
            )}
            {color === 'amber' && (
              <>
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#fbbf24" />
              </>
            )}
            {color === 'emerald' && (
              <>
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </>
            )}
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute flex flex-col items-center justify-center">
        <motion.span
          className="text-2xl font-bold text-white"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
        >
          {displayedValue}
          {showPercentage && <span className="text-lg text-slate-400">%</span>}
        </motion.span>
        {label && (
          <span className="text-xs text-slate-400 mt-1">{label}</span>
        )}
      </div>
    </div>
  );
}
