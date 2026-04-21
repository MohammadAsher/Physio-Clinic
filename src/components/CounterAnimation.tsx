'use client';

import { useEffect, useRef } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

interface CounterAnimationProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export default function CounterAnimation({
  value,
  duration = 2,
  suffix = '',
  prefix = '',
  className = '',
}: CounterAnimationProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const spring = useSpring(0, {
    duration: duration * 1000,
    stiffness: 100,
    damping: 30,
    mass: 1,
  });

  const displayValue = useTransform(spring, (latest) => Math.round(latest));

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, value, spring]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5 }}
    >
      {isInView ? (
        <>
          {prefix}
          <motion.span>{displayValue}</motion.span>
          {suffix}
        </>
      ) : (
        `${prefix}0${suffix}`
      )}
    </motion.span>
  );
}
